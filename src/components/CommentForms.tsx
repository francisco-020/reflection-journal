"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CommentForm({ entryId }: { entryId: string }) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    const { error } = await supabase.from("comments").insert({
      entry_id: entryId,
      display_name: name || null,
      body,
      // approved defaults to false (RLS enforces)
    });
    if (error) { setErr(error.message); return; }
    setOk(true); setBody(""); setName("");
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <input
        className="w-full rounded-md border px-3 py-2"
        placeholder="Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className="w-full rounded-md border px-3 py-2 min-h-[120px]"
        placeholder="Share your thoughts…"
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok && <p className="text-sm text-green-600">Thanks! Your comment is awaiting approval.</p>}
      <button className="rounded-lg bg-gray-900 px-4 py-2.5 text-white hover:bg-black">Post comment</button>
    </form>
  );
}
