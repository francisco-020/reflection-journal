"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LandingCTAs() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.rpc("is_admin");
      setIsAdmin(!!data);
    })();
  }, []);

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {/* Always visible */}
      <Link
        href="/entries"
        className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
      >
        {/* book icon */}
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h13a3 3 0 013 3v11H6a3 3 0 01-3-3V5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 5v14" />
        </svg>
        Read reflections
      </Link>

      {/* About this project */}
      <Link
        href="/about"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        {/* info icon */}
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
        About this project
      </Link>

      {/* Only for you (when logged in and admin) */}
      {isAdmin && (
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          {/* shield icon */}
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z" />
          </svg>
          Admin
        </Link>
      )}
      {/* No "Sign in" link on the landing page */}
    </div>
  );
}
