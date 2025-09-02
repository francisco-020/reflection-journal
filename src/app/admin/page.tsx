"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";

type Entry = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
};

type PendingComment = {
  id: string;
  body: string;
  display_name: string | null;
  created_at: string;
  entry_id: string;
  entries: { title: string; slug: string } | null;
};

type RawPendingComment = Omit<PendingComment, "entries"> & {
  entries:
    | { title: string; slug: string }[]
    | { title: string; slug: string }
    | null;
};

export default function AdminPage() {
  const [items, setItems] = useState<Entry[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // UI state (client-side filter only)
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");

  // Pending comments
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [pending, setPending] = useState<PendingComment[]>([]);
  const [moderatingIds, setModeratingIds] = useState<Record<string, boolean>>(
    {}
  );

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // Entries for the list / stats
      const { data: entries, error: entriesErr } = await supabase
        .from("entries")
        .select("id, title, slug, published, created_at")
        .order("created_at", { ascending: false });

      if (entriesErr) setErr(entriesErr.message);
      else setItems(entries ?? []);

      // Pending comments count
      const { count } = await supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("approved", false);
      setPendingCount(count ?? 0);

      // Preview top 5 oldest pending, with entry title/slug
      const { data: previewRaw } = await supabase
        .from("comments")
        .select(
          "id, body, display_name, created_at, entry_id, entries:entry_id (title, slug)"
        )
        .eq("approved", false)
        .order("created_at", { ascending: true })
        .limit(5)
        .returns<RawPendingComment[]>();

      // normalize nested relation
      const preview: PendingComment[] = (previewRaw ?? []).map((row) => ({
        ...row,
        entries: Array.isArray(row.entries) ? row.entries[0] ?? null : row.entries,
      }));
      setPending(preview);

      setLoading(false);
    })();
  }, []);

  const counts = useMemo(() => {
    const total = items.length;
    const published = items.filter((e) => e.published).length;
    const drafts = total - published;
    return { total, published, drafts };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((e) => {
      if (status === "published" && !e.published) return false;
      if (status === "draft" && e.published) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) || e.slug.toLowerCase().includes(q)
      );
    });
  }, [items, query, status]);

  function formatBadge(n: number) {
    if (n > 99) return "99+";
    return String(n);
  }

  async function approveComment(id: string) {
    setModeratingIds((m) => ({ ...m, [id]: true }));
    const { error } = await supabase
      .from("comments")
      .update({ approved: true })
      .eq("id", id);
    if (!error) {
      setPending((rows) => rows.filter((r) => r.id !== id));
      setPendingCount((c) => Math.max(0, c - 1));
    }
    setModeratingIds((m) => ({ ...m, [id]: false }));
  }

  async function deleteComment(id: string) {
    setModeratingIds((m) => ({ ...m, [id]: true }));
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (!error) {
      setPending((rows) => rows.filter((r) => r.id !== id));
      setPendingCount((c) => Math.max(0, c - 1));
    }
    setModeratingIds((m) => ({ ...m, [id]: false }));
  }

  async function removeEntry(id: string) {
    const ok = window.confirm(
      "Delete this entry? This will also remove its comments."
    );
    if (!ok) return;
    setDeletingId(id);
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) {
      setErr(error.message);
    } else {
      setItems((prev) => prev.filter((e) => e.id !== id));
    }
    setDeletingId(null);
  }

  return (
    <AdminGuard>
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-sm text-teal-700">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8a4 4 0 100 8 4 4 0 000-8z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 12h2m12 0h2M6.3 6.3l1.4 1.4m8.6 8.6l1.4 1.4M6.3 17.7l1.4-1.4m8.6-8.6l1.4-1.4"
              />
            </svg>
            Admin
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-slate-600">
            Manage reflections and review comments.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or slug…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pl-9 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-3.5-3.5"
                />
              </svg>
            </div>
            <select
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              aria-label="Filter status"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/comments"
              className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50"
              title="Moderate comments"
            >
              Moderate comments
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex min-w-[22px] items-center justify-center rounded-full bg-teal-600 px-1.5 py-1 text-[11px] font-semibold leading-none text-white ring-2 ring-white shadow">
                  {formatBadge(pendingCount)}
                </span>
              )}
            </Link>

            <Link
              href="/admin/new"
              className="rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700"
              title="Create a new entry"
            >
              New entry
            </Link>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Total</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {counts.total}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Published</div>
            <div className="mt-1 text-2xl font-bold text-teal-700">
              {counts.published}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Drafts</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {counts.drafts}
            </div>
          </div>
        </div>

        {/* Pending comments preview */}
        <div className="mt-6">
          <div className="flex items-center justify_between">
            <h2 className="text-lg font-semibold text-slate-900">
              Pending comments
            </h2>
            <Link
              href="/admin/comments"
              className="text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              Review all
            </Link>
          </div>

          {pendingCount === 0 ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
              No comments waiting for approval.
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {pending.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-slate-200 bg_white p-5"
                >
                  <div className="text-sm text-slate-800 whitespace-pre-wrap">
                    {c.body}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {(c.display_name || "Guest")} ·{" "}
                    {new Date(c.created_at).toLocaleString()}
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
                    <button
                      onClick={() => approveComment(c.id)}
                      disabled={!!moderatingIds[c.id]}
                      className="rounded-md bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      {moderatingIds[c.id] ? "Saving…" : "Approve"}
                    </button>
                    <button
                      onClick={() => deleteComment(c.id)}
                      disabled={!!moderatingIds[c.id]}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {moderatingIds[c.id] ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Entries list */}
        <div className="mt-8">
          {err && <p className="text-red-600">{err}</p>}

          {loading ? (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-9 w-full animate-pulse rounded bg-slate-100" />
                </li>
              ))}
            </ul>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13l3-8h12l3 8M5 13v5h14v-5"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 13a3 3 0 006 0"
                  />
                </svg>
              </div>
              <p className="mt-3 text-slate-700">Nothing to show.</p>
              <p className="text-sm text-slate-500">
                Try clearing the search or change the filter.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((e) => (
                <li
                  key={e.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">
                          {e.title}
                        </h3>
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs",
                            e.published
                              ? "bg-teal-50 text-teal-700 border border-teal-100"
                              : "bg-slate-100 text-slate-700 border border-slate-200",
                          ].join(" ")}
                        >
                          {e.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {new Date(e.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/entries/${e.slug}`}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 hover:bg-slate-50"
                        title="View public page"
                      >
                        View
                      </Link>

                      {/* NEW: Edit -> reuse /admin/new for editing */}
                      <Link
                        href={`/admin/new?id=${e.id}`}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 hover:bg-slate-50"
                        title="Edit entry"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => removeEntry(e.id)}
                        disabled={deletingId === e.id}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-60"
                        title="Delete entry"
                      >
                        {deletingId === e.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">/{e.slug}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}
