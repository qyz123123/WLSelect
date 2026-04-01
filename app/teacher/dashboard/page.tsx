"use client";

import Link from "next/link";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { AppUser, TeacherDashboardSummary } from "@/lib/types";

export default function TeacherDashboardPage() {
  const { locale } = useLocale();
  const { data, loading, error } = useApiData<{
    viewer: AppUser;
    dashboard: TeacherDashboardSummary;
  }>("/api/teacher/dashboard");

  if (loading) {
    return <Card>{locale === "zh" ? "正在加载教师看板..." : "Loading teacher dashboard..."}</Card>;
  }

  if (error || !data) {
    return <Card>{error ?? (locale === "zh" ? "教师看板暂时不可用。" : "Teacher dashboard is unavailable.")}</Card>;
  }

  const { dashboard } = data;

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading
          title={locale === "zh" ? "教师看板" : "Teacher dashboard"}
          description={
            locale === "zh"
              ? "资料完善提醒与互动统计分开展示。"
              : "Profile-completion reminders stay separate from questions and comment counts."
          }
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-5">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "zh" ? "学生问题" : "Student questions"}</div>
            <div className="mt-3 text-4xl font-semibold tracking-tight">{dashboard.questionCount}</div>
          </div>
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-5">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "zh" ? "收到的评论" : "Comments received"}</div>
            <div className="mt-3 text-4xl font-semibold tracking-tight">{dashboard.commentCount}</div>
          </div>
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-5">
            <div className="text-sm font-semibold text-[var(--muted)]">{locale === "zh" ? "待处理课程申请" : "Pending course requests"}</div>
            <div className="mt-3 text-4xl font-semibold tracking-tight">{dashboard.pendingCourseRequests}</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <SectionHeading
            title={locale === "zh" ? "资料提醒" : "Profile reminders"}
            description={locale === "zh" ? "每条提醒都直接链接到需要补充的页面。" : "Actionable reminders link directly to the page that needs attention."}
          />
          <div className="mt-4 space-y-3">
            {dashboard.reminders.length > 0 ? (
              dashboard.reminders.map((reminder) => (
                <Link key={reminder.id} href={reminder.href} className="block rounded-[28px] border border-[var(--border)] bg-white p-5 transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]">
                  <div className="text-base font-semibold text-[var(--foreground)]">{reminder.title}</div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{reminder.description}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-[28px] border border-[var(--border)] bg-white p-5 text-sm text-[var(--muted)]">
                {locale === "zh" ? "个人资料和关联课程页面都已完成，目前无需处理。" : "Personal profile and linked course pages are complete. No action is needed right now."}
              </div>
            )}
          </div>
        </Card>
        <Card>
          <SectionHeading title={locale === "zh" ? "下一步操作" : "Next actions"} />
          <div className="mt-4 space-y-3 text-sm">
            <Link href="/me/profile" className="block rounded-2xl border border-[var(--border)] px-4 py-3 font-medium transition hover:bg-[var(--surface-alt)]">
              {locale === "zh" ? "编辑个人资料" : "Edit personal profile"}
            </Link>
            {dashboard.incompleteCourseProfiles.map((course) => (
              <Link key={course.courseId} href={`/courses/${course.slug}#teacher-edit`} className="block rounded-2xl border border-[var(--border)] px-4 py-3 font-medium transition hover:bg-[var(--surface-alt)]">
                {locale === "zh" ? `完善 ${course.courseName}` : `Complete ${course.courseName}`}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
