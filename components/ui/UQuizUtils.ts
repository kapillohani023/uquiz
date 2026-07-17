export type UQuizTone = "neutral" | "success" | "warning" | "danger" | "muted";

/** Join class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Map a 0–100 quiz score to a display tone. Null/undefined means "not taken yet". */
export function uquizScoreTone(score: number | null | undefined): UQuizTone {
  if (score == null) return "muted";
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

export const uquizToneText: Record<UQuizTone, string> = {
  neutral: "text-uq-muted",
  success: "text-uq-success",
  warning: "text-uq-warning",
  danger: "text-uq-primary",
  muted: "text-uq-faint",
};
