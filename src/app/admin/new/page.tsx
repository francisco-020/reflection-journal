// src/app/admin/new/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

type Entry = {
  id: string;
  title: string;
  body: string;
  published: boolean;
  slug: string;
};

function AdminNewOrEditInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const id = sp.get("id"); // if present → EDIT mode
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(true);

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit); // load only when editing
  const [saving, setSaving] = useState(false);

  // If editing, fetch existing entry once
  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from("entries")
        .select("id, title, body, published, slug")
        .eq("id", id)
        .single();

      if (!alive) return;

      if (error || !data) {
        setErr(error?.message ?? "Entry not found.");
      } else {
        const e = data as Entry;
        setTitle(e.title ?? "");
        setBody(e.body ?? "");
        setPublished(!!e.published);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setSaving(true);

    const t = title.trim();
    const b = body.trim();
    if (t.length < 3) {
      setErr("Title is too short.");
      setSaving(false);
      return;
    }
    if (b.length < 20) {
      setErr("Body is too short.");
      setSaving(false);
      return;
    }

    if (isEdit) {
      // UPDATE existing
      const { error } = await supabase
        .from("entries")
        .update({ title: t, body: b, published })
        .eq("id", id!);

      setSaving(false);
      if (error) {
        setErr(error.message);
        return;
      }
      router.push("/admin");
    } else {
      // CREATE new
      const slug = slugify(t);
      const { error } = await supabase.from("entries").insert({ title: t, slug, body: b, published });

      setSaving(false);
      if (error) {
        setErr(error.message);
        return;
      }
      router.push("/admin");
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-gray-50">
      <form onSubmit={submit} className="w-full max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{isEdit ? "Edit reflection" : "New reflection"}</h1>
          <Link href="/admin" className="text-sm text-teal-700 hover:text-teal-800">
            Back
          </Link>
        </div>

        {err && <p className="mb-3 text-sm text-red-600">{err}</p>}

        {loading ? (
          <p className="text-sm text-slate-600">Loading…</p>
        ) : (
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-md border px-3 py-2"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              className="w-full rounded-md border px-3 py-2 min-h-[160px]"
              placeholder="Body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Published
            </label>

            <button
              disabled={saving}
              className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? (isEdit ? "Saving…" : "Posting…") : isEdit ? "Save changes" : "Post"}
            </button>
          </div>
        )}
      </form>
    </main>
  );
}

export default function AdminNewOrEdit() {
  return (
    <AdminGuard>
      <Suspense fallback={<div className="p-6">Loading…</div>}>
        <AdminNewOrEditInner />
      </Suspense>
    </AdminGuard>
  );
}
