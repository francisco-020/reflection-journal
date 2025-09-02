// src/app/page.tsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import LandingCTAs from "@/components/LandingCTAs";

type Entry = {
  title: string;
  slug: string;
  body: string;
  created_at: string;
};

export const revalidate = 0; // always show latest

export default async function LandingPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: entries } = await supabase
    .from("entries")
    .select("title, slug, body, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* soft, contemplative gradient accents (teal/emerald) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-28 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(140px 140px at 70% 30%, #14b8a655, transparent 60%)" }} // teal-500 @ ~33% alpha
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-28 h-[30rem] w-[30rem] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(160px 160px at 30% 70%, #34d39955, transparent 60%)" }} // emerald-400 @ ~33% alpha
      />

      {/* hero */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pt-20 md:pt-28">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-slate-600 bg-white/60 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
            Reflection Journal
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            A calm place to explore{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
              theology, philosophy
            </span>{" "}
            & spirituality
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Public to read and discuss. Authoring is private — only I can publish.
            Thoughtful, respectful comments are welcome.
          </p>

          {/* ✅ Replace the old buttons block with this */}
          <LandingCTAs />
        </div>
      </section>

      {/* latest reflections */}
      <section className="relative mt-16 mb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Latest reflections</h2>
            <Link href="/entries" className="text-sm font-medium text-teal-700 hover:text-teal-800">
              View all
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {(entries ?? []).map((e) => {
              const snippet = e.body.length > 160 ? e.body.slice(0, 160).trimEnd() + "…" : e.body;
              return (
                <Link
                  key={e.slug}
                  href={`/entries/${e.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
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
              );
            })}

            {/* empty state */}
            {(!entries || entries.length === 0) && (
              <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-slate-600">No reflections yet. Check back soon.</p>
              </div>
            )}
          </div>

          {/* comment policy */}
          <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
            <div className="flex items-center gap-2 font-medium text-slate-900">
              {/* chat icon */}
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v10H7l-3 3V6z" />
              </svg>
              Comments & moderation
            </div>
            <p className="mt-1">
              Visitors can leave comments on each reflection. Comments are public once approved.
              Please be respectful and constructive.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
