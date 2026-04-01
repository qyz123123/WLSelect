"use client";

import { useEffect, useState } from "react";

import { GuestNameDialog } from "@/components/guest-name-dialog";
import { useIdentity } from "@/components/identity-provider";
import { useLocale } from "@/components/locale-provider";
import { AppUser, RatingDimension, RatingValue } from "@/lib/types";
import { averageScore, cn } from "@/lib/utils";

export function RatingGrid({
  dimensions,
  ratings,
  viewer,
  targetType,
  targetId,
  onRatingsChange
}: {
  dimensions: RatingDimension[];
  ratings: RatingValue[];
  viewer?: AppUser | null;
  targetType?: "teacher" | "course";
  targetId?: string;
  onRatingsChange?: (ratings: RatingValue[]) => void;
}) {
  const { locale, copy } = useLocale();
  const { identity, enableGuestPosting } = useIdentity();
  const [items, setItems] = useState(ratings);
  const [submittingDimension, setSubmittingDimension] = useState<string | null>(null);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [guestSuggestion, setGuestSuggestion] = useState(identity.guestDisplayName ?? "");
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    setItems(ratings);
  }, [ratings]);

  useEffect(() => {
    if (!guestDialogOpen || identity.guestDisplayName) {
      return;
    }

    let cancelled = false;
    setGuestLoading(true);

    fetch("/api/guest/display-name")
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) {
          setGuestSuggestion(payload?.suggestion ?? "");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setGuestLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [guestDialogOpen, identity.guestDisplayName]);

  const viewerRatingRole = viewer?.role === "teacher" ? "teacher-self" : viewer?.role === "student" ? "student" : null;
  const canGuestRate = !viewer && identity.selectedRole === "student" && targetType === "course" && Boolean(targetId);
  const canRate = Boolean(
    (viewer && viewer.role !== "admin" && targetType && targetId && viewerRatingRole) || canGuestRate
  );

  function formatAverage(score: number) {
    return Number.isInteger(score) ? score.toFixed(0) : score.toFixed(1);
  }

  function upsertRating(list: RatingValue[], dimension: string, score: number) {
    if (viewer && viewerRatingRole) {
      const next = list.filter(
        (rating) => !(rating.dimension === dimension && rating.authorId === viewer.id && rating.role === viewerRatingRole)
      );

      next.push({
        authorId: viewer.id,
        dimension,
        score,
        role: viewerRatingRole
      });

      return next;
    }

    if (!identity.guestKey) {
      return list;
    }

    const next = list.filter(
      (rating) => !(rating.dimension === dimension && rating.guestKey === identity.guestKey && rating.role === "student")
    );

    next.push({
      guestKey: identity.guestKey,
      dimension,
      score,
      role: "student"
    });

    return next;
  }

  async function saveGuestIdentity(name: string) {
    const response = await fetch("/api/guest/display-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error ?? (locale === "zh" ? "游客名称不可用。" : "That guest name is unavailable."));
    }

    enableGuestPosting(name);
    setGuestDialogOpen(false);
  }

  async function submitRating(dimension: string, score: number) {
    if (!canRate || !targetType || !targetId) {
      return;
    }

    if (!viewer && (!canGuestRate || !identity.selectedRole)) {
      return;
    }

    if (!viewer && (!identity.guestDisplayName || !identity.guestKey)) {
      setGuestDialogOpen(true);
      return;
    }

    const previous = items;
    const optimistic = upsertRating(items, dimension, score);
    setItems(optimistic);
    onRatingsChange?.(optimistic);
    setSubmittingDimension(dimension);

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetType,
          targetId,
          dimension,
          score,
          guest:
            !viewer && identity.guestDisplayName && identity.guestKey
              ? {
                  guestName: identity.guestDisplayName,
                  guestKey: identity.guestKey
                }
              : undefined
        })
      });

      if (!response.ok) {
        setItems(previous);
        onRatingsChange?.(previous);
      }
    } catch {
      setItems(previous);
      onRatingsChange?.(previous);
    } finally {
      setSubmittingDimension(null);
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {dimensions.map((dimension) => {
        const relevantRatings = items.filter((rating) => rating.dimension === dimension.key);
        const values = relevantRatings.map((rating) => rating.score);
        const average = averageScore(values);
        const viewerScore = viewer
          ? relevantRatings.find((rating) => rating.authorId === viewer.id && rating.role === viewerRatingRole)?.score
          : identity.guestKey
            ? relevantRatings.find((rating) => rating.guestKey === identity.guestKey && rating.role === "student")?.score
            : undefined;
        const isSubmitting = submittingDimension === dimension.key;

        return (
          <div key={dimension.key} className="rounded-[28px] border border-[var(--border)] bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-6">{dimension.label[locale]}</div>
                <div className="mt-2 text-xs text-[var(--muted)]">
                  {values.length === 0
                    ? copy.noRatingsYet
                    : locale === "zh"
                      ? `${values.length} 条评分`
                      : `${values.length} rating${values.length === 1 ? "" : "s"}`}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-3xl font-semibold tracking-tight">{values.length > 0 ? formatAverage(average) : "—"}</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">{copy.averageLabel}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-1.5">
              {[1, 2, 3, 4, 5].map((index) => (
                <span
                  key={index}
                  className={cn(
                    "h-2.5 flex-1 rounded-full transition",
                    values.length > 0 && index <= Math.round(average) ? "bg-[var(--primary)]" : "bg-slate-200"
                  )}
                />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  disabled={!canRate || isSubmitting}
                  onClick={() => void submitRating(dimension.key, score)}
                  className={cn(
                    "rounded-2xl border px-0 py-2 text-sm font-semibold transition",
                    viewerScore === score
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-[var(--surface-alt)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
                    (!canRate || isSubmitting) && "cursor-not-allowed opacity-60"
                  )}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
              <span>
                {canRate
                  ? !viewer && targetType === "course"
                    ? locale === "zh"
                      ? "游客和学生账号都可以评分"
                      : "Guests and students can rate this course"
                    : copy.tapToRate
                  : copy.signInToRate}
              </span>
              {viewerScore ? (
                <span>
                  {copy.yourRating}: {viewerScore}/5
                </span>
              ) : null}
            </div>
            {isSubmitting ? <div className="mt-2 text-xs text-[var(--muted)]">{locale === "zh" ? "保存中..." : "Saving..."}</div> : null}
          </div>
        );
      })}
      <GuestNameDialog
        open={guestDialogOpen}
        loading={guestLoading}
        initialValue={identity.guestDisplayName ?? guestSuggestion}
        onClose={() => setGuestDialogOpen(false)}
        onConfirm={saveGuestIdentity}
      />
    </div>
  );
}
