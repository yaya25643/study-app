"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session && !isLoginPage) {
        router.push("/login");
      } else if (data.session && isLoginPage) {
        router.push("/");
      } else {
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isLoginPage) {
        router.push("/login");
        setUser(null);
      } else if (session && isLoginPage) {
        router.push("/");
        setUser(session.user);
      } else {
        setUser(session?.user ?? null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router, isLoginPage]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  // ログインページは認証不要
  if (isLoginPage) return <>{children}</>;

  // 未ログインなら何も表示しない(リダイレクト中)
  if (!user) return null;

  return <>{children}</>;
}
