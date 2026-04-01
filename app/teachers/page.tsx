"use client";

import { Card } from "@/components/card";
import { TeacherCard } from "@/components/teacher-card";
import { useLocale } from "@/components/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { TeacherProfile } from "@/lib/types";

export default function TeachersPage() {
  const { copy } = useLocale();
  const { data, loading, error } = useApiData<{ items: TeacherProfile[] }>("/api/teachers");
  const teachers = data?.items ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading
          title={copy.teachers}
          description="Browse teacher profiles, teaching style, official courses taught, student commentary, and ratings."
        />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-[var(--primary-soft)] p-4">
            <div className="text-sm font-semibold text-[var(--primary)]">Subject filters</div>
            <p className="mt-3 text-sm text-[var(--muted)]">Physics, Economics, Humanities, Sciences</p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] p-4">
            <div className="text-sm font-semibold">Rating filters</div>
            <p className="mt-3 text-sm text-[var(--muted)]">Most starred, highest clarity, most discussed</p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] p-4">
            <div className="text-sm font-semibold">Role-aware visibility</div>
            <p className="mt-3 text-sm text-[var(--muted)]">Teacher-visible comments remain distinct from public-only feedback.</p>
          </div>
        </div>
      </Card>
      <div className="space-y-5">
        {loading ? <Card>Loading teachers...</Card> : null}
        {error ? <Card>{error}</Card> : null}
        {teachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>
    </div>
  );
}
