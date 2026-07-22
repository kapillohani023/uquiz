const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

/** Video id from any recognizable YouTube URL form, or null. */
export function extractYoutubeVideoId(url: string): string | null {
  return url.match(YOUTUBE_ID_PATTERN)?.[1] ?? null;
}

/** Snippet fields we keep on Resource.meta. */
export type YoutubeVideoMeta = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string | null;
  publishedAt: string;
  durationSeconds: number;
};

const ISO8601_DURATION_PATTERN =
  /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;

/** Seconds encoded by a YouTube Data API ISO 8601 duration (e.g. `PT1H30M`). */
export function parseIso8601Duration(duration: string): number {
  const match = duration.match(ISO8601_DURATION_PATTERN);
  if (!match) return 0;
  const [, hours, minutes, seconds] = match;
  return (
    Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0)
  );
}
