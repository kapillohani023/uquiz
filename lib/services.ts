import type { Resource } from "@prisma/client";
import OpenAI from "openai";
import { DIFFICULTY_LABELS } from "@/lib/format";
import {
  extractYoutubeVideoId,
  parseTimedTextXml,
  type YoutubeVideoMeta,
} from "@/lib/youtube";
import type { GeneratedQuestion } from "@/lib/db";

function extractVideoId(url: string): string {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) throw new Error(`Not a recognizable YouTube URL: ${url}`);
  return videoId;
}

/**
 * Look up a video via the YouTube Data API. Returns null when the video
 * doesn't exist (or is private); throws on missing key / API failure.
 */
export async function fetchYoutubeVideoMeta(
  videoId: string,
): Promise<YoutubeVideoMeta | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");

  const params = new URLSearchParams({ part: "snippet", id: videoId, key });
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params}`,
  );
  if (!response.ok) {
    throw new Error(`YouTube API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    items?: {
      snippet?: {
        title: string;
        channelTitle: string;
        publishedAt: string;
        thumbnails?: Record<string, { url: string }>;
      };
    }[];
  };
  const snippet = data.items?.[0]?.snippet;
  if (!snippet) return null;

  const thumbs = snippet.thumbnails ?? {};
  const thumb =
    thumbs.maxres ?? thumbs.high ?? thumbs.medium ?? thumbs.default;
  return {
    videoId,
    title: snippet.title,
    channelTitle: snippet.channelTitle,
    thumbnailUrl: thumb?.url ?? null,
    publishedAt: snippet.publishedAt,
  };
}

/**
 * YouTube's internal player API, called as the Android app. Unlike watch-page
 * scraping (and the WEB client), the ANDROID client is not walled off from
 * datacenter IPs, which is what breaks transcript fetching on Vercel.
 */
const INNERTUBE_PLAYER_URL = "https://www.youtube.com/youtubei/v1/player";
const INNERTUBE_ANDROID_CONTEXT = {
  client: {
    clientName: "ANDROID",
    clientVersion: "20.10.38",
    androidSdkVersion: 30,
    hl: "en",
  },
};
const INNERTUBE_ANDROID_USER_AGENT =
  "com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip";

type CaptionTrack = { baseUrl: string; languageCode: string; kind?: string };

/**
 * Signed, short-lived URL of the video's best caption track (English and
 * manually-authored preferred). The URL is CORS-enabled, so it can be
 * downloaded by the browser as well as the server.
 */
export async function fetchCaptionTrackUrl(url: string): Promise<string> {
  const videoId = extractVideoId(url);
  const response = await fetch(INNERTUBE_PLAYER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": INNERTUBE_ANDROID_USER_AGENT,
    },
    body: JSON.stringify({ context: INNERTUBE_ANDROID_CONTEXT, videoId }),
  });
  if (!response.ok) {
    throw new Error(`InnerTube player request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    playabilityStatus?: { status?: string };
    captions?: {
      playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] };
    };
  };
  const tracks =
    data.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
  if (tracks.length === 0) {
    throw new Error(
      `No captions available for video ${videoId} ` +
        `(playability: ${data.playabilityStatus?.status ?? "unknown"})`,
    );
  }

  const isEnglish = (t: CaptionTrack) => t.languageCode.startsWith("en");
  const track =
    tracks.find((t) => isEnglish(t) && t.kind !== "asr") ??
    tracks.find(isEnglish) ??
    tracks[0];
  return track.baseUrl;
}

export async function downloadCaptionTrack(trackUrl: string): Promise<string> {
  const response = await fetch(trackUrl);
  if (!response.ok) {
    throw new Error(`Caption download failed with status ${response.status}`);
  }
  const transcript = parseTimedTextXml(await response.text());
  if (transcript.length === 0) {
    throw new Error("Caption track parsed to an empty transcript");
  }
  return transcript;
}

export async function fetchYoutubeTranscript(url: string): Promise<string> {
  return downloadCaptionTrack(await fetchCaptionTrackUrl(url));
}

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const QUESTION_MODEL = "openai/gpt-oss-20b:free";

// Keeps the combined transcript context within the free-tier model's
// context budget while leaving room for the prompt and response.
const MAX_CONTEXT_CHARS = 60_000;

// The free model doesn't always honor response_format: json_object and
// sometimes wraps its answer in a ```json ... ``` fence — strip that off
// before parsing.
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

function parseQuestions(raw: string): GeneratedQuestion[] {
  const parsed = JSON.parse(extractJson(raw)) as { questions?: unknown };
  if (!Array.isArray(parsed.questions)) {
    throw new Error("Malformed question-generation response: missing questions array");
  }

  return parsed.questions.filter(
    (q): q is GeneratedQuestion =>
      typeof q === "object" &&
      q !== null &&
      typeof (q as GeneratedQuestion).question === "string" &&
      Array.isArray((q as GeneratedQuestion).options) &&
      (q as GeneratedQuestion).options.length === 4 &&
      Number.isInteger((q as GeneratedQuestion).answerIndex) &&
      (q as GeneratedQuestion).answerIndex >= 0 &&
      (q as GeneratedQuestion).answerIndex < 4,
  );
}

const GENERATION_ATTEMPTS = 2;

export async function generateQuestions(
  sources: Resource[],
  count: number,
  difficulty: number,
): Promise<GeneratedQuestion[]> {
  if (sources.length === 0) {
    throw new Error("No ready sources to generate questions from");
  }

  const context = sources
    .map((s) => `### ${s.title}\n${s.transcript}`)
    .join("\n\n")
    .slice(0, MAX_CONTEXT_CHARS);

  const difficultyLabel = DIFFICULTY_LABELS[difficulty] ?? String(difficulty);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You write multiple-choice quiz questions testing the concepts covered " +
        "in a video's transcript. Every question must be answerable purely from " +
        "the given content, but phrase each one as a standalone knowledge " +
        "question — never refer to \"the transcript\", \"the video\", or \"the " +
        "instructor\". The transcript is auto-generated captions and may contain " +
        "misheard words, typos, or garbled terms; infer the intended meaning and " +
        "never quote garbled text in a question or option. Each question needs " +
        "exactly one unambiguously correct answer and three plausible, clearly " +
        "wrong distractors of similar length and specificity — don't make the " +
        "correct option stand out by being longer or more detailed. Vary which " +
        "option holds the correct answer across questions instead of clustering " +
        "it at one index, and don't repeat or closely rephrase a question. " +
        "Respond with strict JSON only, no markdown code fences.",
    },
    {
      role: "user",
      content:
        `Transcript source material:\n\n${context}\n\n` +
        `Write exactly ${count} multiple-choice questions at "${difficultyLabel}" ` +
        `difficulty (${difficulty}/5, where 1 is easy recall and 5 is deep, ` +
        `nuanced understanding). Each question needs exactly 4 options with ` +
        `exactly one correct answer.\n\n` +
        `Respond with JSON matching this shape exactly:\n` +
        `{"questions": [{"question": string, "options": [string, string, string, string], "answerIndex": number}]}`,
    },
  ];

  let lastError: unknown;
  for (let attempt = 1; attempt <= GENERATION_ATTEMPTS; attempt++) {
    try {
      const response = await openrouter.chat.completions.create({
        model: QUESTION_MODEL,
        response_format: { type: "json_object" },
        messages,
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) throw new Error("Empty response from question-generation model");

      const questions = parseQuestions(raw);
      if (questions.length === 0) {
        throw new Error("Question-generation model returned no valid questions");
      }
      return questions.slice(0, count);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
