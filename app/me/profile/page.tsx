"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";
import { RoleBadge } from "@/components/role-badge";
import { SectionHeading } from "@/components/section-heading";
import { useViewer } from "@/components/viewer-provider";
import { useApiData } from "@/hooks/use-api-data";
import { AppUser, StudentProfile, TeacherProfile } from "@/lib/types";

export default function ProfilePage() {
  const { copy, locale } = useLocale();
  const viewer = useViewer();
  const { data, loading, error } = useApiData<{
    user: AppUser | null;
    profile: StudentProfile | null;
    teacherProfile: TeacherProfile | null;
  }>("/api/me", { enabled: Boolean(viewer) });
  const coursesData = useApiData<{
    items: Array<{ name: string }>;
  }>("/api/courses");
  const user = data?.user;
  const profile = data?.profile;
  const [saving, setSaving] = useState(false);
  const [studentForm, setStudentForm] = useState({
    accountName: "",
    bio: "",
    gradeLevel: "G11",
    system: "AP",
    courseHistory: {
      G9: "",
      G10: "",
      G11: "",
      G12: ""
    }
  });
  const [teacherForm, setTeacherForm] = useState({
    displayName: "",
    department: "",
    subjectArea: "",
    shortBio: "",
    teachingStyle: ""
  });

  useEffect(() => {
    if (profile) {
      setStudentForm({
        accountName: profile.accountName,
        bio: profile.bio,
        gradeLevel: profile.gradeLevel,
        system: profile.system,
        courseHistory: {
          G9: profile.courseHistory.G9.join(", "),
          G10: profile.courseHistory.G10.join(", "),
          G11: profile.courseHistory.G11.join(", "),
          G12: profile.courseHistory.G12.join(", ")
        }
      });
    }
  }, [profile]);

  useEffect(() => {
    if (data?.teacherProfile) {
      setTeacherForm({
        displayName: data.teacherProfile.name,
        department: data.teacherProfile.department,
        subjectArea: data.teacherProfile.subjectArea,
        shortBio: data.teacherProfile.bio,
        teachingStyle: data.teacherProfile.teachingStyle
      });
    }
  }, [data?.teacherProfile]);

  async function saveProfile() {
    if (!user) {
      return;
    }

    setSaving(true);
    try {
      const payload =
        user.role === "student"
          ? {
              role: "student",
              accountName: studentForm.accountName,
              bio: studentForm.bio,
              gradeLevel: studentForm.gradeLevel,
              system: studentForm.system,
              coursesByGrade: {
                G9: studentForm.courseHistory.G9.split(",").map((item) => item.trim()).filter(Boolean),
                G10: studentForm.courseHistory.G10.split(",").map((item) => item.trim()).filter(Boolean),
                G11: studentForm.courseHistory.G11.split(",").map((item) => item.trim()).filter(Boolean),
                G12: studentForm.courseHistory.G12.split(",").map((item) => item.trim()).filter(Boolean)
              }
            }
          : {
              role: "teacher",
              ...teacherForm
            };

      await fetch("/api/me/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } finally {
      setSaving(false);
    }
  }

  if (viewer && loading) {
    return <Card>{copy.loadingProfile}</Card>;
  }

  if (!viewer || error || !user) {
    const displayError = error === "Unauthorized." || !user ? "请先登录" : error;
    return <Card>{displayError}</Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-[28px] object-cover" />
            <div>
              <div className="text-2xl font-semibold tracking-tight">{user.name}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <RoleBadge role={user.role} verified={user.teacherVerified} />
                {profile ? (
                  <span className="rounded-full bg-[var(--surface-alt)] px-3 py-1 text-sm text-[var(--muted)]">
                    @{profile.accountName}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <button type="button" onClick={() => void saveProfile()} className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white">
            {saving ? copy.saving : copy.saveProfile}
          </button>
        </div>
      </Card>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <SectionHeading title={copy.profile} description={copy.privacyWarning} />
            {user.role === "student" && profile ? (
              <div className="grid gap-4">
                <input
                  value={studentForm.accountName}
                  onChange={(event) => setStudentForm((current) => ({ ...current, accountName: event.target.value }))}
                  className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <select
                    value={studentForm.gradeLevel}
                    onChange={(event) => setStudentForm((current) => ({ ...current, gradeLevel: event.target.value }))}
                    className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
                  >
                    <option>G9</option>
                    <option>G10</option>
                    <option>G11</option>
                    <option>G12</option>
                  </select>
                  <select
                    value={studentForm.system}
                    onChange={(event) => setStudentForm((current) => ({ ...current, system: event.target.value }))}
                    className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
                  >
                    <option>AP</option>
                    <option>AL</option>
                    <option value="GENERAL">{locale === "zh" ? "普通课程" : "General"}</option>
                  </select>
                </div>
                <textarea
                  rows={4}
                  value={studentForm.bio}
                  onChange={(event) => setStudentForm((current) => ({ ...current, bio: event.target.value }))}
                  className="rounded-3xl border border-[var(--border)] px-4 py-3 outline-none"
                />
              </div>
            ) : (
              <div className="grid gap-4">
                <input
                  value={teacherForm.displayName}
                  onChange={(event) => setTeacherForm((current) => ({ ...current, displayName: event.target.value }))}
                  placeholder={locale === "zh" ? "显示名称" : "Display name"}
                  className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={teacherForm.department}
                    onChange={(event) => setTeacherForm((current) => ({ ...current, department: event.target.value }))}
                    placeholder={locale === "zh" ? "部门" : "Department"}
                    className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
                  />
                  <input
                    value={teacherForm.subjectArea}
                    onChange={(event) => setTeacherForm((current) => ({ ...current, subjectArea: event.target.value }))}
                    placeholder={locale === "zh" ? "学科方向" : "Subject area"}
                    className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none"
                  />
                </div>
                <textarea
                  rows={3}
                  value={teacherForm.shortBio}
                  onChange={(event) => setTeacherForm((current) => ({ ...current, shortBio: event.target.value }))}
                  placeholder={locale === "zh" ? "简介" : "Short bio"}
                  className="rounded-3xl border border-[var(--border)] px-4 py-3 outline-none"
                />
                <textarea
                  rows={3}
                  value={teacherForm.teachingStyle}
                  onChange={(event) => setTeacherForm((current) => ({ ...current, teachingStyle: event.target.value }))}
                  placeholder={locale === "zh" ? "教学风格" : "Teaching style"}
                  className="rounded-3xl border border-[var(--border)] px-4 py-3 outline-none"
                />
              </div>
            )}
          </Card>
          {user.role === "student" && profile ? (
            <Card>
              <SectionHeading title={copy.coursesTaken} description={copy.editCourseHistory} />
              <div className="grid gap-4 md:grid-cols-2">
                {(["G9", "G10", "G11", "G12"] as const).map((grade) => (
                  <div key={grade} className="rounded-3xl border border-[var(--border)] p-4">
                    <div className="text-sm font-semibold">{grade}</div>
                    <textarea
                      rows={4}
                      value={studentForm.courseHistory[grade]}
                      onChange={(event) =>
                        setStudentForm((current) => ({
                          ...current,
                          courseHistory: {
                            ...current.courseHistory,
                            [grade]: event.target.value
                          }
                        }))
                      }
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-[var(--muted)]">
                {copy.officialCourseNames}
                {" "}
                {coursesData.data?.items.map((course) => course.name).join(", ")}
              </div>
            </Card>
          ) : null}
        </div>
        {user.role === "teacher" ? (
          <div className="space-y-6">
            <Card>
              <SectionHeading title={copy.teacherDashboard} description={copy.teacherDashboardHint} />
              <div className="mt-4">
                <Link href="/teacher/dashboard" className="inline-flex rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                  {copy.openDashboard}
                </Link>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
