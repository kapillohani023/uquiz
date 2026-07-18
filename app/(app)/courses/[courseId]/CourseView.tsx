"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UQuizActionBar,
  UQuizBackLink,
  UQuizBadge,
  UQuizButton,
  UQuizCard,
  UQuizDialog,
  UQuizDialogActions,
  UQuizEmptyState,
  UQuizInput,
  UQuizLoadingOverlay,
  UQuizMenu,
  UQuizPage,
  UQuizPageHeader,
  UQuizSlider,
  UQuizVideoThumb,
  UQuizViewToggle,
  cx,
} from "@/components/ui";
import { difficultyLabel, formatDate, pluralize } from "@/lib/format";
import {
  addResourceAction,
  deleteResourceAction,
  generateQuizAction,
  setResourceEnabledAction,
} from "@/app/actions";

export type ResourceRow = {
  id: string;
  title: string;
  url: string;
  isEnabled: boolean;
  addedAt: string;
};

type Dialog = null | "addResource" | "createQuiz" | "generated";

type GeneratedQuiz = {
  id: string;
  name: string;
  questionCount: number;
  difficulty: number;
  durationMin: number;
};

const viewOptions = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
] as const;

export function CourseView({
  course,
  resources,
  quizCount,
}: {
  course: { id: string; name: string };
  resources: ResourceRow[];
  quizCount: number;
}) {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState(3);
  const [durationMin, setDurationMin] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedQuiz | null>(null);
  const [isPending, startTransition] = useTransition();

  const enabledCount = resources.filter((r) => r.isEnabled).length;

  const addResource = () => {
    if (!url.trim() || isPending) return;
    startTransition(async () => {
      await addResourceAction(course.id, url, title);
      setDialog(null);
    });
  };

  const generateQuiz = async () => {
    setDialog(null);
    setGenerating(true);
    try {
      const quiz = await generateQuizAction(course.id, {
        questionCount,
        difficulty,
        durationMin,
      });
      setGenerated(quiz);
      setDialog("generated");
    } finally {
      setGenerating(false);
    }
  };

  const resourceMenu = (r: ResourceRow) => (
    <UQuizMenu
      items={[
        {
          label: r.isEnabled ? "Disable" : "Enable",
          onSelect: () =>
            startTransition(() =>
              setResourceEnabledAction(course.id, r.id, !r.isEnabled),
            ),
        },
        {
          label: "Delete",
          danger: true,
          onSelect: () =>
            startTransition(() => deleteResourceAction(course.id, r.id)),
        },
      ]}
    />
  );

  return (
    <UQuizPage className="pb-32">
      <UQuizBackLink href="/">Courses</UQuizBackLink>
      <UQuizPageHeader
        className="mt-2.5"
        title={course.name}
        meta={`${pluralize(resources.length, "resource")} · ${enabledCount} enabled`}
        actions={
          <>
            <UQuizViewToggle
              options={viewOptions}
              value={view}
              onChange={setView}
            />
            <UQuizButton
              variant="secondary"
              size="md"
              className="text-[13px] font-medium"
              onClick={() => {
                setUrl("");
                setTitle("");
                setDialog("addResource");
              }}
            >
              + Add resource
            </UQuizButton>
          </>
        }
      />

      {resources.length === 0 ? (
        <UQuizEmptyState>
          No resources yet — paste a YouTube link with Add resource.
        </UQuizEmptyState>
      ) : view === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[18px]">
          {resources.map((r) => (
            <UQuizCard
              key={r.id}
              padding="none"
              className={cx(!r.isEnabled && "opacity-45")}
            >
              <UQuizVideoThumb />
              <div className="flex items-start gap-2 px-4 pt-3.5 pb-4">
                <div className="min-w-0 flex-1">
                  <div className="text-sm leading-snug font-semibold">
                    {r.title}
                  </div>
                  <div className="mt-1 text-xs text-uq-faint">
                    {!r.isEnabled && "disabled · "}added {formatDate(r.addedAt)}
                  </div>
                </div>
                {resourceMenu(r)}
              </div>
            </UQuizCard>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {resources.map((r) => (
            <UQuizCard
              key={r.id}
              padding="none"
              className={cx(
                "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-[18px] py-3",
                !r.isEnabled && "opacity-45",
              )}
            >
              <UQuizVideoThumb variant="row" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{r.title}</div>
                <div className="text-xs text-uq-faint">{r.url}</div>
              </div>
              <div className="text-xs whitespace-nowrap text-uq-faint">
                added {formatDate(r.addedAt)}
              </div>
              <UQuizBadge tone={r.isEnabled ? "success" : "muted"}>
                {r.isEnabled ? "enabled" : "disabled"}
              </UQuizBadge>
              <UQuizButton
                variant="outline"
                size="sm"
                onClick={() =>
                  startTransition(() =>
                    setResourceEnabledAction(course.id, r.id, !r.isEnabled),
                  )
                }
              >
                {r.isEnabled ? "Disable" : "Enable"}
              </UQuizButton>
              <UQuizButton
                variant="danger"
                size="sm"
                onClick={() =>
                  startTransition(() => deleteResourceAction(course.id, r.id))
                }
              >
                Delete
              </UQuizButton>
            </UQuizCard>
          ))}
        </div>
      )}

      <UQuizActionBar>
        <UQuizButton
          variant="primary"
          size="lg"
          className="px-[34px]"
          onClick={() => setDialog("createQuiz")}
        >
          Create quiz
        </UQuizButton>
        <UQuizButton
          variant="secondary"
          size="lg"
          onClick={() => router.push(`/quizzes?course=${course.id}&from=course`)}
        >
          Quizzes ({quizCount})
        </UQuizButton>
      </UQuizActionBar>

      <UQuizDialog
        open={dialog === "addResource"}
        onClose={() => setDialog(null)}
        title="Add resource"
        description="Paste a YouTube link to add it to this course."
      >
        <UQuizInput
          label="YouTube URL"
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoFocus
        />
        <UQuizInput
          className="mt-3.5"
          label="Title (optional)"
          placeholder="Video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <UQuizDialogActions>
          <UQuizButton variant="ghost" onClick={() => setDialog(null)}>
            Cancel
          </UQuizButton>
          <UQuizButton
            variant="primary"
            size="action"
            onClick={addResource}
            disabled={!url.trim() || isPending}
          >
            {isPending ? "Adding…" : "Add"}
          </UQuizButton>
        </UQuizDialogActions>
      </UQuizDialog>

      <UQuizDialog
        open={dialog === "createQuiz"}
        onClose={() => setDialog(null)}
        title="Create quiz"
        description={`Generated from the enabled resources in ${course.name}.`}
      >
        <UQuizSlider
          label="Questions"
          valueLabel={String(questionCount)}
          min={1}
          max={10}
          value={questionCount}
          onChange={setQuestionCount}
        />
        <UQuizSlider
          className="mt-5"
          label="Difficulty"
          valueLabel={`${difficultyLabel(difficulty)} (${difficulty}/5)`}
          min={1}
          max={5}
          value={difficulty}
          onChange={setDifficulty}
        />
        <UQuizSlider
          className="mt-5"
          label="Duration"
          valueLabel={`${durationMin} min`}
          min={5}
          max={30}
          step={5}
          value={durationMin}
          onChange={setDurationMin}
        />
        <UQuizDialogActions>
          <UQuizButton variant="ghost" onClick={() => setDialog(null)}>
            Cancel
          </UQuizButton>
          <UQuizButton variant="primary" size="action" onClick={generateQuiz}>
            Generate
          </UQuizButton>
        </UQuizDialogActions>
      </UQuizDialog>

      <UQuizDialog open={dialog === "generated"} onClose={() => setDialog(null)}>
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-[52px] items-center justify-center rounded-full bg-uq-success-tint text-2xl text-uq-success">
            ✓
          </div>
          <h2 className="text-[19px] font-bold tracking-[-0.3px]">
            Quiz generated
          </h2>
          {generated && (
            <p className="mt-1.5 text-[13px] text-uq-muted">
              {generated.questionCount} questions ·{" "}
              {difficultyLabel(generated.difficulty)} · {generated.durationMin}{" "}
              min
            </p>
          )}
          <UQuizDialogActions align="center">
            <UQuizButton
              variant="outline"
              size="action"
              onClick={() =>
                router.push(`/quizzes?course=${course.id}&from=course`)
              }
            >
              Later
            </UQuizButton>
            <UQuizButton
              variant="primary"
              size="action"
              onClick={() => generated && router.push(`/quizzes/${generated.id}/take`)}
            >
              Take now
            </UQuizButton>
          </UQuizDialogActions>
        </div>
      </UQuizDialog>

      {generating && (
        <UQuizLoadingOverlay
          title="Generating quiz…"
          subtitle={`Analyzing ${pluralize(enabledCount, "resource")} in ${course.name}`}
        />
      )}
    </UQuizPage>
  );
}
