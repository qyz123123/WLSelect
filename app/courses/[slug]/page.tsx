"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { Card } from "@/components/card";
import { CommentThread } from "@/components/comment-thread";
import { DetailHero } from "@/components/detail-hero";
import { DiscussionComposer } from "@/components/discussion-composer";
import { useIdentity } from "@/components/identity-provider";
import { useLocale } from "@/components/locale-provider";
import { RatingGrid } from "@/components/rating-grid";
import { RatingSummary } from "@/components/rating-summary";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { formatCourseSystem } from "@/lib/i18n";
import { courseRatingDimensions } from "@/lib/ratings";
import { AppUser, Comment, Course, Question } from "@/lib/types";

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { copy, locale } = useLocale();
  const { identity } = useIdentity();
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    subject: "",
    description: "",
    prerequisites: "",
    system: "AP",
    gradeLevels: "G11,G12"
  });
  const detailUrl = `/api/courses/${slug}?r=${refreshNonce}${identity.guestKey ? `&guestKey=${encodeURIComponent(identity.guestKey)}` : ""}`;
  const { data, loading, error, setData } = useApiData<{
    viewer: AppUser | null;
    course: Course;
    comments: Comment[];
    questions: Question[];
  }>(detailUrl);
  const course = data?.course;

  useEffect(() => {
    if (course) {
      setCourseForm({
        name: course.name,
        code: course.code,
        subject: course.subject,
        description: course.description,
        prerequisites: course.prerequisites ?? "",
        system: course.system,
        gradeLevels: course.gradeLevels.join(",")
      });
    }
  }, [course]);

  if (error) {
    return (
      <Card>
        <div className="text-lg font-semibold">{error}</div>
      </Card>
    );
  }

  if (!course) {
    return <Card>{copy.loadingCoursePage}</Card>;
  }

  const comments = data?.comments ?? [];
  const teachersSection = (
    <div className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm">
      <div className="font-semibold">{copy.teachers}</div>
      <div className="mt-3 space-y-2">
        {course.teacherIds.map((teacherId, index) => (
          <Link
            key={teacherId}
            href={`/teachers/${teacherId}`}
            className="block rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium transition hover:bg-[var(--surface-alt)]"
          >
            {course.teacherNames?.[index] ?? teacherId}
          </Link>
        ))}
      </div>
    </div>
  );

  async function saveCourse() {
    if (!course) {
      return;
    }

    const response = await fetch(`/api/course-management/${course.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...courseForm,
        gradeLevels: courseForm.gradeLevels.split(",").map((item) => item.trim())
      })
    });

    if (response.ok) {
      setRefreshNonce((current) => current + 1);
    }
  }

  return (
    <div className="space-y-6">
      <DetailHero
        title={course.name}
        subtitle=""
        showSubtitle={false}
        description={course.description}
        stars={course.stars}
        targetType="course"
        targetId={course.id}
        initialFavorite={course.isFavorite}
        canFavorite={Boolean(data.viewer || identity.selectedRole === "student")}
        favoriteInStar
        onMutated={() => setRefreshNonce((current) => current + 1)}
        discussionHref="#discussion-section"
        extra={
          <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-start">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm">
                <div className="font-semibold">{copy.system}</div>
                <div className="mt-1 text-[var(--muted)]">{formatCourseSystem(locale, course.system)}</div>
              </div>
              <div className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm">
                <div className="font-semibold">{copy.grade}</div>
                <div className="mt-1 text-[var(--muted)]">{course.gradeLevels.join(", ")}</div>
              </div>
            </div>
            {teachersSection}
          </div>
        }
      />
      <Card>
        <SectionHeading title={copy.ratings} description={locale === "zh" ? "结构化评分涵盖作业量、节奏、给分和推荐度。" : "Structured ratings cover workload, pacing, grading, and recommendation."} />
        <RatingSummary ratings={course.ratings} />
        <div className="mt-5">
          <RatingGrid
            dimensions={courseRatingDimensions}
            ratings={course.ratings}
            viewer={data.viewer}
            targetType="course"
            targetId={course.id}
            onRatingsChange={(ratings) =>
              setData((current) =>
                current
                  ? {
                      ...current,
                      course: {
                        ...current.course,
                        ratings
                      }
                    }
                  : current
              )
            }
          />
        </div>
      </Card>
      <div className="space-y-6">
        <div id="discussion-section">
          <DiscussionComposer
            targetType="course"
            targetId={course.id}
            viewer={data.viewer}
            onMutated={() => setRefreshNonce((current) => current + 1)}
            successAnchorId="comments-section"
          />
        </div>
        <Card id="comments-section">
          <SectionHeading title={copy.comments} description={locale === "zh" ? "每条评论都可以选择对教师可见或隐藏。" : "Each comment can be marked visible to the teacher or hidden."} />
          <CommentThread comments={comments} canReply={Boolean(data.viewer)} onMutated={() => setRefreshNonce((current) => current + 1)} />
        </Card>
        {data.viewer && (data.viewer.role === "teacher" || data.viewer.role === "admin") ? (
          <Card id="teacher-edit">
            <SectionHeading title={copy.updateCourseDetails} description={copy.keepCourseAccurate} />
            <div className="grid gap-3">
              <input value={courseForm.name} onChange={(event) => setCourseForm((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              <div className="grid gap-3 md:grid-cols-2">
                <input value={courseForm.code} onChange={(event) => setCourseForm((current) => ({ ...current, code: event.target.value }))} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
                <input value={courseForm.subject} onChange={(event) => setCourseForm((current) => ({ ...current, subject: event.target.value }))} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              </div>
              <textarea value={courseForm.description} onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))} rows={4} className="rounded-3xl border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.prerequisites} onChange={(event) => setCourseForm((current) => ({ ...current, prerequisites: event.target.value }))} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              <div className="grid gap-3 md:grid-cols-2">
                <select value={courseForm.system} onChange={(event) => setCourseForm((current) => ({ ...current, system: event.target.value }))} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none">
                  <option>AP</option>
                  <option>AL</option>
                  <option value="GENERAL">{locale === "zh" ? "普通课程" : "General"}</option>
                </select>
                <input value={courseForm.gradeLevels} onChange={(event) => setCourseForm((current) => ({ ...current, gradeLevels: event.target.value }))} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              </div>
              <button type="button" onClick={() => void saveCourse()} className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                {copy.saveCourse}
              </button>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
