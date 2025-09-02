// src/app/admin/comments/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";

type CommentRow = {
  id: string;
  body: string;
  display_name: string | null;
  created_at: string;
  entry_id: string;
  approved: boolean;
  entries: { title: string; slug: string } | null;
};

type RawCommentRow = Omit<CommentRow, "entries"> & {
  entries:
    | { title: string; slug: string }
    | { title: string; slug: string }[]
    | null;
};

export default function AdminComments() {
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [pendingCount, setPendingCount] = useState<number>(0);

  async function fetchCounts() {
    const { count } = await supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("approved", false);
    setPendingCount(count ?? 0);
  }

  async function load() {
    setLoading(true);
    setErr(null);

    const base = supabase
      .from("comments")
      .select(
        "id, body, display_name, created_at, entry_id, approved, entries:entry_id (title, slug)"
      )
      .order("created_at", { ascending: tab === "pending" }); // oldest first for pending

    const queryBuilder =
      tab === "pending" ? base.eq("approved", false) : base.eq("approved", true);

    const { data, error } = await queryBuilder.returns<RawCommentRow[]>();

    if (error) setErr(error.message);

    const normalized: CommentRow[] =
      (data ?? []).map((r) => ({
        ...r,
        entries: Array.isArray(r.entries) ? r.entries[0] ?? null : r.entries,
      }));

    setRows(normalized);
    setLoading(false);
    fetchCounts(); // keep the dashboard badge in sync if you come from there
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) => {
      const body = c.body.toLowerCase();
      const name = (c.display_name ?? "").toLowerCase();
      const title = (c.entries?.title ?? "").toLowerCase();
      const slug = (c.entries?.slug ?? "").toLowerCase();
      return (
        body.includes(q) ||
        name.includes(q) ||
        title.includes(q) ||
        slug.includes(q)
      );
    });
  }, [rows, query]);

  async function approve(id: string) {
    setBusy((b) => ({ ...b, [id]: true }));
    const { error } = await supabase.from("comments").update({ approved: true }).eq("id", id);
    if (!error) {
      setRows((r) => r.filter((x) => x.id !== id));
      setPendingCount((c) => Math.max(0, c - 1));
    }
    setBusy((b) => ({ ...b, [id]: false }));
  }

  async function destroy(id: string) {
    const ok = window.confirm("Delete this comment? This cannot be undone.");
    if (!ok) return;
    setBusy((b) => ({ ...b, [id]: true }));
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (!error) {
      setRows((r) => r.filter((x) => x.id !== id));
      // if we deleted a pending one, also update the badge count
      if (tab === "pending") setPendingCount((c) => Math.max(0, c - 1));
    }
    setBusy((b) => ({ ...b, [id]: false }));
  }

  return (
    <AdminGuard>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Moderate comments</h1>
          <p className="text-slate-600">Approve or delete comments across your reflections.</p>
        </div>

        {/* Tabs + search */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("pending")}
              className={[
                "rounded-md px-3 py-1.5 text-sm",
                tab === "pending"
                  ? "bg-teal-600 text-white"
                  : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
              ].join(" ")}
            >
              Pending
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-white/20 px-1.5 text-[11px] font-semibold">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("approved")}
              className={[
                "rounded-md px-3 py-1.5 text-sm",
                tab === "approved"
                  ? "bg-teal-600 text-white"
                  : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
              ].join(" ")}
            >
              Approved
            </button>
          </div>

          <div className="relative w-full max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by text, name, title, or slug…"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pl-9 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19a8 8 0 100-16 8 8 0 000 16z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-3.5-3.5" />
            </svg>
          </div>
        </div>

        {/* List */}
        {err && <p className="mb-4 text-red-600">{err}</p>}

        {loading ? (
          <ul className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-8 w-full animate-pulse rounded bg-slate-100" />
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No comments in this view.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((c) => (
              <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-sm text-slate-800 whitespace-pre-wrap">{c.body}</div>
                <div className="mt-2 text-xs text-slate-500">
                  {(c.display_name || "Guest")} · {new Date(c.created_at).toLocaleString()}
                  {c.entries && (
                    <>
                      {" "}
                      · on{" "}
                      <Link
                        href={`/entries/${c.entries.slug}`}
                        className="text-teal-700 hover:text-teal-800"
                      >
                        {c.entries.title}
                      </Link>
                    </>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {tab === "pending" && (
                    <button
                      onClick={() => approve(c.id)}
                      disabled={!!busy[c.id]}
                      className="rounded-md bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      {busy[c.id] ? "Saving…" : "Approve"}
                    </button>
                  )}
                  <button
                    onClick={() => destroy(c.id)}
                    disabled={!!busy[c.id]}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {busy[c.id] ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AdminGuard>
  );
}
