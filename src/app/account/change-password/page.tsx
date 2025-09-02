// src/app/account/change-password/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ChangePassword() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);   // ← hide UI while we check
  const [pwd, setPwd] = useState("");
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (!data.session) {
        router.replace("/login?redirect=/account/change-password"); // no UI flash
        return; // we'll keep rendering null until navigation occurs
      }
      setChecking(false); // we have a session → show the form
    });
    return () => { isMounted = false; };
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOk(""); setErr("");
    if (pwd.length < 12) { setErr("Please use at least 12 characters."); return; }
    try {
      setSubmitting(true);
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) setErr(error.message);
      else setOk("Password updated.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return null; // ← no render until we know; prevents flashing

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-3">
      <label className="block text-sm font-medium text-slate-700">New password</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="New password"
          autoComplete="new-password"
          className="w-full rounded-md border px-3 py-2 pr-24"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>

      <button
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? "Updating…" : "Update"}
      </button>

      {ok && <p className="text-emerald-700 text-sm">{ok}</p>}
      {err && <p className="text-rose-600 text-sm">{err}</p>}
    </form>
  );
}
