export const DIFFICULTY_LABELS = ["", "Easy", "Casual", "Medium", "Hard", "Expert"];

export function difficultyLabel(difficulty: number) {
  return DIFFICULTY_LABELS[difficulty] ?? String(difficulty);
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
