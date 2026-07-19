const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

/** Video id from any recognizable YouTube URL form, or null. */
export function extractYoutubeVideoId(url: string): string | null {
  return url.match(YOUTUBE_ID_PATTERN)?.[1] ?? null;
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Flatten a YouTube timedtext XML caption document into plain text.
 * Runs on both server and client (regex-based, no DOM), since the caption
 * file may be downloaded by either side.
 */
export function parseTimedTextXml(xml: string): string {
  return [...xml.matchAll(/<(?:p|text)[^>]*>([\s\S]*?)<\/(?:p|text)>/g)]
    .map((m) => decodeXmlEntities(m[1].replace(/<[^>]+>/g, "")))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Snippet fields we keep on Resource.meta. */
export type YoutubeVideoMeta = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string | null;
  publishedAt: string;
};
