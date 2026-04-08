"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, GraduationCap, Home, MessageSquareMore, NotebookText, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { useLocale } from "@/components/locale-provider";
import { AppUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import logoLong from "@/logo_long.png";

const items = [
  { href: "/", key: "home", icon: Home },
  { href: "/teachers", key: "teachers", icon: GraduationCap },
  { href: "/courses", key: "courses", icon: NotebookText },
  { href: "/saved", key: "saved", icon: Bookmark },
  { href: "/me/profile", key: "myProfile", icon: UserRound },
  { href: "/me/comments", key: "myComments", icon: MessageSquareMore }
] as const;

export function Sidebar({ viewer }: { viewer: AppUser | null }) {
  const pathname = usePathname();
  const { copy, locale } = useLocale();
  const navItems = [
    ...items,
    ...(viewer?.role === "teacher" ? [{ href: "/teacher/dashboard", key: "management" as const, icon: UserRound }] : []),
    ...(viewer?.role === "admin" ? [{ href: "/admin", key: "management" as const, icon: UserRound }] : [])
  ];

  return (
    <>
      <aside className="card-surface rounded-[24px] p-2.5 xl:hidden">
        <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-center text-sm font-medium transition",
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{copy[item.key]}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <aside className="card-surface sticky top-6 hidden h-fit rounded-[28px] p-4 xl:block">
        <div className="mb-5 border-b border-[var(--border)] pb-4">
          <Image src={logoLong} alt={copy.appName} className="h-auto w-[240px] max-w-full" priority />
          <p className="mt-1 text-sm text-[var(--muted)]">{locale === "zh" ? "你的声音，他人的选择" : copy.tagline}</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{copy[item.key]}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
