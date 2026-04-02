import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";
import { formatCourseSystem } from "@/lib/i18n";
import { RatingSummary } from "@/components/rating-summary";
import { Course } from "@/lib/types";

export function CourseCard({ course }: { course: Course }) {
  const { copy, locale } = useLocale();

  return (
    <Card className="w-full">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold tracking-tight">{course.name}</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {course.subject} • {formatCourseSystem(locale, course.system)} • {course.gradeLevels.join(", ")}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
          <Star className="h-4 w-4" />
          {course.stars}
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{course.description}</p>
      <div className="mt-5">
        <RatingSummary ratings={course.ratings} />
      </div>
      <Link
        href={`/courses/${course.slug}`}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
      >
        {copy.exploreCourse}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
