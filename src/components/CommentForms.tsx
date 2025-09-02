// src/components/CommentForms.tsx
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const TAG_RE = /^\s*\[(agree|disagree|question|insight|resource|prayer)\]\s*/i;
const MIN_LEN = 20;
const MAX_LEN = 800;
const RATE_WINDOW_MS = 30_000; // 30s between posts per browser
const LAST_POST_KEY = "rj:lastCommentAt";

export default function CommentForm({ entryId }: { entryId: string }) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // (nice UX) clear “success” after a bit
  useEffect(() => {
    if (!ok) return;
    const t = setTimeout(() => setOk(false), 4000);
    return () => clearTimeout(t);
  }, [ok]);

  function validate(form: HTMLFormElement) {
    // 1) honeypot
    const hp = (new FormData(form).get("website") as string) || "";
    if (hp.trim()) return "Please try again.";

    const trimmed = body.trim();

    // 2) stance tag
    if (!TAG_RE.test(trimmed)) {
      return "Begin with a tag like [Disagree], [Agree], or [Question] (you can also use [Insight], [Resource], or [Prayer]).";
    }

    // 3) length bounds
    if (trimmed.length < MIN_LEN) {
      return `Please share at least ${MIN_LEN} characters (a sentence or two).`;
    }
    if (trimmed.length > MAX_LEN) {
      return `Please keep comments under ${MAX_LEN} characters.`;
    }

    // 4) URL limit (simple)
    const urlCount = (trimmed.match(/https?:\/\/\S+/gi) || []).length;
    if (urlCount > 2) {
      return "Please include no more than 2 links.";
    }

    // 5) client rate limit
    const last = Number(localStorage.getItem(LAST_POST_KEY) || 0);
    const now = Date.now();
    if (now - last < RATE_WINDOW_MS) {
      const secs = Math.ceil((RATE_WINDOW_MS - (now - last)) / 1000);
      return `Please wait ${secs}s before posting again.`;
    }

    return null; // all good
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setOk(false);

    const form = e.currentTarget;
    const message = validate(form);
    if (message) {
      setErr(message);
      return;
    }

    const trimmed = body.trim();

    try {
      setSubmitting(true);
      const { error } = await supabase.from("comments").insert({
        entry_id: entryId,
        display_name: name || null,
        body: trimmed, // approved defaults to false (RLS)
      });
      if (error) {
        setErr(error.message);
        return;
      }
      localStorage.setItem(LAST_POST_KEY, String(Date.now()));
      setOk(true);
      setBody("");
      setName("");
      form.reset(); // clears honeypot just in case
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      {/* Honeypot (hidden from humans; bots often fill it) */}
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <input
        className="w-full rounded-md border px-3 py-2"
        placeholder="Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
      />

      <textarea
        className="w-full rounded-md border px-3 py-2 min-h-[120px]"
        placeholder="[Disagree] I see this passage differently because… (include verse if possible)"
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={MAX_LEN}
      />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Start with a tag: <code>[Agree]</code> <code>[Disagree]</code>{" "}
          <code>[Question]</code> <code>[Insight]</code> <code>[Resource]</code>{" "}
          <code>[Prayer]</code>.
        </span>
        <span>{body.trim().length}/{MAX_LEN}</span>
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}
      {ok && (
        <p className="text-sm text-emerald-700">
          Thanks! Your comment is awaiting approval.
        </p>
      )}

      <button
        className="rounded-lg bg-gray-900 px-4 py-2.5 text-white hover:bg-black disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
