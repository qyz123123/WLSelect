"use client";

import { useState } from "react";

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

  const apiUrl = `/api/courses${params.toString() ? `?${params.toString()}` : ""}`;
  const { data, loading, error } = useApiData<{ items: Course[] }>(apiUrl);
  const courses = data?.items ?? [];

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
        />
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
