"use client";

import { Card } from "@/components/card";
import { CourseCard } from "@/components/course-card";
import { useLocale } from "@/components/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { Course } from "@/lib/types";

export default function CoursesPage() {
  const { copy } = useLocale();
  const { data, loading, error } = useApiData<{ items: Course[] }>("/api/courses");
  const courses = data?.items ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading
          title={copy.courses}
          description="Official course directory with system filters, grade coverage, prerequisites, comments, questions, and saved counts."
        />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-[var(--primary-soft)] p-4">
            <div className="text-sm font-semibold text-[var(--primary)]">Systems</div>
            <p className="mt-3 text-sm text-[var(--muted)]">AP, AL, General</p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] p-4">
            <div className="text-sm font-semibold">Grade filters</div>
            <p className="mt-3 text-sm text-[var(--muted)]">G9, G10, G11, G12</p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] p-4">
            <div className="text-sm font-semibold">Discovery</div>
            <p className="mt-3 text-sm text-[var(--muted)]">Most starred, most discussed, rating range</p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] p-4">
            <div className="text-sm font-semibold">Search</div>
            <p className="mt-3 text-sm text-[var(--muted)]">Course name, code, keywords in commentary</p>
          </div>
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-2">
        {loading ? <Card>Loading courses...</Card> : null}
        {error ? <Card>{error}</Card> : null}
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
