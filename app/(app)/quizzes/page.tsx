import Link from "next/link";
import { auth } from "@/app/auth";
import { getCourse, listQuizzes } from "@/lib/db";
import {
  UQuizBackLink,
  UQuizBadge,
  UQuizCard,
  UQuizEmptyState,
  UQuizPage,
  uquizScoreTone,
} from "@/components/ui";
import { difficultyLabel, formatDate } from "@/lib/format";

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; from?: string }>;
}) {
  const { course: courseId, from } = await searchParams;
  const session = await auth();
  const userId = session!.user!.id;

  const [quizzes, course] = await Promise.all([
    listQuizzes(userId, courseId),
    courseId ? getCourse(userId, courseId) : null,
  ]);

  const fromCourse = from === "course" && course;
  const backHref = fromCourse ? `/courses/${course.id}` : "/";
  const backLabel = fromCourse ? course.name : "Home";
  const title = course ? `${course.name} — Quizzes` : "All quizzes";

  return (
    <UQuizPage width="medium">
      <UQuizBackLink href={backHref}>{backLabel}</UQuizBackLink>
      <h1 className="mt-2.5 mb-6 text-[26px] font-bold tracking-[-0.5px]">
        {title}
      </h1>

      {quizzes.length === 0 ? (
        <UQuizEmptyState>
          No quizzes yet — open a course and hit Create quiz.
        </UQuizEmptyState>
      ) : (
        <div className="flex flex-col gap-2.5">
          {quizzes.map((q) => (
            <UQuizCard
              key={q.id}
              padding="none"
              className="flex flex-wrap items-center gap-x-[18px] gap-y-2 rounded-xl px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold">{q.name}</div>
                <div className="mt-[3px] text-xs text-uq-faint">
                  {q.courseName} · {q.questionCount} questions ·{" "}
                  {difficultyLabel(q.difficulty)} · {q.durationMin} min ·{" "}
                  {formatDate(q.createdAt)}
                </div>
              </div>
              {q.latestScore != null && (
                <UQuizBadge chip tone={uquizScoreTone(q.latestScore)} bold>
                  {q.latestScore}%
                </UQuizBadge>
              )}
              {q.status === "READY" ? (
                <Link
                  href={`/quizzes/${q.id}/take`}
                  className="rounded-lg bg-uq-ink px-5 py-[9px] text-[13px] font-medium text-white transition-colors hover:bg-uq-primary"
                >
                  {q.latestScore != null ? "Retake" : "Take quiz"}
                </Link>
              ) : (
                <UQuizBadge tone={q.status === "FAILED" ? "danger" : "muted"}>
                  {q.status === "FAILED" ? "failed" : "generating…"}
                </UQuizBadge>
              )}
            </UQuizCard>
          ))}
        </div>
      )}
    </UQuizPage>
  );
}
