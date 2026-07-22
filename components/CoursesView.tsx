"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UQuizBadge,
  UQuizButton,
  UQuizCard,
  UQuizDashedButton,
  UQuizDialog,
  UQuizDialogActions,
  UQuizInput,
  UQuizMenu,
  UQuizPage,
  UQuizPageHeader,
  UQuizViewToggle,
  uquizScoreTone,
} from "@/components/ui";
import { pluralize } from "@/lib/format";
import { createCourseAction, deleteCourseAction } from "@/app/actions";

export type CourseRow = {
  id: string;
  name: string;
  resourceCount: number;
  quizCount: number;
  avgScore: number | null;
};

const viewOptions = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
] as const;

export function CoursesView({ courses }: { courses: CourseRow[] }) {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<CourseRow | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

  const create = () => {
    if (!name.trim() || isPending) return;
    startTransition(async () => {
      const { id } = await createCourseAction(name);
      setDialogOpen(false);
      router.push(`/courses/${id}`);
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget || isDeletePending) return;
    startDeleteTransition(async () => {
      await deleteCourseAction(deleteTarget.id);
      setDeleteTarget(null);
    });
  };

  const deleteMenu = (c: CourseRow) => (
    <UQuizMenu items={[{ label: "Delete", danger: true, onSelect: () => setDeleteTarget(c) }]} />
  );

  const avgBadge = (c: CourseRow) => (
    <UQuizBadge chip tone={uquizScoreTone(c.avgScore)}>
      avg {c.avgScore == null ? "—" : `${c.avgScore}%`}
    </UQuizBadge>
  );

  const quizLink = (c: CourseRow) => (
    <Link
      href={`/quizzes?course=${c.id}`}
      onClick={(e) => e.stopPropagation()}
      className="text-[13px] text-uq-primary hover:text-uq-link-hover"
    >
      {c.quizCount} {c.quizCount === 1 ? "quiz" : "quizzes"}
    </Link>
  );

  return (
    <UQuizPage className="pt-9">
      <UQuizPageHeader
        className="mb-[26px]"
        title="Courses"
        actions={
          <UQuizViewToggle options={viewOptions} value={view} onChange={setView} />
        }
      />

      {view === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[18px]">
          <UQuizDashedButton tile onClick={() => setDialogOpen(true)}>
            New course
          </UQuizDashedButton>
          {courses.map((c) => (
            <UQuizCard
              key={c.id}
              interactive
              onClick={() => router.push(`/courses/${c.id}`)}
              className="flex min-h-[150px] flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[17px] font-semibold tracking-[-0.2px]">
                    {c.name}
                  </div>
                  <div className="mt-1.5 text-[13px] text-uq-faint">
                    {pluralize(c.resourceCount, "resource")}
                  </div>
                </div>
                {deleteMenu(c)}
              </div>
              <div className="flex items-center gap-3.5 text-[13px] text-uq-muted">
                {quizLink(c)}
                <span className="ml-auto">{avgBadge(c)}</span>
              </div>
            </UQuizCard>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {courses.map((c) => (
            <UQuizCard
              key={c.id}
              interactive
              padding="none"
              onClick={() => router.push(`/courses/${c.id}`)}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl px-[22px] py-4"
            >
              <div className="flex-1 text-[15px] font-semibold">{c.name}</div>
              <div className="text-[13px] text-uq-faint">
                {pluralize(c.resourceCount, "resource")}
              </div>
              {quizLink(c)}
              {avgBadge(c)}
              {deleteMenu(c)}
            </UQuizCard>
          ))}
          <UQuizDashedButton onClick={() => setDialogOpen(true)}>
            + New course
          </UQuizDashedButton>
        </div>
      )}

      <UQuizDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="New course"
      >
        <UQuizInput
          label="Course name"
          placeholder="e.g. System Design"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
          autoFocus
        />
        <UQuizDialogActions>
          <UQuizButton variant="ghost" onClick={() => setDialogOpen(false)}>
            Cancel
          </UQuizButton>
          <UQuizButton
            variant="primary"
            size="action"
            onClick={create}
            disabled={!name.trim() || isPending}
          >
            {isPending ? "Creating…" : "Create"}
          </UQuizButton>
        </UQuizDialogActions>
      </UQuizDialog>

      <UQuizDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete course?"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This removes its ${pluralize(deleteTarget.resourceCount, "resource")} and ${deleteTarget.quizCount} ${deleteTarget.quizCount === 1 ? "quiz" : "quizzes"} — this can't be undone.`
            : undefined
        }
      >
        <UQuizDialogActions>
          <UQuizButton
            variant="ghost"
            onClick={() => setDeleteTarget(null)}
            disabled={isDeletePending}
          >
            Cancel
          </UQuizButton>
          <UQuizButton
            variant="danger"
            size="action"
            onClick={confirmDelete}
            disabled={isDeletePending}
          >
            {isDeletePending ? "Deleting…" : "Delete"}
          </UQuizButton>
        </UQuizDialogActions>
      </UQuizDialog>
    </UQuizPage>
  );
}
