// src/components/StanceBadge.tsx
"use client";

import type { Stance } from "@/lib/parseStance";

const styles: Record<Stance, string> = {
  agree:    "bg-emerald-100 text-emerald-800",
  disagree: "bg-rose-100 text-rose-800",
  question: "bg-amber-100 text-amber-800",
  insight:  "bg-indigo-100 text-indigo-800",
  resource: "bg-sky-100 text-sky-800",
  prayer:   "bg-fuchsia-100 text-fuchsia-800",
};

export default function StanceBadge({ stance }: { stance: Stance }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[stance]}`}
      aria-label={`Comment stance: ${stance}`}
    >
      {stance[0].toUpperCase() + stance.slice(1)}
    </span>
  );
}
