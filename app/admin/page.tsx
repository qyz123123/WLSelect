"use client";

import { useState } from "react";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";
import { RoleBadge } from "@/components/role-badge";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { TeacherProfile } from "@/lib/types";

export default function AdminPage() {
  const { copy, locale } = useLocale();
  const [courseForm, setCourseForm] = useState({
    slug: "",
    code: "",
    name: "",
    subject: "",
    description: "",
    prerequisites: "",
    system: "AP",
    gradeLevels: "G11,G12"
  });
  const { data, loading, error, setData } = useApiData<{
    viewer: { role: "admin" };
    dashboard: {
      users: number;
      pendingTeachers: number;
      courseCount: number;
      recentLogs: Array<{ id: string; details: string; action: string }>;
    };
    teachers: TeacherProfile[];
  }>("/api/admin/dashboard");

  function formatLogAction(action: string) {
    if (locale !== "zh") {
      return action;
    }

    if (action === "WARN") {
      return "警告";
    }

    return action;
  }

  function formatLogDetails(details: string) {
    if (locale !== "zh") {
      return details;
    }

    if (details === "Community privacy reminder added to thread.") {
      return "已在线程中加入社区隐私提醒。";
    }

    return details;
  }

  async function verifyTeacher(id: string) {
    await fetch(`/api/admin/teachers/${id}/verify`, { method: "POST" });
    if (data) {
      setData({
        ...data,
        dashboard: {
          ...data.dashboard,
          pendingTeachers: Math.max(0, data.dashboard.pendingTeachers - 1)
        }
      });
    }
  }

  async function createCourse() {
    await fetch("/api/admin/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...courseForm,
        gradeLevels: courseForm.gradeLevels.split(",").map((item) => item.trim())
      })
    });
  }

  if (loading) {
    return <Card>{locale === "zh" ? "正在加载管理面板..." : "Loading admin dashboard..."}</Card>;
  }

  if (error || !data) {
    return <Card>{error ?? (locale === "zh" ? "需要管理员权限。" : "Admin access required.")}</Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <SectionHeading title={copy.management} description={locale === "zh" ? "管理员可在这里处理数据完整性、认证、审核和双语标签。" : "Admin controls for data integrity, verification, moderation, and bilingual labels."} />
          <RoleBadge role="admin" />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <div className="text-base font-semibold">{copy.dashboard}</div>
            <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              <div>{copy.users}: {data.dashboard.users}</div>
              <div>{copy.pendingTeacherVerification}: {data.dashboard.pendingTeachers}</div>
              <div>{copy.officialCourseListSize}: {data.dashboard.courseCount}</div>
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <div className="text-base font-semibold">{copy.recentModeration}</div>
            <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              {data.dashboard.recentLogs.map((log) => (
                <div key={log.id}>
                  {formatLogAction(log.action)}: {formatLogDetails(log.details)}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <div className="text-base font-semibold">{copy.teacherVerification}</div>
            <div className="mt-4 space-y-3">
              {data.teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-4 py-3">
                  <div>
                    <div className="font-semibold">{teacher.name}</div>
                    <div className="text-sm text-[var(--muted)]">{teacher.subjectArea}</div>
                  </div>
                  <button type="button" onClick={() => void verifyTeacher(teacher.id)} className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                    {copy.verify}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <div className="text-base font-semibold">{copy.createOfficialCourse}</div>
            <div className="mt-4 grid gap-3">
              <input value={courseForm.slug} onChange={(event) => setCourseForm((current) => ({ ...current, slug: event.target.value }))} placeholder={locale === "zh" ? "路径标识" : "slug"} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.code} onChange={(event) => setCourseForm((current) => ({ ...current, code: event.target.value }))} placeholder={locale === "zh" ? "课程代码" : "code"} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.name} onChange={(event) => setCourseForm((current) => ({ ...current, name: event.target.value }))} placeholder={locale === "zh" ? "课程名称" : "name"} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.subject} onChange={(event) => setCourseForm((current) => ({ ...current, subject: event.target.value }))} placeholder={locale === "zh" ? "学科" : "subject"} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              <textarea value={courseForm.description} onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))} placeholder={locale === "zh" ? "课程描述" : "description"} className="rounded-3xl border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.prerequisites} onChange={(event) => setCourseForm((current) => ({ ...current, prerequisites: event.target.value }))} placeholder={locale === "zh" ? "先修要求" : "prerequisites"} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              <button type="button" onClick={() => void createCourse()} className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                {copy.createCourse}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
