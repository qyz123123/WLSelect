"use client";

import Link from "next/link";
import { ArrowLeftRight, Bell, LogOut, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useIdentity } from "@/components/identity-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { RoleBadge } from "@/components/role-badge";
import { useLocale } from "@/components/locale-provider";
import { AppUser } from "@/lib/types";

export function Topbar({
  user,
  unreadNotifications = 0
}: {
  user: AppUser | null;
  unreadNotifications?: number;
}) {
  const { copy, locale } = useLocale();
  const router = useRouter();
  const { identity, clearIdentity } = useIdentity();
  const [query, setQuery] = useState("");

  function submitSearch() {
    const normalized = query.trim();
    if (!normalized) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(normalized)}`);
  }

  async function handleExit() {
    clearIdentity();

    if (user) {
      await signOut({ callbackUrl: "/" });
      return;
    }

    router.push("/");
    router.refresh();
  }

  const studentSelected = identity.selectedRole === "student";
  const teacherSelected = identity.selectedRole === "teacher";
  const guestMode = !user && identity.status === "student-guest";
  const loginHref = teacherSelected ? "/teacher/login" : "/student/login";
  const signupHref = teacherSelected ? "/teacher/register" : "/student/register";
  const notificationHref = user ? "/notifications" : loginHref;

  return (
    <header className="sticky top-0 z-20 mb-6 border-b border-white/50 bg-[rgba(243,246,249,0.9)] backdrop-blur">
      <div className="mx-auto flex max-w-[1480px] flex-wrap items-center gap-3 px-4 py-4 lg:flex-nowrap lg:gap-4 lg:px-6">
        <label className="order-2 flex min-w-0 w-full items-center gap-3 rounded-full border border-[var(--border)] bg-white px-4 py-3 shadow-sm lg:order-1 lg:flex-1">
          <Search className="h-4 w-4 text-[var(--muted)]" />
          <input
            aria-label={copy.searchPlaceholder}
            placeholder={copy.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitSearch();
              }
            }}
            className="min-w-0 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
          />
          <button type="button" onClick={submitSearch} className="shrink-0 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white">
            Search
          </button>
        </label>
        <div className="order-1 flex min-w-0 items-center gap-2 sm:gap-3 lg:order-2">
          <LanguageSwitcher />
          <Link
            href={notificationHref}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--muted)]"
            aria-label={copy.notifications}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[var(--primary)]" /> : null}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/me/profile" className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-2.5 py-2 sm:px-3">
                <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                <div className="hidden text-left md:block">
                  <div className="text-sm font-semibold text-[var(--foreground)]">{user.name}</div>
                  <RoleBadge role={user.role} verified={user.teacherVerified} />
                </div>
              </Link>
              <button
                type="button"
                onClick={() => void handleExit()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--muted)]"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : guestMode ? (
            <div className="flex items-center gap-2">
              <div className="hidden rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] sm:block">
                {identity.guestDisplayName}
              </div>
              <Link href="/student/login" className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold sm:px-4">
                {locale === "zh" ? "登录" : "Log in"}
              </Link>
              <button
                type="button"
                onClick={() => void handleExit()}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)]"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === "zh" ? "切换" : teacherSelected ? "Switch" : "Reset"}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={loginHref} className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold sm:px-4">
                {teacherSelected ? (locale === "zh" ? "教师登录" : "Teacher login") : locale === "zh" ? "登录" : "Log in"}
              </Link>
              <Link href={signupHref} className="rounded-full bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white sm:px-4">
                {teacherSelected ? (locale === "zh" ? "教师注册" : "Teacher register") : locale === "zh" ? "注册" : "Sign up"}
              </Link>
              {identity.selectedRole ? (
                <button
                  type="button"
                  onClick={() => void handleExit()}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--muted)]"
                  aria-label="Switch identity"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
