"use client";

import { useState } from "react";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";
import { RoleBadge } from "@/components/role-badge";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { TeacherProfile } from "@/lib/types";

export default function AdminPage() {
  const { copy } = useLocale();
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
    return <Card>Loading admin dashboard...</Card>;
  }

  if (error || !data) {
    return <Card>{error ?? "Admin access required."}</Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <SectionHeading title={copy.management} description="Admin controls for data integrity, verification, moderation, and bilingual labels." />
          <RoleBadge role="admin" />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <div className="text-base font-semibold">Dashboard</div>
            <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              <div>Users: {data.dashboard.users}</div>
              <div>Pending teacher verification: {data.dashboard.pendingTeachers}</div>
              <div>Official course list size: {data.dashboard.courseCount}</div>
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <div className="text-base font-semibold">Recent moderation</div>
            <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              {data.dashboard.recentLogs.map((log) => (
                <div key={log.id}>
                  {log.action}: {log.details}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <div className="text-base font-semibold">Teacher verification</div>
            <div className="mt-4 space-y-3">
              {data.teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-4 py-3">
                  <div>
                    <div className="font-semibold">{teacher.name}</div>
                    <div className="text-sm text-[var(--muted)]">{teacher.subjectArea}</div>
                  </div>
                  <button type="button" onClick={() => void verifyTeacher(teacher.id)} className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                    Verify
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <div className="text-base font-semibold">Create official course</div>
            <div className="mt-4 grid gap-3">
              <input value={courseForm.slug} onChange={(event) => setCourseForm((current) => ({ ...current, slug: event.target.value }))} placeholder="slug" className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.code} onChange={(event) => setCourseForm((current) => ({ ...current, code: event.target.value }))} placeholder="code" className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.name} onChange={(event) => setCourseForm((current) => ({ ...current, name: event.target.value }))} placeholder="name" className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.subject} onChange={(event) => setCourseForm((current) => ({ ...current, subject: event.target.value }))} placeholder="subject" className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              <textarea value={courseForm.description} onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))} placeholder="description" className="rounded-3xl border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.prerequisites} onChange={(event) => setCourseForm((current) => ({ ...current, prerequisites: event.target.value }))} placeholder="prerequisites" className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none" />
              <button type="button" onClick={() => void createCourse()} className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                Create course
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
