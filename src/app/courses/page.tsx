"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Course } from "@/lib/database.types";
import SupabaseSetupNotice from "@/components/SupabaseSetupNotice";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadCourses() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("courses")
      .select("*")
      .order("created_at");
    if (fetchError) setError(fetchError.message);
    setCourses(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    const { error: insertError } = await supabase.from("courses").insert({
      title: title.trim(),
      description: description.trim() || null,
      progress: 0,
    });
    if (insertError) {
      setError(insertError.message);
    } else {
      setTitle("");
      setDescription("");
      await loadCourses();
    }
    setSubmitting(false);
  }

  async function handleProgressChange(id: string, progress: number) {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, progress } : c))
    );
    await supabase.from("courses").update({ progress }).eq("id", id);
  }

  async function handleDelete(id: string) {
    await supabase.from("courses").delete().eq("id", id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">教材一覧</h1>
      {!isSupabaseConfigured && <SupabaseSetupNotice />}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="text-sm font-semibold text-slate-500">教材を追加</h2>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="教材名(例: 基礎から学ぶプログラミング)"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="説明(任意)"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        <button
          type="submit"
          disabled={submitting || !isSupabaseConfigured}
          className="self-start rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "追加中..." : "追加する"}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {!loading && courses.length === 0 && (
          <p className="text-sm text-slate-500">まだ教材がありません。</p>
        )}
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-slate-500">
                    {course.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(course.id)}
                className="text-xs text-red-500 hover:underline"
              >
                削除
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={course.progress}
                onChange={(e) =>
                  handleProgressChange(course.id, Number(e.target.value))
                }
                className="flex-1"
              />
              <span className="w-12 text-right text-sm font-medium text-slate-600">
                {course.progress}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
