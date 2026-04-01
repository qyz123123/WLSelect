"use client";

import Link from "next/link";

import { Card } from "@/components/card";
import { RoleLoginCard } from "@/components/role-login-card";
import { useLocale } from "@/components/locale-provider";

export default function LoginPage() {
  const { locale } = useLocale();

  return (
    <div className="grid gap-6 py-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <h1 className="text-3xl font-semibold tracking-tight">{locale === "zh" ? "选择登录身份" : "Choose your login route"}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {locale === "zh"
            ? "学生和教师拥有不同的进入方式。学生也可以先以游客身份浏览，再决定是否登录。"
            : "Students and teachers have different entry rules. Students can also browse first and decide later whether to log in or continue as a guest."}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link href="/student/login" className="rounded-[28px] border border-[var(--border)] bg-white p-6 transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]">
            <div className="text-xl font-semibold">{locale === "zh" ? "学生登录" : "Student login"}</div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {locale === "zh" ? "保留收藏、问题和语言偏好。" : "Keep favorites, questions, and language preference synced."}
            </p>
          </Link>
          <Link href="/teacher/login" className="rounded-[28px] border border-[var(--border)] bg-white p-6 transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]">
            <div className="text-xl font-semibold">{locale === "zh" ? "教师登录" : "Teacher login"}</div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {locale === "zh" ? "进入教师看板，管理资料、课程和提醒。" : "Access the teacher dashboard, profile completion reminders, and course management tools."}
            </p>
          </Link>
        </div>
      </Card>
      <RoleLoginCard
        role="admin"
        title={locale === "zh" ? "管理员登录" : "Admin login"}
        description={locale === "zh" ? "管理员可直接通过邮箱登录。" : "Admins can log in directly with email and password."}
      />
    </div>
  );
}
