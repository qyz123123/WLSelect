"use client";

import { Globe } from "lucide-react";

import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale, setLocale, copy } = useLocale();

  return (
    <div className="flex h-[30px] items-center gap-1 rounded-full border border-[var(--border)] bg-white px-1">
      <div className="topbar-text flex h-[22px] items-center gap-1.5 px-2 text-[var(--muted)] sm:px-2.5">
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline leading-none">{copy.language}</span>
      </div>
      {(["en", "zh"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => void setLocale(option)}
          className={cn(
            "topbar-text flex h-[22px] min-w-[54px] items-center justify-center rounded-full px-2 transition sm:min-w-[60px]",
            locale === option
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--muted)] hover:bg-[var(--surface-alt)]"
          )}
        >
          {option === "en" ? copy.englishLabel : copy.chineseLabel}
        </button>
      ))}
    </div>
  );
}
