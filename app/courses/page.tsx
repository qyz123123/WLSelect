"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Card } from "@/components/card";
import { CourseCard } from "@/components/course-card";
import { useLocale } from "@/components/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { Course } from "@/lib/types";

export default function CoursesPage() {
  const { copy, locale } = useLocale();
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [system, setSystem] = useState("");
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    subject: "",
    description: "",
    system: "GENERAL",
    gradeLevels: ["G11"] as string[]
  });

  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query.trim());
  }

  if (grade) {
    params.set("grade", grade);
  }

  if (system) {
    params.set("system", system);
  }

  params.set("r", String(refreshNonce));

  const apiUrl = `/api/courses${params.toString() ? `?${params.toString()}` : ""}`;
  const { data, loading, error } = useApiData<{ items: Course[] }>(apiUrl);
  const courses = data?.items ?? [];

  async function createCourse() {
    if (!createForm.name.trim() || !createForm.subject.trim() || !createForm.description.trim()) {
      setCreateError(locale === "zh" ? "请完整填写课程名称、学科和简介。" : "Please provide the course name, subject, and description.");
      return;
    }

    if (createForm.gradeLevels.length === 0) {
      setCreateError(locale === "zh" ? "请至少选择一个年级。" : "Please choose at least one grade.");
      return;
    }

    setCreatingCourse(true);
    setCreateError(null);
    setCreateSuccess(null);

    const response = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: createForm.name,
        subject: createForm.subject,
        description: createForm.description,
        system: createForm.system,
        gradeLevels: createForm.gradeLevels
      })
    });

    const payload = await response.json().catch(() => null);
    setCreatingCourse(false);

    if (!response.ok) {
      setCreateError(payload?.error ?? (locale === "zh" ? "创建课程失败。" : "Unable to create the course."));
      return;
    }

    setCreateSuccess(locale === "zh" ? "课程已创建，当前页面已刷新显示新课程。" : "Course created and added to the list.");
    setCreateForm({
      name: "",
      subject: "",
      description: "",
      system: "GENERAL",
      gradeLevels: ["G11"]
    });
    setCreateOpen(false);
    setRefreshNonce((current) => current + 1);
  }

  function toggleGradeLevel(nextGrade: string) {
    setCreateForm((current) => ({
      ...current,
      gradeLevels: current.gradeLevels.includes(nextGrade)
        ? current.gradeLevels.filter((gradeItem) => gradeItem !== nextGrade)
        : [...current.gradeLevels, nextGrade]
    }));
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading
          title={copy.courses}
          description={
            locale === "zh"
              ? "使用搜索和筛选快速查找课程。"
              : "Use search and filters to find courses quickly."
          }
          action={
            <button
              type="button"
              onClick={() => {
                setCreateOpen((current) => !current);
                setCreateError(null);
                setCreateSuccess(null);
              }}
              className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold transition hover:bg-[var(--surface-alt)]"
            >
              <Plus className="h-4 w-4" />
              {copy.createCourse}
            </button>
          }
        />
        {createOpen ? (
          <div className="mb-4 rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
            <div className="text-sm font-semibold text-[var(--foreground)]">
              {locale === "zh" ? "自由创建课程" : "Create a course freely"}
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {locale === "zh"
                ? "学生和游客都可以直接创建课程，创建后会立刻出现在课程列表中。"
                : "Students and guests can create courses directly, and new courses appear in the list right away."}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={createForm.name}
                onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                placeholder={locale === "zh" ? "课程名称" : "Course name"}
                className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
              />
              <input
                value={createForm.subject}
                onChange={(event) => setCreateForm((current) => ({ ...current, subject: event.target.value }))}
                placeholder={locale === "zh" ? "学科" : "Subject"}
                className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
              />
              <select
                value={createForm.system}
                onChange={(event) => setCreateForm((current) => ({ ...current, system: event.target.value }))}
                className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
              >
                <option value="GENERAL">{locale === "zh" ? "普通课程" : "General"}</option>
                <option value="AP">AP</option>
                <option value="AL">AL</option>
              </select>
              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3">
                <div className="mb-2 text-xs font-semibold text-[var(--muted)]">
                  {locale === "zh" ? "适用年级" : "Grades"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {["G9", "G10", "G11", "G12"].map((gradeOption) => (
                    <button
                      key={gradeOption}
                      type="button"
                      onClick={() => toggleGradeLevel(gradeOption)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        createForm.gradeLevels.includes(gradeOption)
                          ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "border-[var(--border)] bg-white text-[var(--muted)]"
                      }`}
                    >
                      {gradeOption}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={4}
                value={createForm.description}
                onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                placeholder={locale === "zh" ? "课程简介" : "Course description"}
                className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--primary)] md:col-span-2"
              />
            </div>
            {createError ? <div className="mt-3 text-sm text-[var(--danger)]">{createError}</div> : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void createCourse()}
                className="rounded-[var(--radius)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
              >
                {creatingCourse ? (locale === "zh" ? "创建中..." : "Creating...") : copy.createCourse}
              </button>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
              >
                {locale === "zh" ? "收起" : "Close"}
              </button>
            </div>
          </div>
        ) : null}
        {createSuccess ? <div className="mb-4 text-sm text-[var(--success)]">{createSuccess}</div> : null}
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={locale === "zh" ? "搜索课程名称、代码或学科" : "Search course name, code, or subject"}
            className="min-w-0 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
          />
          <select
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
          >
            <option value="">{locale === "zh" ? "全部年级" : "All grades"}</option>
            <option value="G10">G10</option>
            <option value="G11">G11</option>
            <option value="G12">G12</option>
          </select>
          <select
            value={system}
            onChange={(event) => setSystem(event.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
          >
            <option value="">{locale === "zh" ? "全部体系" : "All systems"}</option>
            <option value="AP">AP</option>
            <option value="GENERAL">{locale === "zh" ? "普通课程" : "General"}</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setGrade("");
              setSystem("");
            }}
            className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--surface-alt)] 2xl:w-auto"
          >
            {locale === "zh" ? "清除筛选" : "Clear filters"}
          </button>
        </div>
      </Card>
      <div className="grid gap-5 2xl:grid-cols-2">
        {loading ? <Card>{copy.loadingCourses}</Card> : null}
        {error ? <Card>{error}</Card> : null}
        {!loading && !error && courses.length === 0 ? (
          <Card>{locale === "zh" ? "没有符合条件的课程。" : "No courses matched your filters."}</Card>
        ) : null}
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
