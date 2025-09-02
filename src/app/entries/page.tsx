// src/app/entries/page.tsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0; // always fresh

export default async function EntriesPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // RLS already restricts the public to published entries
  const { data: entries, error } = await supabase
    .from("entries")
    .select("title, slug, body, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="relative min-h-[60vh]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(120px 120px at 70% 30%, #14b8a655, transparent 60%)" }}
        />
        <div className="mx-auto max-w-6xl px-6 py-12">
          {/* Back to home */}
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-sm text-teal-700">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h13a3 3 0 013 3v11H6a3 3 0 01-3-3V5z" />
            </svg>
            Reflections
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">All reflections</h1>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-red-600">
            Failed to load entries.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* soft teal accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-28 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(140px 140px at 70% 30%, #14b8a655, transparent 60%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-28 h-[30rem] w-[30rem] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(160px 160px at 30% 70%, #34d39955, transparent 60%)" }}
      />

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 py-12">
          {/* Back to home */}
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>
          </div>

          {/* header */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-sm text-teal-700">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h13a3 3 0 013 3v11H6a3 3 0 01-3-3V5z" />
            </svg>
            Reflections
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">All reflections</h1>
          <p className="mt-1 text-slate-600">Browse recent entries. Comments are shown after approval.</p>

          {/* list */}
          {(!entries || entries.length === 0) ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />
                </svg>
              </div>
              <p className="mt-3 text-slate-700">No reflections yet.</p>
              <p className="text-sm text-slate-500">Please check back soon.</p>
            </div>
          ) : (
            <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {entries.map((e) => {
                const snippet =
                  (e as any).body && (e as any).body.length > 180
                    ? (e as any).body.slice(0, 180).trimEnd() + "…"
                    : ((e as any).body ?? "");
                return (
                  <li key={e.slug}>
                    <Link
                      href={`/entries/${e.slug}`}
                      className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="text-xs text-slate-500">
                        {new Date(e.created_at).toLocaleDateString()}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900 line-clamp-2">
                        {e.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-4">{snippet}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-700">
                        Read more
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
