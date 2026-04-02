import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { Card } from "@/components/card";
import { summarizeRatings } from "@/lib/analytics";
import { useLocale } from "@/components/locale-provider";
import { TeacherProfile } from "@/lib/types";

export function TeacherCard({ teacher }: { teacher: TeacherProfile }) {
  const { copy, locale } = useLocale();
  const summary = summarizeRatings(teacher.ratings);
  const formatScore = (score: number) => (score > 0 ? (Number.isInteger(score) ? score.toFixed(0) : score.toFixed(1)) : "—");

  return (
    <Link href={`/teachers/${teacher.id}`} className="block">
      <Card className="overflow-hidden p-4 transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <img src={teacher.avatar} alt={teacher.name} className="h-16 w-16 rounded-[20px] object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{teacher.name}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {teacher.department} • {teacher.subjectArea}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                <Star className="h-4 w-4" />
                {teacher.stars}
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{teacher.bio}</p>
            <div className="mt-3 rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm leading-6 text-[var(--foreground)]">
              <div className="line-clamp-2">{teacher.teachingStyle}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <div className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 font-semibold text-[var(--primary)]">
                {copy.overallScore}: {formatScore(summary.average)}
              </div>
              <div className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 font-semibold text-[var(--muted)]">
                {copy.studentRating}: {formatScore(summary.studentAverage)}
              </div>
              <div className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 font-semibold text-[var(--muted)]">
                {summary.count} {locale === "zh" ? "条评分" : "scores"}
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)]">
              <span>{copy.viewProfile}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
