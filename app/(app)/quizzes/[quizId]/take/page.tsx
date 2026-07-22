import { notFound } from "next/navigation";
import { auth } from "@/app/auth";
import { getQuiz } from "@/lib/db";
import { TakeQuizView } from "@/components/TakeQuizView";

export default async function TakeQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const session = await auth();
  const quiz = await getQuiz(session!.user!.id, quizId);
  if (!quiz || quiz.status !== "READY" || quiz.mcqs.length === 0) notFound();

  return (
    <TakeQuizView
      quiz={{
        id: quiz.id,
        name: quiz.name,
        courseId: quiz.courseId,
        durationMin: quiz.durationMin,
        // answerIndex deliberately stripped — grading happens server-side.
        questions: quiz.mcqs.map((m) => ({
          id: m.id,
          question: m.question,
          options: m.options,
        })),
      }}
    />
  );
}
