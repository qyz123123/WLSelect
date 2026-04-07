"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeftRight, GraduationCap, UserRoundCog } from "lucide-react";
import { usePathname } from "next/navigation";

import { Card } from "@/components/card";
import { useIdentity } from "@/components/identity-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";
import { AppUser } from "@/lib/types";
import logo from "@/logo.png";

const bypassPaths = ["/login", "/signup", "/teacher/login", "/teacher/register", "/student/login", "/student/register", "/admin/login"];

export function IdentityGate({
  children,
  viewer
}: {
  children: ReactNode;
  viewer: AppUser | null;
}) {
  const pathname = usePathname();
  const { copy, locale } = useLocale();
  const { identity, hydrated, selectStudent, selectTeacher } = useIdentity();

  const bypass = bypassPaths.some((path) => pathname === path);

  if (!hydrated) {
    return null;
  }

  if (viewer || bypass) {
    return <>{children}</>;
  }

  function renderOverlayCard() {
    if (!identity.selectedRole) {
      return (
        <Card className="overflow-hidden border border-[var(--border)] bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--primary-soft)]">
                <Image src={logo} alt="WLSelect" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <div className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">WLSelect</div>
              </div>
            </div>
            <div className="self-start">
              <LanguageSwitcher />
            </div>
          </div>
          <div className="mt-6 max-w-4xl">
            <h1 className="text-[2.2rem] font-semibold tracking-tight text-[var(--foreground)] md:text-[3rem]">
              {locale === "zh" ? "你是？" : "Who are you?"}
            </h1>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={selectTeacher}
              className="rounded-[32px] border border-[var(--border)] bg-white p-5 text-left shadow-sm transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
            >
              <UserRoundCog className="h-7 w-7 text-[var(--primary)]" />
              <div className="mt-6 text-[1.6rem] font-semibold tracking-tight text-[var(--foreground)]">{copy.teacher}</div>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {locale === "zh"
                  ? "可自由创建教师，并通过姓名登录来管理教师资料、授课课程与通知。"
                  : "Create teachers freely, then use the name to sign in and manage teacher profile, taught courses, and notifications."}
              </p>
            </button>
            <button
              type="button"
              onClick={selectStudent}
              className="rounded-[32px] border border-[var(--border)] bg-white p-5 text-left shadow-sm transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
            >
              <GraduationCap className="h-7 w-7 text-[var(--primary)]" />
              <div className="mt-6 text-[1.6rem] font-semibold tracking-tight text-[var(--foreground)]">{copy.student}</div>
              <div className="mt-4 text-sm font-semibold text-[#d84b17]">
                {locale === "zh" ? "非强制登录，我们保护你的隐私" : "Login is optional. We protect your privacy."}
              </div>
            </button>
          </div>
        </Card>
      );
    }

    return (
      <Card className="border border-[var(--border)] bg-white/95 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--primary-soft)]">
              <Image src={logo} alt="WLSelect" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">WLSelect</div>
              <div className="mt-1 text-sm text-[var(--muted)]">{locale === "zh" ? "教师入口" : "Teacher entry"}</div>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
            <ArrowLeftRight className="h-4 w-4" />
            {locale === "zh" ? "老师需要先登录" : "Teachers must sign in first"}
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          {locale === "zh" ? "老师需要先登录或注册" : "Teachers need to sign in or create an account first"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {locale === "zh"
            ? "老师不能以游客身份进入。请先创建或登录教师，并从官方课程列表中选择授课课程。"
            : "Teachers cannot continue as anonymous guests. Please create or sign in to a teacher account, then choose taught courses from the official course list."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/teacher/login" className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white">
            {locale === "zh" ? "老师登录" : "Teacher login"}
          </Link>
          <Link href="/teacher/register" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold">
            {locale === "zh" ? "教师注册" : "Teacher registration"}
          </Link>
          <button type="button" onClick={selectStudent} className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold">
            {locale === "zh" ? "改为学生进入" : "Enter as student instead"}
          </button>
        </div>
      </Card>
    );
  }

  if (!identity.selectedRole) {
    return (
      <div className="relative">
        <div aria-hidden className="pointer-events-none select-none blur-[12px] saturate-[0.78]">
          {children}
        </div>
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(243,246,249,0.42)] px-4 py-8">
          <div className="w-full max-w-5xl">{renderOverlayCard()}</div>
        </div>
      </div>
    );
  }

  if (identity.status === "teacher-auth-required") {
    return (
      <div className="relative">
        <div aria-hidden className="pointer-events-none select-none blur-[12px] saturate-[0.78]">
          {children}
        </div>
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(243,246,249,0.42)] px-4 py-8">
          <div className="w-full max-w-3xl">{renderOverlayCard()}</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
