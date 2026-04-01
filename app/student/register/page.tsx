"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Card } from "@/components/card";
import { useIdentity } from "@/components/identity-provider";
import { useLocale } from "@/components/locale-provider";

export default function StudentRegisterPage() {
  const { copy, locale } = useLocale();
  const { selectStudent } = useIdentity();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    gradeLevel: "G11",
    system: "AP"
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    selectStudent();
  }, [selectStudent]);

  async function handleSignup() {
    if (form.password !== form.confirmPassword) {
      setError(locale === "zh" ? "两次输入的密码不一致。" : "Passwords do not match.");
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
        role: "student",
        name: form.name,
        language: locale,
        gradeLevel: form.gradeLevel,
        system: form.system
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setSubmitting(false);
      setError(payload?.error ?? (locale === "zh" ? "注册失败。" : "Signup failed."));
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      expectedRole: "student",
      redirect: false
    });

    selectStudent();
    setSubmitting(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card>
        <h1 className="text-3xl font-semibold tracking-tight">{locale === "zh" ? "学生注册" : "Student registration"}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {locale === "zh"
            ? "创建学生账号后，你仍然可以匿名显示评论内容，但系统会安全地保存你的收藏和互动记录。"
            : "Create a student account to save favorites and activity, while still keeping commentary display privacy-aware."}
        </p>
        <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{copy.privacyWarning}</div>
        <form className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email"
            className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)] md:col-span-2"
          />
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Password"
            className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
          />
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            placeholder={locale === "zh" ? "确认密码" : "Confirm password"}
            className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
          />
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder={locale === "zh" ? "账号名称" : "Account name"}
            className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)] md:col-span-2"
          />
          <select
            value={form.gradeLevel}
            onChange={(event) => setForm((current) => ({ ...current, gradeLevel: event.target.value }))}
            className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
          >
            <option>G9</option>
            <option>G10</option>
            <option>G11</option>
            <option>G12</option>
          </select>
          <select
            value={form.system}
            onChange={(event) => setForm((current) => ({ ...current, system: event.target.value }))}
            className="rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
          >
            <option>AP</option>
            <option>AL</option>
          </select>
          {error ? <div className="text-sm text-[var(--danger)] md:col-span-2">{error}</div> : null}
          <button type="button" onClick={() => void handleSignup()} className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white md:col-span-2">
            {submitting ? (locale === "zh" ? "创建中..." : "Creating account...") : locale === "zh" ? "创建账号" : "Create account"}
          </button>
        </form>
        <div className="mt-4 text-sm text-[var(--muted)]">
          {locale === "zh" ? "已有账号？" : "Already registered?"}{" "}
          <Link href="/student/login" className="font-semibold text-[var(--primary)]">
            {locale === "zh" ? "登录" : "Log in"}
          </Link>
        </div>
      </Card>
    </div>
  );
}
