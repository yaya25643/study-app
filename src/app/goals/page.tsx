"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Goal } from "@/lib/database.types";
import SupabaseSetupNotice from "@/components/SupabaseSetupNotice";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [reminderTime, setReminderTime] = useState("20:00");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadGoals() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });
    if (fetchError) setError(fetchError.message);
    setGoals(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("goals").insert({
      title: title.trim(),
      deadline: deadline || null,
      reminder_time: reminderTime || null,
      user_id: user?.id,
    });
    if (insertError) {
      setError(insertError.message);
    } else {
      setTitle("");
      setDeadline("");
      await loadGoals();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`「${title}」を削除しますか?`)) return;
    await supabase.from("goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">目標設定</h1>
      {!isSupabaseConfigured && <SupabaseSetupNotice />}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5"
      >
        <label className="text-sm text-slate-600">
          目標
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: TOEICスコアを700点にする"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="text-sm text-slate-600">
          期限
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="text-sm text-slate-600">
          リマインダー
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !isSupabaseConfigured}
          className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "保存中..." : "目標を保存"}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {!loading && goals.length === 0 && (
          <p className="text-sm text-slate-500">まだ目標がありません。</p>
        )}
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div>
              <h3 className="font-semibold text-slate-900">{goal.title}</h3>
              <p className="text-sm text-slate-500">
                {goal.deadline && `期限: ${goal.deadline}`}
                {goal.deadline && goal.reminder_time && " / "}
                {goal.reminder_time && `リマインダー: ${goal.reminder_time}`}
              </p>
            </div>
            <button
              onClick={() => handleDelete(goal.id, goal.title)}
              className="text-xs text-red-500 hover:underline"
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
