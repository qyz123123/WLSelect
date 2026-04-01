"use client";

import { BarChart3, Star } from "lucide-react";

import { useLocale } from "@/components/locale-provider";
import { summarizeRatings } from "@/lib/analytics";
import { RatingValue } from "@/lib/types";

export function RatingSummary({ ratings }: { ratings: RatingValue[] }) {
  const { copy } = useLocale();
  const summary = summarizeRatings(ratings);
  const studentRatings = ratings.filter((item) => item.role === "student");
  const teacherSelfRatings = ratings.filter((item) => item.role === "teacher-self");

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-3xl bg-[var(--primary-soft)] p-4">
        <div className="flex items-center gap-2 text-[var(--primary)]">
          <Star className="h-4 w-4" />
          <span className="text-sm font-semibold">{copy.ratings}</span>
        </div>
        <div className="mt-3 text-3xl font-semibold tracking-tight">{summary.count > 0 ? summary.average : "—"}</div>
        <div className="mt-1 text-sm text-[var(--muted)]">{summary.count > 0 ? `${summary.count} total scores` : copy.noRatingsYet}</div>
      </div>
      <div className="rounded-3xl border border-[var(--border)] bg-white p-4">
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-semibold">{copy.studentRating}</span>
        </div>
        <div className="mt-3 text-2xl font-semibold">{studentRatings.length > 0 ? summary.studentAverage : "—"}</div>
      </div>
      <div className="rounded-3xl border border-[var(--border)] bg-white p-4">
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-semibold">{copy.teacherSelfRating}</span>
        </div>
        <div className="mt-3 text-2xl font-semibold">{teacherSelfRatings.length > 0 ? summary.teacherSelfAverage : "—"}</div>
      </div>
    </div>
  );
}
