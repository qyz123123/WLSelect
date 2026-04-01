"use client";

import Link from "next/link";
import { Bookmark, GraduationCap, Home, MessageSquareMore, NotebookText, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { useLocale } from "@/components/locale-provider";
import { AppUser } from "@/lib/types";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", key: "home", icon: Home },
  { href: "/teachers", key: "teachers", icon: GraduationCap },
  { href: "/courses", key: "courses", icon: NotebookText },
  { href: "/saved", key: "saved", icon: Bookmark },
  { href: "/me/profile", key: "myProfile", icon: UserRound },
  { href: "/me/comments", key: "myComments", icon: MessageSquareMore },
  { href: "/me/questions", key: "myQuestions", icon: MessageSquareMore }
] as const;

export function Sidebar({ viewer }: { viewer: AppUser | null }) {
  const pathname = usePathname();
  const { copy } = useLocale();
  const navItems = [
    ...items,
    ...(viewer?.role === "teacher" ? [{ href: "/teacher/dashboard", key: "management" as const, icon: UserRound }] : []),
    ...(viewer?.role === "admin" ? [{ href: "/admin", key: "management" as const, icon: UserRound }] : [])
  ];

  return (
    <aside className="card-surface sticky top-6 hidden h-fit rounded-[28px] p-4 xl:block">
      <div className="mb-5 border-b border-[var(--border)] pb-4">
        <div className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{copy.appName}</div>
        <p className="mt-1 text-sm text-[var(--muted)]">{copy.tagline}</p>
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
  );
}
