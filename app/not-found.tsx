"use client";

import Link from "next/link";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";

export default function NotFound() {
  const { copy, locale } = useLocale();

  return (
    <div className="mx-auto max-w-xl py-10">
      <Card>
        <h1 className="text-3xl font-semibold tracking-tight">{copy.pageNotFound}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {locale === "zh" ? "未找到你请求的教师、课程或页面。" : "The requested teacher, course, or page could not be found in this workspace."}
        </p>
        <Link href="/" className="mt-5 inline-flex rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
          {copy.backHome}
        </Link>
      </Card>
    </div>
  );
}
