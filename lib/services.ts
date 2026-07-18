import type { Resource } from "@prisma/client";
import type { GeneratedQuestion } from "@/lib/db";

/**
 * Stub integrations. Replace with real YouTube transcript fetching and
 * LLM-backed question generation.
 */

export async function fetchYoutubeTranscript(
  url: string,
): Promise<{ transcript: string; meta: { sourceUrl: string } }> {
  return {
    transcript: `(stub transcript for ${url})`,
    meta: { sourceUrl: url },
  };
}

export async function generateQuestions(
  sources: Resource[],
  count: number,
  difficulty: number,
): Promise<GeneratedQuestion[]> {
  const sourceNote = sources.length
    ? sources.map((s) => s.title).join(", ")
    : "no sources";
  return Array.from({ length: count }, (_, i) => ({
    question: `Placeholder question ${i + 1} (difficulty ${difficulty}/5, sources: ${sourceNote})`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    answerIndex: i % 4,
  }));
}
