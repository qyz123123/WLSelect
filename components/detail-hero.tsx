"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { Bookmark, MessageSquareMore, Star } from "lucide-react";

import { Card } from "@/components/card";

export function DetailHero({
  title,
  subtitle,
  description,
  image,
  stars,
  extra,
  targetType,
  targetId,
  initialFavorite = false,
  canFavorite = false,
  onMutated,
  discussionHref
}: {
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  stars: number;
  extra: ReactNode;
  targetType?: "teacher" | "course";
  targetId?: string;
  initialFavorite?: boolean;
  canFavorite?: boolean;
  onMutated?: () => void;
  discussionHref?: string;
}) {
  const [saved, setSaved] = useState(initialFavorite);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSaved(initialFavorite);
  }, [initialFavorite]);

  async function toggleFavorite() {
    if (!targetId || !targetType || !canFavorite) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ targetType, targetId })
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { active: boolean };
      setSaved(payload.active);
      onMutated?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="h-24 bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-500" />
      <div className="px-6 pb-6">
        <div className="-mt-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex gap-4">
            {image ? (
              <img src={image} alt={title} className="soft-ring h-24 w-24 rounded-[28px] object-cover" />
            ) : (
              <div className="soft-ring flex h-24 w-24 items-center justify-center rounded-[28px] bg-white text-3xl font-semibold text-[var(--primary)]">
                {title.slice(0, 2)}
              </div>
            )}
            <div className="pt-12">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">{subtitle}</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              <Star className="h-4 w-4" />
              {stars}
            </div>
            <button
              type="button"
              onClick={() => void toggleFavorite()}
              disabled={!canFavorite || submitting}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium"
            >
              <Bookmark className="h-4 w-4" />
              {saved ? "Saved" : "Save"}
            </button>
            <Link
              href={discussionHref ?? "#discussion-section"}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
            >
              <MessageSquareMore className="h-4 w-4" />
              Join discussion
            </Link>
          </div>
        </div>
        <div className="mt-5">{extra}</div>
      </div>
    </Card>
  );
}
