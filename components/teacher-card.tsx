import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";
import { RatingSummary } from "@/components/rating-summary";
import { TeacherProfile } from "@/lib/types";

export function TeacherCard({ teacher }: { teacher: TeacherProfile }) {
  const { copy } = useLocale();

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <img src={teacher.avatar} alt={teacher.name} className="h-20 w-20 rounded-[24px] object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
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
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{teacher.bio}</p>
          <div className="mt-4 rounded-2xl bg-[var(--surface-alt)] p-4 text-sm leading-6 text-[var(--foreground)]">
            {teacher.teachingStyle}
          </div>
          <div className="mt-5">
            <RatingSummary ratings={teacher.ratings} />
          </div>
          <Link
            href={`/teachers/${teacher.id}`}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
          >
            {copy.viewProfile}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
