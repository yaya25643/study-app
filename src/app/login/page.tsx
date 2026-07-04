"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setMessage("アカウントを作成しました。そのままログインできます。");
        // 自動でログイン
        await supabase.auth.signInWithPassword({ email, password });
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
          学習管理アプリ
        </h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          {isSignUp ? "アカウントを作成" : "ログイン"}
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block text-sm text-slate-600">
            メールアドレス
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="example@email.com"
            />
          </label>
          <label className="block text-sm text-slate-600">
            パスワード
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder="6文字以上"
              minLength={6}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "処理中..." : isSignUp ? "アカウント作成" : "ログイン"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          {isSignUp ? "すでにアカウントをお持ちの方は" : "アカウントをお持ちでない方は"}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
            className="ml-1 text-blue-600 hover:underline"
          >
            {isSignUp ? "ログイン" : "新規登録"}
          </button>
        </p>
      </div>
    </div>
  );
}
