"use client";

import Link from "next/link";
import { use, useState } from "react";

import { Card } from "@/components/card";
import { CommentThread } from "@/components/comment-thread";
import { DetailHero } from "@/components/detail-hero";
import { DiscussionComposer } from "@/components/discussion-composer";
import { useIdentity } from "@/components/identity-provider";
import { useLocale } from "@/components/locale-provider";
import { RatingGrid } from "@/components/rating-grid";
import { RatingSummary } from "@/components/rating-summary";
import { RoleBadge } from "@/components/role-badge";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { teacherRatingDimensions } from "@/lib/ratings";
import { AppUser, Comment, Question, TeacherProfile } from "@/lib/types";

export default function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { copy, locale } = useLocale();
  const { identity } = useIdentity();
  const [refreshNonce, setRefreshNonce] = useState(0);
  const detailUrl = `/api/teachers/${id}?r=${refreshNonce}${identity.guestKey ? `&guestKey=${encodeURIComponent(identity.guestKey)}` : ""}`;
  const { data, loading, error, setData } = useApiData<{
    viewer: AppUser | null;
    teacher: TeacherProfile;
    comments: Comment[];
    questions: Question[];
  }>(detailUrl);
  const teacher = data?.teacher;

  if (error) {
    return (
      <Card>
        <div className="text-lg font-semibold">{error}</div>
      </Card>
    );
  }

  if (!teacher) {
    return <Card>{copy.loadingTeacherProfile}</Card>;
  }

  const comments = data?.comments ?? [];

  return (
    <div className="space-y-6">
      <DetailHero
        title={teacher.name}
        subtitle={`${teacher.department} • ${teacher.subjectArea}`}
        description={teacher.bio}
        image={teacher.avatar}
        stars={teacher.stars}
        targetType="teacher"
        targetId={teacher.id}
        initialFavorite={teacher.isFavorite}
        canFavorite={Boolean(data.viewer || identity.selectedRole === "student")}
        onMutated={() => setRefreshNonce((current) => current + 1)}
        discussionHref="#discussion-section"
        extra={
          <div className="grid gap-4 md:grid-cols-[auto_1fr]">
            <RoleBadge role="teacher" verified />
            <p className="text-sm leading-6 text-[var(--muted)]">{teacher.teachingStyle}</p>
          </div>
        }
      />
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <SectionHeading title={copy.ratings} description={locale === "zh" ? "学生评分与教师自评分开显示。" : "Student ratings and teacher self-ratings are clearly separated."} />
            <RatingSummary ratings={teacher.ratings} />
            <div className="mt-5">
              <RatingGrid
                dimensions={teacherRatingDimensions}
                ratings={teacher.ratings}
                viewer={data.viewer}
                targetType="teacher"
                targetId={teacher.id}
                onRatingsChange={(ratings) =>
                  setData((current) =>
                    current
                      ? {
                          ...current,
                          teacher: {
                            ...current.teacher,
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
              targetType="teacher"
              targetId={teacher.id}
              viewer={data.viewer}
              onMutated={() => setRefreshNonce((current) => current + 1)}
              successAnchorId="comments-section"
            />
          </div>
          <Card id="comments-section">
            <SectionHeading title={copy.comments} description={locale === "zh" ? "每条评论都可以选择对教师可见或隐藏。" : "Each comment can be marked visible to the teacher or hidden."} />
            <CommentThread comments={comments} canReply={Boolean(data.viewer)} onMutated={() => setRefreshNonce((current) => current + 1)} />
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <SectionHeading title={copy.coursesTaught} />
            <div className="space-y-3">
              {teacher.courseLinks?.length
                ? teacher.courseLinks.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.slug}`}
                      className="block rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-medium transition hover:bg-[var(--surface-alt)]"
                    >
                      {course.label}
                    </Link>
                  ))
                : teacher.coursesTaught.map((course) => (
                    <div key={course} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-medium">
                      {course}
                    </div>
                  ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
