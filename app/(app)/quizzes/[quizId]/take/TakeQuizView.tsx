"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UQuizButton,
  UQuizCard,
  UQuizOption,
  UQuizPage,
  UQuizProgress,
  UQuizTimer,
  uquizScoreTone,
  uquizToneText,
} from "@/components/ui";
import { submitQuizAction } from "@/app/actions";

type TakeableQuiz = {
  id: string;
  name: string;
  courseId: string;
  durationMin: number;
  questions: { id: string; question: string; options: string[] }[];
};

type QuizResult = Awaited<ReturnType<typeof submitQuizAction>>;

export function TakeQuizView({ quiz }: { quiz: TakeableQuiz }) {
  const router = useRouter();
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [remaining, setRemaining] = useState(quiz.durationMin * 60);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const submittedRef = useRef(false);
  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const submit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    startTransition(async () => {
      setResult(await submitQuizAction(quiz.id, answersRef.current));
    });
  }, [quiz.id, startTransition]);

  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer);
          submit();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result, submit]);

  if (result) {
    return (
      <UQuizPage width="narrow">
        <div className="my-6 mb-[30px] text-center">
          <div className="text-[13px] text-uq-faint">{result.quizName}</div>
          <div
            className={`mt-1.5 text-[52px] font-bold tracking-[-2px] ${uquizToneText[uquizScoreTone(result.score)]}`}
          >
            {result.score}%
          </div>
          <div className="mt-1 text-sm text-uq-muted">
            {result.correctCount} of {result.total} correct
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {result.questions.map((q, i) => (
            <UQuizCard
              key={i}
              padding="none"
              className="flex items-start gap-3.5 rounded-xl px-[18px] py-3.5"
            >
              <span
                className={`mt-0.5 w-[22px] shrink-0 text-[13px] font-bold ${q.correct ? "text-uq-success" : "text-uq-primary"}`}
              >
                {q.correct ? "✓" : "✗"}
              </span>
              <div className="flex-1">
                <div className="text-sm leading-normal font-semibold">
                  {q.question}
                </div>
                <div className="mt-[3px] text-[13px] text-uq-muted">
                  {q.correct
                    ? `Correct — ${q.options[q.answerIndex]}`
                    : `You: ${
                        q.selectedIndex == null
                          ? "No answer"
                          : q.options[q.selectedIndex]
                      } · Correct: ${q.options[q.answerIndex]}`}
                </div>
              </div>
            </UQuizCard>
          ))}
        </div>
        <div className="mt-7 flex justify-center">
          <UQuizButton
            variant="ink"
            size="action"
            onClick={() =>
              router.push(`/quizzes?course=${quiz.courseId}&from=course`)
            }
          >
            Back to quizzes
          </UQuizButton>
        </div>
      </UQuizPage>
    );
  }

  const current = quiz.questions[qIndex];
  const isLast = qIndex === quiz.questions.length - 1;

  return (
    <UQuizPage width="narrow">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 truncate text-sm font-semibold text-uq-muted">
          {quiz.name}
        </div>
        <div className="flex items-center gap-3.5">
          <span className="text-[13px] text-uq-faint">
            {qIndex + 1} / {quiz.questions.length}
          </span>
          <UQuizTimer seconds={remaining} />
        </div>
      </div>
      <UQuizProgress
        value={(100 * (qIndex + 1)) / quiz.questions.length}
        className="mb-7"
      />

      <UQuizCard padding="lg">
        <div className="text-xl leading-normal font-semibold tracking-[-0.2px]">
          {qIndex + 1}. {current.question}
        </div>
        <div className="mt-6 flex flex-col gap-2.5">
          {current.options.map((text, oi) => (
            <UQuizOption
              key={oi}
              selected={answers[current.id] === oi}
              onSelect={() =>
                setAnswers((a) => ({ ...a, [current.id]: oi }))
              }
            >
              {text}
            </UQuizOption>
          ))}
        </div>
      </UQuizCard>

      <div className="mt-[22px] flex justify-between">
        <UQuizButton
          variant="outline"
          size="action"
          onClick={() => setQIndex((i) => Math.max(0, i - 1))}
          className={qIndex === 0 ? "invisible" : undefined}
        >
          Back
        </UQuizButton>
        {isLast ? (
          <UQuizButton
            variant="primary"
            size="action"
            onClick={submit}
            disabled={isPending}
          >
            {isPending ? "Submitting…" : "Submit"}
          </UQuizButton>
        ) : (
          <UQuizButton
            variant="ink"
            size="action"
            onClick={() =>
              setQIndex((i) => Math.min(quiz.questions.length - 1, i + 1))
            }
          >
            Next
          </UQuizButton>
        )}
      </div>
    </UQuizPage>
  );
}
