"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import * as db from "@/lib/db";
import {
  fetchYoutubeTranscript,
  fetchYoutubeVideoMeta,
  generateQuestions,
} from "@/lib/services";
import { extractYoutubeVideoId } from "@/lib/youtube";

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

export async function addResourceAction(
  courseId: string,
  url: string,
  title: string,
): Promise<{ error?: string }> {
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

  const resource = await db.addResource(userId, courseId, {
    title: title.trim() || videoMeta.title,
    url: url.trim().replace(/^https?:\/\//, ""),
    meta: videoMeta,
  });
  try {
    const { transcript } = await fetchYoutubeTranscript(resource.url);
    await db.markResourceReady(resource.id, transcript);
  } catch {
    await db.markResourceFailed(resource.id);
  }
  revalidatePath(`/courses/${courseId}`);
  return {};
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
) {
  settings = {
    questionCount: clamp(settings.questionCount, 1, 10),
    difficulty: clamp(settings.difficulty, 1, 5),
    durationMin: clamp(settings.durationMin, 5, 30),
  };

  const userId = await requireUserId();
  const sources = await db.getGenerationSources(userId, courseId);
  const quiz = await db.createQuiz(userId, courseId, {
    difficulty: settings.difficulty,
    durationMin: settings.durationMin,
  });
  try {
    const questions = await generateQuestions(
      sources,
      settings.questionCount,
      settings.difficulty,
    );
    await db.finalizeQuiz(quiz.id, questions);
  } catch {
    await db.markQuizFailed(quiz.id);
    throw new Error("Quiz generation failed");
  }
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/quizzes");
  return {
    id: quiz.id,
    name: quiz.name,
    questionCount: settings.questionCount,
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
