// src/app/entries/[slug]/page.tsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import CommentForm from "@/components/CommentForms";
import CommentGuidelines from "@/components/CommentGuidelines";
import CommentsList from "@/components/CommentsList";
import RenderEntryBody from "@/components/RenderEntryBody";
import type { Metadata } from "next";

export const revalidate = 0;

type Params = { params: { slug: string } };

// helper to make a short description from the body
function excerpt(s: string, n = 160) {
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length > n ? clean.slice(0, n - 1) + "…" : clean;
}

// Use a site URL if you have one (set NEXT_PUBLIC_SITE_URL in .env.local), fallback to localhost
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// This runs on the server and sets <title>, Open Graph, etc. based on the entry
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: entry } = await supabase
    .from("entries")
    .select("title, body, created_at")
    .eq("slug", params.slug)
    .single();

  if (!entry) {
    return {
      title: "Reflection not found",
      description: "This reflection doesn’t exist.",
      alternates: { canonical: `${SITE_URL}/entries/${params.slug}` },
    };
  }

  const url = `${SITE_URL}/entries/${params.slug}`;
  const title = entry.title || "Reflection";
  const description = excerpt(entry.body);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Reflection Journal",
      authors: ["Francisco"],
      publishedTime: entry.created_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function EntryPage({ params }: Params) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // fetch entry by slug
  const { data: entry } = await supabase
    .from("entries")
    .select("id, title, body, created_at")
    .eq("slug", params.slug)
    .single();

  if (!entry) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <div className="mb-4">
          <Link
            href="/entries"
            className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to all reflections
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Not found</h1>
          <p className="mt-2 text-slate-600">This reflection doesn’t exist.</p>
        </div>
      </main>
    );
  }

  // approved comments only
  const { data: comments } = await supabase
    .from("comments")
    .select("id, display_name, body, created_at")
    .eq("entry_id", entry.id)
    .order("created_at", { ascending: true });

  const wordCount = entry.body.trim().split(/\s+/).length;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));
  const count = comments?.length ?? 0;

  return (
    <main className="max-w-3xl mx-auto p-6">
      {/* breadcrumb */}
      <div className="mb-4">
        <Link
          href="/entries"
          className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to all reflections
        </Link>
      </div>

      {/* header */}
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {entry.title}
        </h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
          <span>{new Date(entry.created_at).toLocaleDateString()}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{readMins} min read</span>
        </div>
      </header>

      {/* body */}
      <article className="mt-6">
        <RenderEntryBody text={entry.body} />
      </article>

      {/* divider */}
      <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* comments */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
          <span className="text-sm text-slate-500">
            {count} {count === 1 ? "comment" : "comments"}
          </span>
        </div>

        {/* Simple, badged list */}
        <CommentsList comments={comments ?? []} />

        {/* comment form card */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <CommentGuidelines />
          <div className="mb-2 text-sm font-medium text-slate-900">Leave a comment</div>
          <p className="text-xs text-slate-500">
            Be thoughtful and respectful. Your comment will appear once approved.
          </p>
          <CommentForm entryId={entry.id} />
        </div>
      </section>
    </main>
  );
}
