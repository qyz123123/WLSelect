"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { Card } from "@/components/card";
import { CommentThread } from "@/components/comment-thread";
import { DetailHero } from "@/components/detail-hero";
import { DiscussionComposer } from "@/components/discussion-composer";
import { useLocale } from "@/components/locale-provider";
import { QuestionThread } from "@/components/question-thread";
import { RatingGrid } from "@/components/rating-grid";
import { RatingSummary } from "@/components/rating-summary";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { courseRatingDimensions } from "@/lib/ratings";
import { AppUser, Comment, Course, Question } from "@/lib/types";

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { copy } = useLocale();
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
  const { data, loading, error, setData } = useApiData<{
    viewer: AppUser | null;
    course: Course;
    comments: Comment[];
    questions: Question[];
  }>(`/api/courses/${slug}?r=${refreshNonce}`);
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

  if (loading || !course) {
    return <Card>Loading course page...</Card>;
  }

  const comments = data.comments;
  const questions = data.questions;

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
        subtitle={`${course.code} • ${course.subject}`}
        description={course.description}
        stars={course.stars}
        targetType="course"
        targetId={course.id}
        initialFavorite={course.isFavorite}
        canFavorite={Boolean(data.viewer)}
        onMutated={() => setRefreshNonce((current) => current + 1)}
        discussionHref="#discussion-section"
        extra={
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm">
              <div className="font-semibold">{copy.system}</div>
              <div className="mt-1 text-[var(--muted)]">{course.system}</div>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm">
              <div className="font-semibold">{copy.grade}</div>
              <div className="mt-1 text-[var(--muted)]">{course.gradeLevels.join(", ")}</div>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm">
              <div className="font-semibold">Prerequisites</div>
              <div className="mt-1 text-[var(--muted)]">{course.prerequisites ?? "None"}</div>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm">
              <div className="font-semibold">{copy.starred}</div>
              <div className="mt-1 text-[var(--muted)]">{course.stars}</div>
            </div>
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <SectionHeading title={copy.ratings} description="Structured ratings cover workload, pacing, grading, and recommendation." />
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
          <div id="discussion-section">
            <DiscussionComposer
              targetType="course"
              targetId={course.id}
              viewer={data.viewer}
              onMutated={() => setRefreshNonce((current) => current + 1)}
            />
          </div>
          <Card>
            <SectionHeading title={copy.comments} description="Course commentary combines text feedback with optional score submissions." />
            <CommentThread comments={comments} canReply={Boolean(data.viewer)} onMutated={() => setRefreshNonce((current) => current + 1)} />
          </Card>
          <Card>
            <SectionHeading title={copy.questions} description="Q&A helps students compare course expectations before enrollment." />
            <QuestionThread questions={questions} canReply={Boolean(data.viewer)} onMutated={() => setRefreshNonce((current) => current + 1)} />
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <SectionHeading title="Course stats" />
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-2xl border border-[var(--border)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Comments</div>
                <div className="mt-2 text-2xl font-semibold">{course.commentCount}</div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Questions</div>
                <div className="mt-2 text-2xl font-semibold">{course.questionCount}</div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Teachers</div>
                <div className="mt-2 text-2xl font-semibold">{course.teacherIds.length}</div>
              </div>
            </div>
          </Card>
          <Card>
            <SectionHeading title="Teachers" />
            <div className="space-y-3">
              {course.teacherIds.map((teacherId, index) => (
                <Link
                  key={teacherId}
                  href={`/teachers/${teacherId}`}
                  className="block rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-medium transition hover:bg-[var(--surface-alt)]"
                >
                  {course.teacherNames?.[index] ?? teacherId}
                </Link>
              ))}
            </div>
          </Card>
          {data.viewer && (data.viewer.role === "teacher" || data.viewer.role === "admin") ? (
            <Card id="teacher-edit">
              <SectionHeading title="Update course details" description="Keep the course page accurate for students browsing options." />
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
                    <option>GENERAL</option>
                  </select>
                  <input value={courseForm.gradeLevels} onChange={(event) => setCourseForm((current) => ({ ...current, gradeLevels: event.target.value }))} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
                </div>
                <button type="button" onClick={() => void saveCourse()} className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                  Save course
                </button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
