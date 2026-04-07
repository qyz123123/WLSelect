"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/card";
import { useIdentity } from "@/components/identity-provider";
import { useLocale } from "@/components/locale-provider";
import { Role } from "@/lib/types";

export function RoleLoginCard({
  role,
  title,
  description,
  signupHref,
  callbackUrl = "/"
}: {
  role: Extract<Role, "student" | "teacher" | "admin">;
  title: string;
  description: string;
  signupHref?: string;
  callbackUrl?: string;
}) {
  const { locale, copy } = useLocale();
  const { selectStudent, selectTeacher } = useIdentity();
  const router = useRouter();
  const isTeacherLogin = role === "teacher";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setSubmitting(true);
    setError(null);

    const result = await signIn(
      "credentials",
      isTeacherLogin
        ? {
            name,
            expectedRole: role,
            redirect: false
          }
        : {
            email,
            password,
            expectedRole: role,
            redirect: false
          }
    );

    setSubmitting(false);

    if (result?.error) {
      setError(
        isTeacherLogin
          ? locale === "zh"
            ? "教师姓名或身份不正确。"
            : "Teacher name or account role is incorrect."
          : locale === "zh"
            ? "邮箱、密码或身份不正确。"
            : "Email, password, or account role is incorrect."
      );
      return;
    }

    if (role === "teacher") {
      selectTeacher();
    } else if (role === "student") {
      selectStudent();
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
      <form className="mt-6 space-y-4" autoComplete="off">
        {isTeacherLogin ? (
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={locale === "zh" ? "教师姓名" : "Teacher name"}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
          />
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={locale === "zh" ? "邮箱" : "Email"}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={locale === "zh" ? "密码" : "Password"}
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </>
        )}
        {error ? <div className="text-sm text-[var(--danger)]">{error}</div> : null}
        <button type="button" onClick={() => void handleLogin()} className="w-full rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white">
          {submitting ? (locale === "zh" ? "登录中..." : "Logging in...") : copy.logIn}
        </button>
      </form>
      {signupHref ? (
        <div className="mt-4 text-sm text-[var(--muted)]">
          {locale === "zh" ? "还没有账号？" : "Need an account?"}{" "}
          <Link href={signupHref} className="font-semibold text-[var(--primary)]">
            {copy.signUp}
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
