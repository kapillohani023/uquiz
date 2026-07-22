import { LlmAgent } from "@google/adk";
import { questionsResponseSchema } from "./schema";

const MODEL = "gemini-3.1-flash-lite";

/** Turns a resourceId into a valid, deterministic ADK agent name. */
function agentName(resourceId: string): string {
  return `question_agent_${resourceId.replace(/[^a-zA-Z0-9_]/g, "_")}`;
}

export type QuestionAgentParams = {
  resourceId: string;
  title: string;
  transcript: string;
  count: number;
  difficultyLabel: string;
  difficulty: number;
};

/**
 * Builds (but does not run) an ADK `LlmAgent` that writes `count`
 * multiple-choice questions from a single resource's transcript, producing
 * structured output matching `questionsResponseSchema`.
 */
export function buildQuestionAgent(params: QuestionAgentParams): LlmAgent {
  const { resourceId, title, transcript, count, difficultyLabel, difficulty } = params;

  const instruction =
    "You write multiple-choice quiz questions testing the concepts covered " +
    "in a video's transcript. Every question must be answerable purely from " +
    "the given content, but phrase each one as a standalone knowledge " +
    "question — never refer to \"the transcript\", \"the video\", or \"the " +
    "instructor\". The transcript may contain misheard words, typos, or " +
    "garbled terms; infer the intended meaning and never quote garbled text " +
    "in a question or option. Each question needs exactly one unambiguously " +
    "correct answer and three plausible, clearly wrong distractors of " +
    "similar length and specificity — don't make the correct option stand " +
    "out by being longer or more detailed. Vary which option holds the " +
    "correct answer across questions instead of clustering it at one " +
    "index, and don't repeat or closely rephrase a question.\n\n" +
    `Resource title: ${title}\n\n` +
    `Transcript source material:\n"""\n${transcript}\n"""\n\n` +
    `Write exactly ${count} multiple-choice questions at "${difficultyLabel}" ` +
    `difficulty (${difficulty}/5, where 1 is easy recall and 5 is deep, ` +
    "nuanced understanding). Each question needs exactly 4 options with " +
    "exactly one correct answer.";

  return new LlmAgent({
    name: agentName(resourceId),
    model: MODEL,
    instruction,
    outputSchema: questionsResponseSchema,
    // Gemini 3 models don't reliably support a hard-disabled thinking
    // budget (thinkingBudget: 0) together with a strict responseSchema —
    // in practice that combination sometimes finishes with STOP but emits
    // zero content parts (an empty candidate) instead of the JSON body.
    // Let thinking run at its (small) dynamic default instead, and give
    // the response a generous token budget that covers both thinking and
    // the answer itself.
    generateContentConfig: {
      maxOutputTokens: 16384,
    },
  });
}
