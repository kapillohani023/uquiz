import { parseIso8601Duration, type YoutubeVideoMeta } from "@/lib/youtube";

/**
 * Look up a video via the YouTube Data API. Returns null when the video
 * doesn't exist (or is private); throws on missing key / API failure.
 */
export async function fetchYoutubeVideoMeta(
  videoId: string,
): Promise<YoutubeVideoMeta | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");

  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    id: videoId,
    key,
  });
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
      contentDetails?: { duration?: string };
    }[];
  };
  const item = data.items?.[0];
  const snippet = item?.snippet;
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
    durationSeconds: parseIso8601Duration(item.contentDetails?.duration ?? "PT0S"),
  };
}
