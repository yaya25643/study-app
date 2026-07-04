"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Course, StudyRecord } from "@/lib/database.types";
import SupabaseSetupNotice from "@/components/SupabaseSetupNotice";

function intensityClass(minutes: number): string {
  if (minutes === 0) return "bg-slate-100";
  if (minutes < 30) return "bg-blue-100";
  if (minutes < 60) return "bg-blue-300";
  if (minutes < 120) return "bg-blue-500";
  return "bg-blue-700";
}

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [duration, setDuration] = useState("");
  const [courseId, setCourseId] = useState("");
  const [studiedAt, setStudiedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    if (!isSupabaseConfigured) return;
    const [recordsRes, coursesRes] = await Promise.all([
      supabase.from("study_records").select("*").order("studied_at"),
      supabase.from("courses").select("*").order("created_at"),
    ]);
    if (recordsRes.error) setError(recordsRes.error.message);
    setRecords(recordsRes.data ?? []);
    setCourses(coursesRes.data ?? []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const minutesByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      map.set(r.studied_at, (map.get(r.studied_at) ?? 0) + r.duration_min);
    }
    return map;
  }, [records]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const courseNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of courses) map.set(c.id, c.title);
    return map;
  }, [courses]);

  const selectedDateRecords = useMemo(() => {
    if (!selectedDate) return [];
    return records.filter((r) => r.studied_at === selectedDate);
  }, [records, selectedDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!duration) return;
    setSubmitting(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("study_records").insert({
      duration_min: Number(duration),
      course_id: courseId || null,
      studied_at: studiedAt,
      user_id: user?.id,
    });
    if (insertError) {
      setError(insertError.message);
    } else {
      setDuration("");
      setCourseId("");
      await loadData();
    }
    setSubmitting(false);
  }

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">学習記録</h1>
      {!isSupabaseConfigured && <SupabaseSetupNotice />}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setMonth((m) => subMonths(m, 1))}
              className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100"
            >
              ‹
            </button>
            <h2 className="font-semibold">
              {format(month, "yyyy年M月", { locale: ja })}
            </h2>
            <button
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
            {weekdays.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const minutes = minutesByDate.get(key) ?? 0;
              const dim = !isSameMonth(day, month);
              const selected = key === selectedDate;
              return (
                <button
                  key={key}
                  type="button"
                  title={`${key}: ${minutes}分`}
                  onClick={() => setSelectedDate(key)}
                  className={`flex aspect-square w-full flex-col items-center justify-center rounded text-xs ${intensityClass(
                    minutes
                  )} ${dim ? "opacity-30" : ""} ${
                    selected ? "ring-2 ring-inset ring-blue-600" : ""
                  }`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span>少ない</span>
            <span className="h-3 w-3 rounded bg-slate-100" />
            <span className="h-3 w-3 rounded bg-blue-100" />
            <span className="h-3 w-3 rounded bg-blue-300" />
            <span className="h-3 w-3 rounded bg-blue-500" />
            <span className="h-3 w-3 rounded bg-blue-700" />
            <span>多い</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-500">
            学習記録を追加
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="block text-sm text-slate-600">
              日付
              <input
                type="date"
                value={studiedAt}
                onChange={(e) => setStudiedAt(e.target.value)}
                className="mt-1 box-border w-full min-w-0 appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="block text-sm text-slate-600">
              学習時間(分)
              <input
                type="number"
                min={1}
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="block text-sm text-slate-600">
              教材
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
              {submitting ? "保存中..." : "記録を保存"}
            </button>
          </form>
        </div>

        {selectedDate && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 md:col-span-3">
            <h2 className="mb-4 text-sm font-semibold text-slate-500">
              {format(new Date(selectedDate), "yyyy年M月d日", { locale: ja })}の内訳
            </h2>
            {selectedDateRecords.length === 0 ? (
              <p className="text-sm text-slate-500">この日の記録はありません。</p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedDateRecords.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2"
                  >
                    <span className="text-sm text-slate-700">
                      {r.course_id
                        ? courseNameById.get(r.course_id) ?? "(削除された教材)"
                        : "教材未設定"}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {r.duration_min}分
                    </span>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
                  <span>合計</span>
                  <span>
                    {selectedDateRecords.reduce((sum, r) => sum + r.duration_min, 0)}分
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
