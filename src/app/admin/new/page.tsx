"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminGuard from "@/components/AdminGuard";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export default function AdminNew() {
  const r = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    const slug = slugify(title);
    const { error } = await supabase.from("entries").insert({ title, slug, body, published });
    if (error) { setErr(error.message); setLoading(false); return; }
    r.push("/admin");
  }

  return (
    <AdminGuard>
      <main className="min-h-screen grid place-items-center p-6 bg-gray-50">
        <form onSubmit={submit} className="w-full max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">New reflection</h1>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-md border px-3 py-2" placeholder="Title"
                   value={title} onChange={(e)=>setTitle(e.target.value)} required />
            <textarea className="w-full rounded-md border px-3 py-2 min-h-[160px]" placeholder="Body"
                      value={body} onChange={(e)=>setBody(e.target.value)} required />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={published} onChange={()=>setPublished(v=>!v)} />
              Published
            </label>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button disabled={loading}
                    className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
              {loading ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      </main>
    </AdminGuard>
  );
}
