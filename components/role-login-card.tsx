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
  const { locale } = useLocale();
  const { selectStudent, selectTeacher } = useIdentity();
  const router = useRouter();
  const [email, setEmail] = useState(role === "teacher" ? "reyes@wlselect.edu" : role === "admin" ? "admin@wlselect.edu" : "maya@wlselect.edu");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setSubmitting(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      expectedRole: role,
      redirect: false
    });

    setSubmitting(false);

    if (result?.error) {
      setError(locale === "zh" ? "邮箱、密码或身份不正确。" : "Email, password, or account role is incorrect.");
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
      <form className="mt-6 space-y-4">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
        />
        {error ? <div className="text-sm text-[var(--danger)]">{error}</div> : null}
        <button type="button" onClick={() => void handleLogin()} className="w-full rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white">
          {submitting ? (locale === "zh" ? "登录中..." : "Logging in...") : locale === "zh" ? "登录" : "Log in"}
        </button>
      </form>
      {signupHref ? (
        <div className="mt-4 text-sm text-[var(--muted)]">
          {locale === "zh" ? "还没有账号？" : "Need an account?"}{" "}
          <Link href={signupHref} className="font-semibold text-[var(--primary)]">
            {locale === "zh" ? "注册" : "Sign up"}
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
