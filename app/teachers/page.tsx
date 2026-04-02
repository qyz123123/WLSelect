"use client";

import Link from "next/link";
import { useState } from "react";

import { Card } from "@/components/card";
import { TeacherCard } from "@/components/teacher-card";
import { useLocale } from "@/components/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { TeacherProfile } from "@/lib/types";

export default function TeachersPage() {
  const { copy, locale } = useLocale();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState("");
  const { data, loading, error } = useApiData<{ items: TeacherProfile[] }>("/api/teachers");
  const teachers = data?.items ?? [];

  const subjectOptions = Array.from(new Set(teachers.map((teacher) => teacher.subjectArea).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const departmentOptions = Array.from(new Set(teachers.map((teacher) => teacher.department).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const normalizedQuery = query.trim().toLowerCase();
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesQuery = normalizedQuery
      ? [
          teacher.name,
          teacher.department,
          teacher.subjectArea,
          teacher.bio,
          teacher.teachingStyle,
          ...teacher.coursesTaught
        ].some((value) => value.toLowerCase().includes(normalizedQuery))
      : true;
    const matchesSubject = subject ? teacher.subjectArea === subject : true;
    const matchesDepartment = department ? teacher.department === department : true;

    return matchesQuery && matchesSubject && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading
          title={copy.teachers}
          description={
            locale === "zh"
              ? "浏览教师资料、教学风格、官方授课课程、学生评论和评分。"
              : "Browse teacher profiles, teaching style, official courses taught, student commentary, and ratings."
          }
        />
        <div className="mb-4 flex justify-end">
          <Link href="/teacher/register" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--surface-alt)]">
            {locale === "zh" ? "创建老师" : "Create teacher"}
          </Link>
        </div>
        <div className="grid items-stretch gap-4 md:grid-cols-2 2xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={locale === "zh" ? "搜索教师姓名、课程、学科或简介" : "Search teacher name, course, subject, or bio"}
            className="min-w-0 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--primary)] md:col-span-2 2xl:col-span-1"
          />
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
          >
            <option value="">{locale === "zh" ? "全部学科" : "All subjects"}</option>
            {subjectOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
          >
            <option value="">{locale === "zh" ? "全部部门" : "All departments"}</option>
            {departmentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSubject("");
              setDepartment("");
            }}
            className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-semibold whitespace-nowrap transition hover:bg-[var(--surface-alt)] 2xl:w-auto"
          >
            {locale === "zh" ? "清除筛选" : "Clear filters"}
          </button>
        </div>
      </Card>
      <div className="space-y-5">
        {loading ? <Card>{copy.loadingTeachers}</Card> : null}
        {error ? <Card>{error}</Card> : null}
        {!loading && !error && filteredTeachers.length === 0 ? (
          <Card>
            <div className="space-y-3">
              <div>{copy.noTeachersMatched}</div>
              <Link href="/teacher/register" className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
                {locale === "zh" ? "创建老师" : "Create teacher"}
              </Link>
            </div>
          </Card>
        ) : null}
        {filteredTeachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>
    </div>
  );
}
