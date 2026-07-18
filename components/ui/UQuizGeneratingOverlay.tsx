"use client";

import { useEffect, useState } from "react";
import { UQuizSparkle } from "./UQuizSparkle";

const defaultStatuses = [
  "Reading video transcripts…",
  "Identifying key concepts…",
  "Drafting questions…",
  "Calibrating difficulty…",
];

/**
 * Full-screen overlay shown while a quiz generates: pulsing sparkle with
 * orbiting dots and a shimmering status line that advances every 800ms.
 */
export function UQuizGeneratingOverlay({
  subtitle,
  statuses = defaultStatuses,
}: {
  subtitle?: string;
  statuses?: string[];
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setStep((s) => Math.min(s + 1, statuses.length - 1)),
      800,
    );
    return () => clearInterval(timer);
  }, [statuses.length]);

  return (
    <div className="fixed inset-0 z-60 flex flex-col items-center justify-center gap-5 bg-uq-bg/94">
      <div aria-hidden className="relative flex size-[90px] items-center justify-center">
        <UQuizSparkle size={44} pulse="fast" className="text-uq-primary" />
        <div className="animate-uq-orbit absolute top-1/2 left-1/2 -mt-1 -ml-1 size-2 rounded-full bg-uq-amber" />
        <div className="animate-uq-orbit-reverse absolute top-1/2 left-1/2 -mt-[3px] -ml-[3px] size-1.5 rounded-full bg-uq-primary opacity-60" />
      </div>
      <div
        role="status"
        className="animate-uq-shimmer bg-[linear-gradient(90deg,#d0342c,#e0a52b,#d0342c)] bg-[length:200%_auto] bg-clip-text text-base font-semibold text-transparent"
      >
        {statuses[step]}
      </div>
      {subtitle && <div className="text-[13px] text-uq-faint">{subtitle}</div>}
    </div>
  );
}
