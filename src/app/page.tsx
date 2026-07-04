"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Course, StudyRecord } from "@/lib/database.types";
import ProgressRing from "@/components/ProgressRing";
import SupabaseSetupNotice from "@/components/SupabaseSetupNotice";

function calcStreak(dates: string[]): number {
  const uniqueDates = Array.from(new Set(dates)).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = cursor.toISOString().slice(0, 10);
    if (uniqueDates.includes(expected)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [durationMin, setDurationMin] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [coursesRes, recordsRes] = await Promise.all([
      supabase.from("courses").select("*").order("created_at"),
      supabase.from("study_records").select("*").order("studied_at"),
    ]);
    if (coursesRes.error) setError(coursesRes.error.message);
    if (recordsRes.error) setError(recordsRes.error.message);
    setCourses(coursesRes.data ?? []);
    setRecords(recordsRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!durationMin) return;
    setSubmitting(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("study_records").insert({
      duration_min: Number(durationMin),
      course_id: courseId || null,
      studied_at: new Date().toISOString().slice(0, 10),
      user_id: user?.id,
    });
    if (insertError) {
      setError(insertError.message);
    } else {
      setDurationMin("");
      setCourseId("");
      await loadData();
    }
    setSubmitting(false);
  }

  const overallProgress =
    courses.length > 0
      ? courses.reduce((sum, c) => sum + c.progress, 0) / courses.length
      : 0;
  const streak = calcStreak(records.map((r) => r.studied_at));
  const todayMinutes = records
    .filter((r) => r.studied_at === new Date().toISOString().slice(0, 10))
    .reduce((sum, r) => sum + r.duration_min, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold">ダッシュボード</h1>
      {!isSupabaseConfigured && <SupabaseSetupNotice />}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-500">
            学習進捗
          </h2>
          <div className="flex flex-col items-center gap-4">
            <ProgressRing percent={overallProgress} />
            <div className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600">
              🔥 {streak}日連続
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-500">
            今日の学習記録
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="block text-sm text-slate-600">
              学習時間(分)
              <input
                type="number"
                min={1}
                required
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                placeholder="例: 60"
              />
            </label>
            <label className="block text-sm text-slate-600">
              学習内容
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="">選択してください</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={submitting || !isSupabaseConfigured}
              className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "記録中..." : "記録する"}
            </button>
            <p className="text-xs text-slate-400">
              今日の合計学習時間: {todayMinutes}分
            </p>
          </form>
        </div>
      </div>

      {!loading && courses.length === 0 && isSupabaseConfigured && (
        <p className="mt-6 text-sm text-slate-500">
          まだ教材が登録されていません。教材一覧から追加してください。
        </p>
      )}
    </div>
  );
}
