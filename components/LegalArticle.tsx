import type { ReactNode } from "react";
import { UQuizBackLink, UQuizPage } from "@/components/ui";

/** Shared shell for legal pages: back link, title, dated intro, sections. */
export function LegalArticle({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <UQuizPage width="narrow">
      <UQuizBackLink href="/">Home</UQuizBackLink>
      <h1 className="mt-2.5 text-[26px] font-bold tracking-[-0.5px] text-uq-ink">
        {title}
      </h1>
      <p className="mt-1 text-[13px] text-uq-faint">Last updated {updated}</p>
      <div className="mt-7 flex flex-col gap-7">{children}</div>
    </UQuizPage>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-uq-ink">
        {heading}
      </h2>
      <div className="mt-2 flex flex-col gap-3 text-[15px] leading-[1.55] text-uq-muted">
        {children}
      </div>
    </section>
  );
}
