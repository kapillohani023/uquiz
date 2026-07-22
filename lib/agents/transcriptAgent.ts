import { InMemoryRunner, isFinalResponse, LlmAgent, stringifyContent } from "@google/adk";
import type { Content } from "@google/genai";

const MODEL = "gemini-3.1-flash-lite";

// Keeps the stored transcript (and the downstream question-generation
// prompt built from it) within a sane size.
const MAX_TRANSCRIPT_CHARS = 20_000;

const RUN_USER_ID = "transcript-agent";

const INSTRUCTION =
  "You transcribe the spoken content of a YouTube video given to you as a " +
  "file. Do not just caption it verbatim — concentrate and distill it into " +
  "a clean, noise-free plain-text transcript of the substantive content " +
  "only. Strip filler words, ads, sponsor reads, tangents, banter, and " +
  "repeated phrases. Do not include timestamps or speaker labels. Respond " +
  "with plain text only: the distilled transcript, nothing else — no " +
  "preamble, no markdown, no commentary about the task.";

function buildAgent(): LlmAgent {
  return new LlmAgent({
    name: "youtube_transcript_agent",
    model: MODEL,
    instruction: INSTRUCTION,
    // Disable thinking and reserve a generous token budget for the
    // transcript itself — a "thinking" model can otherwise burn its whole
    // output-token budget on reasoning and return an empty/truncated
    // transcript.
    generateContentConfig: {
      maxOutputTokens: 16384,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
}

/**
 * Runs an ADK agent that watches a YouTube video (via a `fileData` part
 * pointing at its URL) and returns a distilled, noise-free transcript of its
 * spoken content.
 */
export async function runYoutubeTranscriptAgent(url: string): Promise<string> {
  const runner = new InMemoryRunner({ agent: buildAgent() });

  const newMessage: Content = {
    role: "user",
    parts: [
      { fileData: { fileUri: url } },
      {
        text:
          "Transcribe and distill this video's spoken content per your " +
          "instructions.",
      },
    ],
  };

  let text = "";
  for await (const event of runner.runEphemeral({ userId: RUN_USER_ID, newMessage })) {
    if (isFinalResponse(event)) {
      text = stringifyContent(event);
    }
  }

  const cleaned = text.trim();
  if (!cleaned) {
    throw new Error(`Transcript agent returned empty output for ${url}`);
  }
  return cleaned.slice(0, MAX_TRANSCRIPT_CHARS);
}
