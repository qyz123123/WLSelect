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
  const emptyLabel = copy.noRatingsYet === "还没有人评分" ? "暂无评分" : "No ratings yet";
  const totalScoresLabel = copy.noRatingsYet === "还没有人评分" ? `${summary.count} 条评分` : `${summary.count} total scores`;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-[28px] bg-[var(--primary-soft)] p-4">
        <div className="flex items-center gap-2 text-[var(--primary)]">
          <Star className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold leading-5">{copy.ratings}</span>
        </div>
        <div className="mt-2 text-3xl font-semibold tracking-tight">{summary.count > 0 ? summary.average : "—"}</div>
        <div className="mt-1 text-sm leading-6 text-[var(--muted)]">{summary.count > 0 ? totalScoresLabel : emptyLabel}</div>
      </div>
      <div className="rounded-[28px] border border-[var(--border)] bg-white p-4">
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold leading-5">{copy.studentRating}</span>
        </div>
        <div className="mt-2 text-2xl font-semibold">{studentRatings.length > 0 ? summary.studentAverage : "—"}</div>
      </div>
      <div className="rounded-[28px] border border-[var(--border)] bg-white p-4">
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <BarChart3 className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold leading-5">{copy.teacherSelfRating}</span>
        </div>
        <div className="mt-2 text-2xl font-semibold">{teacherSelfRatings.length > 0 ? summary.teacherSelfAverage : "—"}</div>
      </div>
    </div>
  );
}
