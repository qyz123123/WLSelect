"use client";

import { Globe } from "lucide-react";

import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale, setLocale, copy } = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-white p-1">
      <div className="flex items-center gap-2 px-2 text-sm text-[var(--muted)] sm:px-3">
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{copy.language}</span>
      </div>
      {(["en", "zh"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => void setLocale(option)}
          className={cn(
            "rounded-full px-2.5 py-1 text-sm font-medium transition sm:px-3",
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
