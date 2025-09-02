"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignupForm() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pw, // Supabase default min length is 6
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    // If you’ve disabled email confirmations, you should have a session now.
    // Fallback: if no session, ask user to check email (keeps it robust).
    if (data.session) {
      r.push("/"); // or "/new" if you want to jump straight to authoring
      return;
    }

    setOk(true);
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Create account</h1>
      <div className="mt-4 space-y-3">
        <input
          autoFocus
          type="email"
          placeholder="Email"
          className="w-full rounded-md border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-md border px-3 py-2"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        {ok && (
          <p className="text-sm text-green-600">
            Account created. If email confirmation is off, you should be signed in.
          </p>
        )}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Sign up"}
        </button>
      </div>
    </form>
  );
}
