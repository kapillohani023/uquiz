"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/app/auth";
import * as db from "@/lib/db";
import { fetchYoutubeVideoMeta } from "@/lib/services";
import { extractYoutubeVideoId } from "@/lib/youtube";
import { generateQuizQuestions } from "@/lib/agents/generateQuiz";
import { runYoutubeTranscriptAgent } from "@/lib/agents/transcriptAgent";

const MAX_VIDEO_DURATION_SECONDS = 90 * 60;

/**
 * Fetches and distills the transcript for a resource in the background
 * (scheduled via `after`, so it runs after the response is sent), then
 * flips the resource to READY or FAILED.
 */
async function runTranscriptAgentAndSave(resourceId: string, url: string) {
  try {
    const transcript = await runYoutubeTranscriptAgent(url);
    await db.markResourceReady(resourceId, transcript);
  } catch (error) {
    console.error(`Transcript agent failed for resource ${resourceId}:`, error);
    await db.markResourceFailed(resourceId);
  }
}

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function createCourseAction(name: string) {
  const userId = await requireUserId();
  const course = await db.createCourse(userId, name.trim());
  revalidatePath("/");
  return { id: course.id };
}

export async function deleteCourseAction(courseId: string) {
  const userId = await requireUserId();
  await db.deleteCourse(userId, courseId);
  revalidatePath("/");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/signin" });
}

export async function deleteAccountAction() {
  const userId = await requireUserId();
  await db.deleteUser(userId);
  await signOut({ redirectTo: "/signin" });
}

export async function addResourceAction(
  courseId: string,
  url: string,
  title: string,
): Promise<{ error?: string; resourceId?: string }> {
  const userId = await requireUserId();

  const videoId = extractYoutubeVideoId(url);
  if (!videoId) {
    return { error: "That doesn't look like a YouTube video URL." };
  }

  let videoMeta;
  try {
    videoMeta = await fetchYoutubeVideoMeta(videoId);
  } catch {
    return { error: "Couldn't reach YouTube to verify the video. Try again." };
  }
  if (!videoMeta) {
    return { error: "No YouTube video exists at that URL." };
  }
  if (videoMeta.durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
    return { error: "That video is longer than 90 minutes — pick a shorter one." };
  }

  const resource = await db.addResource(userId, courseId, {
    title: title.trim() || videoMeta.title,
    url: url.trim().replace(/^https?:\/\//, ""),
    meta: videoMeta,
  });

  const fullUrl = `https://${resource.url}`;
  after(() => runTranscriptAgentAndSave(resource.id, fullUrl));

  revalidatePath(`/courses/${courseId}`);
  return { resourceId: resource.id };
}

export async function setResourceEnabledAction(
  courseId: string,
  resourceId: string,
  isEnabled: boolean,
) {
  const userId = await requireUserId();
  await db.setResourceEnabled(userId, resourceId, isEnabled);
  revalidatePath(`/courses/${courseId}`);
}

export async function deleteResourceAction(courseId: string, resourceId: string) {
  const userId = await requireUserId();
  await db.deleteResource(userId, resourceId);
  revalidatePath(`/courses/${courseId}`);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Math.round(value), min), max);
}

export async function generateQuizAction(
  courseId: string,
  settings: { questionCount: number; difficulty: number; durationMin: number },
): Promise<{
  error?: string;
  id?: string;
  name?: string;
  questionCount?: number;
  difficulty?: number;
  durationMin?: number;
}> {
  settings = {
    questionCount: clamp(settings.questionCount, 1, 10),
    difficulty: clamp(settings.difficulty, 1, 5),
    durationMin: clamp(settings.durationMin, 5, 30),
  };

  const userId = await requireUserId();
  const sources = await db.getGenerationSources(userId, courseId);

  let questions;
  try {
    questions = await generateQuizQuestions(
      sources,
      settings.questionCount,
      settings.difficulty,
    );
  } catch (error) {
    console.error(`Quiz generation failed for course ${courseId}:`, error);
    return { error: "Couldn't generate a quiz right now. Try again in a bit." };
  }

  const quiz = await db.createReadyQuiz(
    userId,
    courseId,
    { difficulty: settings.difficulty, durationMin: settings.durationMin },
    questions,
  );
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/quizzes");
  return {
    id: quiz.id,
    name: quiz.name,
    questionCount: questions.length,
    difficulty: settings.difficulty,
    durationMin: settings.durationMin,
  };
}

export async function submitQuizAction(
  quizId: string,
  answers: db.AttemptAnswers,
) {
  const userId = await requireUserId();
  const attempt = await db.startAttempt(userId, quizId);
  const result = await db.submitAttempt(userId, attempt.id, answers);
  if (!result) throw new Error("Failed to grade attempt");
  revalidatePath("/quizzes");
  revalidatePath("/");
  return result;
}
