"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) setIsAdmin(false);
        return;
      }
      const { data } = await supabase.rpc("is_admin");
      if (mounted) setIsAdmin(!!data);
    }
    check();

    // react to login/logout
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) {
        setIsAdmin(false);
        return;
      }
      supabase.rpc("is_admin").then(({ data }) => setIsAdmin(!!data));
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    try {
      setSigningOut(true);
      await supabase.auth.signOut();
    } finally {
      setSigningOut(false);
      setIsAdmin(false);
      router.push("/");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight text-slate-900">
          Reflection Journal
        </Link>

        <nav className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <Link
                href="/admin"
                className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
              >
                Admin
              </Link>
              <button
                onClick={handleLogout}
                disabled={signingOut}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                title="Log out"
              >
                {signingOut ? "Signing out…" : "Log out"}
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
