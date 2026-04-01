"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/card";
import { CourseMultiSelect } from "@/components/course-multi-select";
import { useIdentity } from "@/components/identity-provider";
import { useLocale } from "@/components/locale-provider";

interface CourseItem {
  id: string;
  name: string;
  code: string;
  subject: string;
}

export default function TeacherRegisterPage() {
  const { locale } = useLocale();
  const { selectTeacher } = useIdentity();
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestingCourse, setRequestingCourse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    subjectArea: "",
    shortBio: "",
    teachingStyle: "",
    courseIds: [] as string[],
    requestName: "",
    requestSubject: "",
    requestGradeLevels: ["G11", "G12"] as string[]
  });

  useEffect(() => {
    selectTeacher();
  }, [selectTeacher]);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      const response = await fetch("/api/courses");
      const payload = await response.json().catch(() => null);

      if (!cancelled) {
        setCourses(payload?.items ?? []);
        setLoadingCourses(false);
      }
    }

    void loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  async function registerTeacher() {
    if (form.password !== form.confirmPassword) {
      setError(locale === "zh" ? "两次输入的密码不一致。" : "Passwords do not match.");
      return;
    }

    if (form.courseIds.length === 0) {
      setError(locale === "zh" ? "请至少选择一门官方课程。" : "Please select at least one official course.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        role: "teacher",
        name: form.name,
        language: locale,
        department: form.department,
        subjectArea: form.subjectArea,
        shortBio: form.shortBio,
        teachingStyle: form.teachingStyle,
        courseIds: form.courseIds
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setSubmitting(false);
      setError(payload?.error ?? (locale === "zh" ? "教师注册失败。" : "Teacher registration failed."));
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      expectedRole: "teacher",
      redirect: false
    });

    selectTeacher();
    setSubmitting(false);
    router.push("/teacher/dashboard");
    router.refresh();
  }

  async function submitCourseRequest() {
    if (!form.requestName.trim() || !form.requestSubject.trim()) {
      setRequestMessage(locale === "zh" ? "请完整填写待新增课程名称和学科。" : "Please provide the requested course name and subject.");
      return;
    }

    setRequestingCourse(true);
    setRequestMessage(null);

    const response = await fetch("/api/course-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requesterName: form.name || undefined,
        requesterEmail: form.email || undefined,
        name: form.requestName,
        subject: form.requestSubject,
        gradeLevels: form.requestGradeLevels
      })
    });

    const payload = await response.json().catch(() => null);
    setRequestingCourse(false);

    if (!response.ok) {
      setRequestMessage(payload?.error ?? (locale === "zh" ? "提交课程申请失败。" : "Unable to submit course request."));
      return;
    }

    setRequestMessage(locale === "zh" ? "课程申请已提交，之后可在教师看板查看状态。" : "Course request submitted. You can track it later from the teacher dashboard.");
    setForm((current) => ({
      ...current,
      requestName: "",
      requestSubject: ""
    }));
  }

  return (
    <div className="mx-auto max-w-4xl py-8">
      <Card>
        <h1 className="text-3xl font-semibold tracking-tight">{locale === "zh" ? "教师注册" : "Teacher registration"}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {locale === "zh"
            ? "教师必须使用邮箱注册，并从官方课程列表中选择授课课程。个人资料和课程资料可以稍后补充。"
            : "Teachers must register with email and choose taught courses from the official list. Personal and course details can be completed later."}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder={locale === "zh" ? "姓名" : "Name"} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
          <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
          <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
          <input type="password" value={form.confirmPassword} onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))} placeholder={locale === "zh" ? "确认密码" : "Confirm password"} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
          <input value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} placeholder={locale === "zh" ? "部门（可稍后填写）" : "Department (optional now)"} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
          <input value={form.subjectArea} onChange={(event) => setForm((current) => ({ ...current, subjectArea: event.target.value }))} placeholder={locale === "zh" ? "学科方向（可稍后填写）" : "Subject area (optional now)"} className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
          <textarea value={form.shortBio} onChange={(event) => setForm((current) => ({ ...current, shortBio: event.target.value }))} rows={3} placeholder={locale === "zh" ? "个人简介（可稍后填写）" : "Short bio (optional now)"} className="rounded-3xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)] md:col-span-2" />
          <textarea value={form.teachingStyle} onChange={(event) => setForm((current) => ({ ...current, teachingStyle: event.target.value }))} rows={3} placeholder={locale === "zh" ? "教学风格（可稍后填写）" : "Teaching style (optional now)"} className="rounded-3xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)] md:col-span-2" />
        </div>

        <div className="mt-8">
          <div className="text-lg font-semibold">{locale === "zh" ? "选择授课课程" : "Choose taught courses"}</div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {locale === "zh"
              ? "只可从官方课程列表中选择。支持搜索、多选、添加和删除。"
              : "Choose only from the official course list. Search, multi-select, add, and remove are all supported."}
          </p>
          <div className="mt-4">
            {loadingCourses ? (
              <div className="rounded-2xl border border-[var(--border)] px-4 py-6 text-sm text-[var(--muted)]">{locale === "zh" ? "正在加载课程列表..." : "Loading course list..."}</div>
            ) : (
              <CourseMultiSelect items={courses} value={form.courseIds} onChange={(next) => setForm((current) => ({ ...current, courseIds: next }))} />
            )}
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-[var(--border)] bg-[var(--surface-alt)] p-5">
          <div className="text-lg font-semibold">{locale === "zh" ? "没有找到合适课程？" : "Course missing from the list?"}</div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {locale === "zh"
              ? "提交新增课程申请，管理员审核后会加入官方课程列表。"
              : "Submit an add-course request. Admins can review it before adding the course to the official list."}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input value={form.requestName} onChange={(event) => setForm((current) => ({ ...current, requestName: event.target.value }))} placeholder={locale === "zh" ? "待新增课程名称" : "Requested course name"} className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--primary)]" />
            <input value={form.requestSubject} onChange={(event) => setForm((current) => ({ ...current, requestSubject: event.target.value }))} placeholder={locale === "zh" ? "学科" : "Subject"} className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--primary)]" />
          </div>
          {requestMessage ? <div className="mt-3 text-sm text-[var(--muted)]">{requestMessage}</div> : null}
          <div className="mt-4">
            <button type="button" onClick={() => void submitCourseRequest()} className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold">
              {requestingCourse ? (locale === "zh" ? "提交中..." : "Submitting...") : locale === "zh" ? "提交课程申请" : "Submit course request"}
            </button>
          </div>
        </div>

        {error ? <div className="mt-5 text-sm text-[var(--danger)]">{error}</div> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => void registerTeacher()} className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white">
            {submitting ? (locale === "zh" ? "创建中..." : "Creating account...") : locale === "zh" ? "创建教师账号" : "Create teacher account"}
          </button>
          <Link href="/teacher/login" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold">
            {locale === "zh" ? "已有账号，去登录" : "Already registered? Log in"}
          </Link>
        </div>
      </Card>
    </div>
  );
}
