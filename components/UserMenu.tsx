"use client";

import { useState, useTransition } from "react";
import {
  UQuizButton,
  UQuizDialog,
  UQuizDialogActions,
  UQuizInput,
  UQuizMenu,
} from "@/components/ui";
import { deleteAccountAction, signOutAction } from "@/app/actions";

const CONFIRM_PHRASE = "delete my account";

function getInitials(name: string, email: string) {
  const words = (name.trim() || email.trim()).split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function UserMenu({ name, email }: { name: string; email: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const closeDialog = () => {
    setDialogOpen(false);
    setConfirmText("");
    setError(null);
  };

  const deleteAccount = () => {
    if (confirmText.trim() !== CONFIRM_PHRASE || isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteAccountAction();
      } catch {
        setError("Something went wrong. Try again.");
      }
    });
  };

  return (
    <>
      <UQuizMenu
        trigger={
          <span className="flex size-9 items-center justify-center rounded-full bg-uq-ink text-xs font-semibold text-white">
            {getInitials(name, email)}
          </span>
        }
        dropdownTop="top-12"
        items={[
          { label: "Sign out", onSelect: () => signOutAction() },
          { label: "Delete account", danger: true, onSelect: () => setDialogOpen(true) },
        ]}
      />

      <UQuizDialog
        open={dialogOpen}
        onClose={closeDialog}
        title="Delete account"
        description="This will permanently delete your account and everything in it — courses, resources, quizzes, and quiz history. This can't be undone."
      >
        <UQuizInput
          label={`To confirm, type "${CONFIRM_PHRASE}"`}
          placeholder={CONFIRM_PHRASE}
          value={confirmText}
          onChange={(e) => {
            setConfirmText(e.target.value);
            setError(null);
          }}
          error={error ?? undefined}
          disabled={isPending}
          autoFocus
        />
        <UQuizDialogActions>
          <UQuizButton variant="ghost" onClick={closeDialog} disabled={isPending}>
            Cancel
          </UQuizButton>
          <UQuizButton
            variant="danger"
            size="action"
            onClick={deleteAccount}
            disabled={confirmText.trim() !== CONFIRM_PHRASE || isPending}
          >
            {isPending ? "Deleting…" : "Delete my account"}
          </UQuizButton>
        </UQuizDialogActions>
      </UQuizDialog>
    </>
  );
}
