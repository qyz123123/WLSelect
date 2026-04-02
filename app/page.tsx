"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/card";
import { CommentThread } from "@/components/comment-thread";
import { useLocale } from "@/components/locale-provider";
import { RightRail } from "@/components/right-rail";
import { SectionHeading } from "@/components/section-heading";
import { useShellData } from "@/components/shell-data-provider";
import { useViewer } from "@/components/viewer-provider";
import { useApiData } from "@/hooks/use-api-data";
import { AppUser, Comment, FeedItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { copy, locale } = useLocale();
  const shellData = useShellData();
  const initialViewer = useViewer();
  const { data, loading } = useApiData<{
    currentUser: AppUser | null;
    feedItems: FeedItem[];
  }>("/api/bootstrap");

  const latestComments = useMemo(
    () => (data?.feedItems.filter((item) => item.kind === "comment").map((item) => item.payload as Comment) ?? []),
    [data]
  );
  const user = data?.currentUser ?? initialViewer;
  const isStudentHome = user?.role === "student";

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

  if (isStudentHome) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(10,102,194,0.15),_transparent_30%),_white] p-7 md:p-8">
          <div className="space-y-8">
            <div className="max-w-5xl">
              <h1 className="max-w-4xl text-[2.9rem] leading-[0.98] font-semibold tracking-tight text-[var(--foreground)] sm:text-6xl">
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
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[var(--primary)] px-8 py-4 text-lg font-semibold text-white sm:w-auto"
              >
                {copy.browseTeachers}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-8 py-4 text-lg font-semibold sm:w-auto"
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
              {loading ? <div className="text-sm text-[var(--muted)]">{studentCopy.loadingActivity}</div> : <CommentThread comments={latestComments} />}
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
      <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(10,102,194,0.15),_transparent_28%),_white]">
        <div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--foreground)]">
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
            <Link href="/teachers" className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white">
              {copy.browseTeachers}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/courses" className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold">
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
            {loading ? <div className="text-sm text-[var(--muted)]">{studentCopy.loadingActivity}</div> : <CommentThread comments={latestComments} />}
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
