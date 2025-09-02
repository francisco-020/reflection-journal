"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const r = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { r.push("/login"); return; }

      const { data, error } = await supabase.rpc("is_admin");
      if (error || !data) { r.push("/login"); return; }

      setOk(true);
    })();
  }, [r]);

  if (ok === null) return <main className="p-6">Checking permissions…</main>;
  return <>{children}</>;
}
