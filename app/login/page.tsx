"use client";

import Link from "next/link";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";

export default function LoginPage() {
  const { locale } = useLocale();

  return (
    <div className="mx-auto max-w-6xl py-8">
      <Card>
        <h1 className="text-3xl font-semibold tracking-tight">{locale === "zh" ? "选择登录身份" : "Choose your login route"}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {locale === "zh"
            ? "不同身份使用独立登录入口。请选择最符合你的身份的页面继续。"
            : "Each role has its own dedicated login page. Choose the one that matches your account."}
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Link href="/student/login" className="rounded-[28px] border border-[var(--border)] bg-white p-6 transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]">
            <div className="text-xl font-semibold">{locale === "zh" ? "学生登录" : "Student login"}</div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {locale === "zh" ? "保留收藏、问题和语言偏好。" : "Keep favorites, questions, and language preference synced."}
            </p>
          </Link>
          <Link href="/teacher/login" className="rounded-[28px] border border-[var(--border)] bg-white p-6 transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]">
            <div className="text-xl font-semibold">{locale === "zh" ? "教师登录" : "Teacher login"}</div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {locale === "zh" ? "通过教师姓名直接登录，并进入教师看板。" : "Sign in directly with the teacher name and open the teacher dashboard."}
            </p>
          </Link>
          <Link href="/admin/login" className="rounded-[28px] border border-[var(--border)] bg-white p-6 transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]">
            <div className="text-xl font-semibold">{locale === "zh" ? "管理员登录" : "Admin login"}</div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {locale === "zh" ? "进入后台管理，处理审核和系统维护。" : "Access moderation, verification, and system management tools."}
            </p>
          </Link>
        </div>
      </Card>
    </div>
  );
}
