// src/components/CommentsList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseStance, type Stance } from "@/lib/parseStance";
import StanceBadge from "@/components/StanceBadge";
import AutoLinkScripture from "@/components/AutoLinkScripture";

type Comment = {
  id: string;
  body: string;
  display_name?: string | null;
  created_at?: string | null;
};

const ALL_STANCES: Stance[] = [
  "agree",
  "disagree",
  "question",
  "insight",
  "resource",
  "prayer",
];

function normalizeStance(s: string | null): "all" | Stance {
  if (!s) return "all";
  const low = s.toLowerCase();
  return (["agree","disagree","question","insight","resource","prayer"] as const)
    .includes(low as Stance)
    ? (low as Stance)
    : "all";
}

export default function CommentsList({ comments }: { comments: Comment[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1) initial filter from ?stance=
  const [active, setActive] = useState<"all" | Stance>(
    normalizeStance(searchParams.get("stance"))
  );

  // 2) keep URL in sync when user clicks chips (shareable links)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (active === "all") {
      params.delete("stance");
    } else {
      params.set("stance", active);
    }
    // avoid rerender loops by only replacing when changed
    const next = `${pathname}?${params.toString()}`;
    const current = `${pathname}${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
    if (next !== current) router.replace(next, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // 3) recompute if comments change
  const enriched = useMemo(() => {
    return (comments ?? []).map((c) => {
      const { stance, body } = parseStance(c.body ?? "");
      return { ...c, _stance: stance as Stance | null, _body: body };
    });
  }, [comments]);

  const counts = useMemo(() => {
    const base: Record<"all" | Stance, number> = {
      all: enriched.length,
      agree: 0, disagree: 0, question: 0, insight: 0, resource: 0, prayer: 0,
    };
    for (const c of enriched) if (c._stance) base[c._stance] += 1;
    return base;
  }, [enriched]);

  const visible = useMemo(() => {
    if (active === "all") return enriched;
    return enriched.filter((c) => c._stance === active);
  }, [enriched, active]);

  // 4) “At a glance” (optional summary): up to 3 Disagree + 3 Question, newest first
  const glance = useMemo(() => {
    const byNewest = [...enriched].sort((a, b) => {
      const ta = a.created_at ? Date.parse(a.created_at) : 0;
      const tb = b.created_at ? Date.parse(b.created_at) : 0;
      return tb - ta;
    });
    const disagrees = byNewest.filter(c => c._stance === "disagree").slice(0, 3);
    const questions = byNewest.filter(c => c._stance === "question").slice(0, 3);
    return { disagrees, questions };
  }, [enriched]);

  return (
    <div className="mt-4">
      {/* At a glance */}
      {(glance.disagrees.length > 0 || glance.questions.length > 0) && (
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          {glance.disagrees.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center gap-2">
                <StanceBadge stance="disagree" />
                <span className="text-sm font-medium text-slate-800">Disagreements at a glance</span>
              </div>
              <ul className="space-y-2">
                {glance.disagrees.map((c) => (
                  <li key={`dg-${c.id}`} className="text-sm text-slate-700">
                    <span className="font-medium">{c.display_name ?? "Anonymous"}: </span>
                    <span className="line-clamp-2">{truncate(c._body, 160)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {glance.questions.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center gap-2">
                <StanceBadge stance="question" />
                <span className="text-sm font-medium text-slate-800">Questions at a glance</span>
              </div>
              <ul className="space-y-2">
                {glance.questions.map((c) => (
                  <li key={`q-${c.id}`} className="text-sm text-slate-700">
                    <span className="font-medium">{c.display_name ?? "Anonymous"}: </span>
                    <span className="line-clamp-2">{truncate(c._body, 160)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip
          label="All"
          active={active === "all"}
          onClick={() => setActive("all")}
          count={counts.all}
        />
        {ALL_STANCES.map((s) => (
          <FilterChip
            key={s}
            label={capitalize(s)}
            active={active === s}
            onClick={() => setActive(s)}
            count={counts[s]}
            tone={s}
          />
        ))}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No comments in this filter.
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((c) => (
            <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {c._stance && <StanceBadge stance={c._stance} />}
                {c.display_name && (
                  <span className="text-sm text-slate-700">{c.display_name}</span>
                )}
                {c.created_at && (
                  <span className="text-xs text-slate-500">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                )}
              </div>
             <AutoLinkScripture text={c._body} className="whitespace-pre-wrap text-sm text-slate-800" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
  tone,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
  tone?: Stance;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm";
  const activeCls = "border-slate-900 bg-slate-900 text-white";
  const inactiveCls = "border-slate-300 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${active ? activeCls : inactiveCls}`}
      aria-pressed={active}
    >
      <span>{label}</span>
      <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{count}</span>
    </button>
  );
}

function capitalize(s: string) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function truncate(s: string, n = 160) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
