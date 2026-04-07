"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageSquare } from "lucide-react";

import { Card } from "@/components/card";
import { CommentThread } from "@/components/comment-thread";
import { useLocale } from "@/components/locale-provider";
import { RightRail } from "@/components/right-rail";
import { SectionHeading } from "@/components/section-heading";
import { useShellData } from "@/components/shell-data-provider";
import { useViewer } from "@/components/viewer-provider";
import { useApiData } from "@/hooks/use-api-data";
import { AppUser, Comment, Course, TeacherProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { copy, locale } = useLocale();
  const shellData = useShellData();
  const initialViewer = useViewer();
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [showAllActivityTargets, setShowAllActivityTargets] = useState(false);
  const { data, loading } = useApiData<{
    currentUser: AppUser | null;
  }>(`/api/bootstrap?r=${refreshNonce}`);
  const user = data?.currentUser ?? initialViewer;
  const isStudentHome = user?.role === "student";
  const [selectedTargetType, setSelectedTargetType] = useState<"course" | "teacher" | "all-courses">("all-courses");
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    shellData.courses[0]?.id ?? shellData.teachers[0]?.id ?? ""
  );

  const selectedTargets = useMemo<Array<Course | TeacherProfile>>(
    () =>
      (
        selectedTargetType === "course"
          ? shellData.courses
          : selectedTargetType === "teacher"
            ? shellData.teachers
            : []
      )
        .filter((target) => target.commentCount > 0)
        .slice()
        .sort((a, b) => b.commentCount - a.commentCount || a.name.localeCompare(b.name)),
    [selectedTargetType, shellData.courses, shellData.teachers]
  );

  useEffect(() => {
    setShowAllActivityTargets(false);
  }, [selectedTargetType]);

  const selectedTarget = useMemo(
    () => selectedTargets.find((target) => target.id === selectedTargetId) ?? selectedTargets[0] ?? null,
    [selectedTargetId, selectedTargets]
  );

  useEffect(() => {
    if (!selectedTargets.length) {
      if (selectedTargetId) {
        setSelectedTargetId("");
      }
      return;
    }

    if (!selectedTarget || !selectedTargets.some((target) => target.id === selectedTarget.id)) {
      setSelectedTargetId(selectedTargets[0].id);
    }
  }, [selectedTarget, selectedTargetId, selectedTargets]);

  const {
    data: selectedCommentsData,
    loading: selectedCommentsLoading
  } = useApiData<{ comments: Comment[] }>(
    selectedTargetType === "all-courses"
      ? `/api/activity-comments?targetType=all-courses&r=${refreshNonce}`
      : selectedTarget
      ? `/api/activity-comments?targetType=${selectedTargetType}&targetId=${selectedTarget.id}&r=${refreshNonce}`
      : `/api/activity-comments?r=${refreshNonce}`
  );

  const selectedComments = useMemo(
    () => selectedCommentsData?.comments ?? [],
    [selectedCommentsData]
  );

  const studentCopy =
    locale === "zh"
      ? {
          headline: "你的声音，将会被保护",
          description: "WLSelect不记录学生信息。",
          prompt: "创建or选择一个wlsa课程老师， 开始你的评论",
          joinTitle: "加入社区",
          joinBody: "继续通过你的账号追踪反馈、收藏内容和提问记录。",
          loadingActivity: "正在加载动态...",
          loadingQuestions: "正在加载问题..."
        }
      : {
          headline: "Your voice will be protected.",
          description: "WLSelect does not record student identities. You can freely share your views on teachers to help other students make better choices.",
          prompt: "Choose a WLSA course or teacher and start sharing your views.",
          joinTitle: "Join the community",
          joinBody: "Continue tracking feedback, saved items, and questions from your account.",
          loadingActivity: "Loading activity...",
          loadingQuestions: "Loading questions..."
        };

  const activityContent = loading ? (
    <div className="text-sm text-[var(--muted)]">{studentCopy.loadingActivity}</div>
  ) : (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="rounded-[var(--card-radius)] border border-[var(--border)] bg-white p-4">
        <div className="text-sm font-semibold text-[var(--foreground)]">
          {locale === "zh" ? "选择老师或课程" : "Choose a teacher or course"}
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {locale === "zh" ? "先选一个目标，再看这个老师或课程下最热门的评论。" : "Pick a teacher or course first, then review the most popular comments for that target."}
        </p>
        <div className="mt-3 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-alt)] p-1">
          <button
            type="button"
            onClick={() => setSelectedTargetType("course")}
            className={cn(
              "rounded-full px-3 py-1.5 transition",
              selectedTargetType === "course"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted)]"
            )}
          >
            <span className="text-[13px] font-semibold leading-none">{copy.courses}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTargetType("teacher")}
            className={cn(
              "rounded-full px-3 py-1.5 transition",
              selectedTargetType === "teacher"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted)]"
            )}
          >
            <span className="text-[13px] font-semibold leading-none">{copy.teachers}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTargetType("all-courses")}
            className={cn(
              "rounded-full px-3 py-1.5 transition",
              selectedTargetType === "all-courses"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted)]"
            )}
          >
            <span className="text-[13px] font-semibold leading-none">{locale === "zh" ? "全部课程" : "All courses"}</span>
          </button>
        </div>
        {selectedTargetType === "all-courses" ? (
          <div className="mt-3 rounded-[var(--radius)] border border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-2 text-[11px] font-medium text-[var(--primary)]">
            {locale === "zh" ? "显示所有课程里点赞最高的热门评论。" : "Showing the top-liked comments across all courses."}
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {selectedTargets.length === 0 ? (
              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--muted)]">
                {locale === "zh"
                  ? selectedTargetType === "course"
                    ? "还没有课程收到评论。"
                    : "还没有老师收到评论。"
                  : selectedTargetType === "course"
                    ? "No courses have comments yet."
                    : "No teachers have comments yet."}
              </div>
            ) : null}
            {(showAllActivityTargets ? selectedTargets : selectedTargets.slice(0, 8)).map((target) => {
              const label = selectedTargetType === "course" ? (target as Course).name : (target as TeacherProfile).name;
              const commentCount =
                selectedTargetType === "course" ? (target as Course).commentCount : (target as TeacherProfile).commentCount;

              return (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => setSelectedTargetId(target.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[var(--radius)] border px-3 py-1.5 text-left transition",
                    selectedTarget?.id === target.id
                      ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                      : "border-[var(--border)] bg-white hover:border-[var(--primary)]/40"
                  )}
                >
                  <span className="truncate text-[14px] leading-5 font-medium">{label}</span>
                  <span className="ml-3 inline-flex shrink-0 items-center gap-1.5 text-[11px] text-[var(--muted)]">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{commentCount}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  </span>
                </button>
              );
            })}
            {!showAllActivityTargets && selectedTargets.length > 8 ? (
              <button
                type="button"
                onClick={() => setShowAllActivityTargets(true)}
                className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-alt)]"
              >
                {locale === "zh"
                  ? selectedTargetType === "course"
                    ? "显示全部课程"
                    : "显示全部老师"
                  : selectedTargetType === "course"
                    ? "Show all courses"
                    : "Show all teachers"}
              </button>
            ) : null}
          </div>
        )}
      </div>
      <div className="rounded-[var(--card-radius)] border border-[var(--border)] bg-white p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[var(--foreground)]">
              {locale === "zh" ? "热门评论" : "Popular comments"}
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {selectedTargetType === "all-courses"
                ? locale === "zh"
                  ? "正在查看所有课程里点赞最高的评论。"
                  : "Showing the top-liked comments across all courses."
                : selectedTarget
                ? locale === "zh"
                  ? `正在查看 ${selectedTargetType === "course" ? "课程" : "老师"}“${selectedTargetType === "course" ? (selectedTarget as Course).name : (selectedTarget as TeacherProfile).name}”下点赞最高的评论。`
                  : `Showing top-liked comments for ${selectedTargetType === "course" ? (selectedTarget as Course).name : (selectedTarget as TeacherProfile).name}.`
                : locale === "zh"
                  ? "先从左边选择一个课程或老师。"
                  : "Choose a course or teacher from the left first."}
            </p>
          </div>
        </div>
        {selectedCommentsLoading ? (
          <div className="text-sm text-[var(--muted)]">{studentCopy.loadingActivity}</div>
        ) : selectedComments.length > 0 ? (
          <CommentThread comments={selectedComments} compact onMutated={() => setRefreshNonce((current) => current + 1)} />
        ) : (
          <div className="text-sm text-[var(--muted)]">
            {locale === "zh" ? "这个老师或课程下还没有热门评论。" : "There are no popular comments for this target yet."}
          </div>
        )}
      </div>
    </div>
  );

  if (isStudentHome) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(10,102,194,0.15),_transparent_30%),_white] p-5 pl-6 md:p-6 md:pl-6">
          <div className="space-y-8">
            <div className="max-w-5xl">
              <h1 className="max-w-4xl text-[1.7rem] leading-[1.08] font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.45rem] lg:text-[2.8rem]">
                {studentCopy.headline}
              </h1>
              <p className="mt-6 max-w-5xl text-lg leading-9 text-[var(--muted)] sm:text-[1.1rem] sm:leading-10">
                {studentCopy.description}
              </p>
              <p className="mt-8 max-w-4xl text-lg leading-9 text-[var(--muted)] sm:text-[1.1rem] sm:leading-10">
                {studentCopy.prompt}
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href="/teachers"
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[var(--primary)] px-6 py-3 text-base font-semibold text-white sm:w-auto"
              >
                {copy.browseTeachers}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-6 py-3 text-base font-semibold sm:w-auto"
              >
                {copy.browseCourses}
              </Link>
            </div>
          </div>
        </Card>
        <RightRail
          teachers={shellData.teachers}
          courses={shellData.courses}
          notifications={shellData.notifications}
          user={shellData.viewer}
          variant="trending-only"
        />
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card>
              <SectionHeading title={copy.latestActivity} />
              {activityContent}
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <div className="text-sm font-semibold text-[var(--foreground)]">{studentCopy.joinTitle}</div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                {studentCopy.joinBody}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/me/profile" className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                  {copy.myProfile}
                </Link>
                <Link href="/saved" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
                  {copy.saved}
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(10,102,194,0.15),_transparent_28%),_white] pl-6">
        <div>
          <h1 className="max-w-3xl pt-2 text-[1.8rem] leading-[1.08] font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.35rem] lg:text-[2.7rem]">
            {locale === "zh"
              ? "你的声音，将会被保护"
              : "Your voice will be protected."}
          </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              {locale === "zh"
                ? "WLSelect不记录学生信息。"
                : "WLSelect does not record student identities. You can freely share your views on teachers to help other students make better choices."}
            </p>
          <p className="mt-8 max-w-3xl text-base leading-7 text-[var(--muted)]">
            {locale === "zh"
              ? "创建or选择一个wlsa课程老师， 开始你的评论"
              : "Choose a WLSA course or teacher and start sharing your views."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/teachers" className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white">
              {copy.browseTeachers}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/courses" className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold">
              {copy.browseCourses}
            </Link>
          </div>
        </div>
      </Card>
      <RightRail
        teachers={shellData.teachers}
        courses={shellData.courses}
        notifications={shellData.notifications}
        user={shellData.viewer}
        variant="trending-only"
      />

      <div
        className={cn(
          "grid gap-6",
          user ? "2xl:grid-cols-[minmax(0,1fr)_360px]" : "2xl:grid-cols-1"
        )}
      >
        <div className="space-y-6">
          <Card>
            <SectionHeading title={copy.latestActivity} />
            {activityContent}
          </Card>
        </div>
        <div className={cn("space-y-6", !user && "2xl:hidden")}>
          {user ? (
            <Card>
              <div className="text-sm font-semibold text-[var(--foreground)]">{copy.joinCommunity}</div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                {locale === "zh" ? "继续通过你的账号追踪反馈、收藏内容和提问记录。" : "Continue tracking feedback, saved items, and questions from your account."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/me/profile" className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                  {copy.myProfile}
                </Link>
                <Link href="/saved" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
                  {copy.saved}
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="2xl:hidden">
              <div className="text-sm font-semibold text-[var(--foreground)]">{copy.joinCommunity}</div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{copy.privacyWarning}</p>
              <div className="mt-5 flex gap-3">
                <Link href="/signup" className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                  {copy.signUp}
                </Link>
                <Link href="/login" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
                  {copy.logIn}
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
