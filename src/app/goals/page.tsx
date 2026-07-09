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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editReminderTime, setEditReminderTime] = useState("");

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

  function startEdit(goal: Goal) {
    setEditingId(goal.id);
    setEditTitle(goal.title);
    setEditDeadline(goal.deadline ?? "");
    setEditReminderTime(goal.reminder_time ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDeadline("");
    setEditReminderTime("");
  }

  async function handleEditSave(id: string) {
    if (!editTitle.trim()) return;
    const { error: updateError } = await supabase
      .from("goals")
      .update({
        title: editTitle.trim(),
        deadline: editDeadline || null,
        reminder_time: editReminderTime || null,
      })
      .eq("id", id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              title: editTitle.trim(),
              deadline: editDeadline || null,
              reminder_time: editReminderTime || null,
            }
          : g
      )
    );
    cancelEdit();
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
        <label className="block text-sm text-slate-600">
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
        <label className="block text-sm text-slate-600">
          期限
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 box-border w-full min-w-0 appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="block text-sm text-slate-600">
          リマインダー
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="mt-1 box-border w-full min-w-0 appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
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
        {goals.map((goal) =>
          editingId === goal.id ? (
            <div
              key={goal.id}
              className="flex flex-col gap-3 rounded-xl border border-blue-300 bg-white p-4"
            >
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                placeholder="目標"
              />
              <input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="box-border w-full min-w-0 appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
              <input
                type="time"
                value={editReminderTime}
                onChange={(e) => setEditReminderTime(e.target.value)}
                className="box-border w-full min-w-0 appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSave(goal.id)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  onClick={cancelEdit}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
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
              <div className="flex shrink-0 gap-3">
                <button
                  onClick={() => startEdit(goal)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(goal.id, goal.title)}
                  className="text-xs text-red-500 hover:underline"
                >
                  削除
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
