"use client";

import Link from "next/link";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";

export default function SignupPage() {
  const { locale } = useLocale();

  return (
    <div className="mx-auto max-w-4xl py-8">
      <Card>
        <h1 className="text-3xl font-semibold tracking-tight">{locale === "zh" ? "选择注册身份" : "Choose your registration route"}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {locale === "zh"
            ? "学生账号适合保存收藏和互动记录。教师账号需要从官方课程列表中选择授课课程。"
            : "Student accounts keep favorites and activity. Teacher accounts require taught-course selection from the official course list."}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link href="/student/register" className="rounded-[28px] border border-[var(--border)] bg-white p-6 transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]">
            <div className="text-xl font-semibold">{locale === "zh" ? "学生注册" : "Student registration"}</div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {locale === "zh" ? "创建资料、保存课程和教师收藏，同时保留隐私提醒。" : "Create your profile, save teachers and courses, and keep the privacy warning visible."}
            </p>
          </Link>
          <Link href="/teacher/register" className="rounded-[28px] border border-[var(--border)] bg-white p-6 transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]">
            <div className="text-xl font-semibold">{locale === "zh" ? "教师注册" : "Teacher registration"}</div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {locale === "zh" ? "自由创建教师，邮箱可选，并选择官方课程列表中的授课课程。" : "Create a teacher freely, with optional email, and choose taught courses from the official course list."}
            </p>
          </Link>
        </div>
      </Card>
    </div>
  );
}
