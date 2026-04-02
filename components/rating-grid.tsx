"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

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
  const router = useRouter();
  const [items, setItems] = useState(ratings);
  const [draftScores, setDraftScores] = useState<Record<string, number>>({});
  const [draftMode, setDraftMode] = useState(false);
  const [submittingDimension, setSubmittingDimension] = useState<string | null>(null);
  const [submittingBatch, setSubmittingBatch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [guestSuggestion, setGuestSuggestion] = useState(identity.guestDisplayName ?? "");
  const [guestLoading, setGuestLoading] = useState(false);
  const [pendingStartRating, setPendingStartRating] = useState(false);

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

  useEffect(() => {
    if (!pendingStartRating || !identity.guestDisplayName || !identity.guestKey) {
      return;
    }

    setPendingStartRating(false);
    setDraftMode(true);
  }, [identity.guestDisplayName, identity.guestKey, pendingStartRating]);

  const viewerRatingRole = viewer?.role === "teacher" ? "teacher-self" : viewer?.role === "student" ? "student" : null;
  const canGuestRate = !viewer && identity.selectedRole === "student" && Boolean(targetType && targetId);
  const isStudentRater = Boolean((viewer?.role === "student" && targetType && targetId) || canGuestRate);
  const isTeacherSelfRater = Boolean(viewer?.role === "teacher" && targetType && targetId);
  const canRate = Boolean((viewer && viewer.role !== "admin" && targetType && targetId && viewerRatingRole) || canGuestRate);
  const submittedViewerRatings = items.filter((rating) =>
    viewer?.role === "student"
      ? rating.authorId === viewer.id && rating.role === "student"
      : identity.guestKey
        ? rating.guestKey === identity.guestKey && rating.role === "student"
        : false
  );
  const isStudentRatingLocked = isStudentRater && submittedViewerRatings.length > 0;

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
    setError(null);
    setGuestDialogOpen(false);
  }

  function startStudentRating() {
    if (!isStudentRater || isStudentRatingLocked) {
      return;
    }

    if (!viewer && (!canGuestRate || !identity.selectedRole)) {
      return;
    }

    if (!viewer && (!identity.guestDisplayName || !identity.guestKey)) {
      setPendingStartRating(true);
      setGuestDialogOpen(true);
      return;
    }

    setError(null);
    setDraftMode(true);
  }

  async function submitTeacherRating(dimension: string, score: number) {
    if (!isTeacherSelfRater || !targetType || !targetId || !viewer) {
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
          score
        })
      });

      if (!response.ok) {
        setItems(previous);
        onRatingsChange?.(previous);
      } else {
        router.refresh();
      }
    } catch {
      setItems(previous);
      onRatingsChange?.(previous);
    } finally {
      setSubmittingDimension(null);
    }
  }

  async function submitStudentRatings() {
    if (!isStudentRater || !targetType || !targetId || isStudentRatingLocked) {
      return;
    }

    if (!viewer && (!identity.guestDisplayName || !identity.guestKey)) {
      setPendingStartRating(true);
      setGuestDialogOpen(true);
      return;
    }

    const missingDimension = dimensions.find((dimension) => !draftScores[dimension.key]);
    if (missingDimension) {
      setError(copy.selectAllRatings);
      return;
    }

    setSubmittingBatch(true);
    setError(null);

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetType,
          targetId,
          ratings: dimensions.map((dimension) => ({
            dimension: dimension.key,
            score: draftScores[dimension.key]
          })),
          guest:
            !viewer && identity.guestDisplayName && identity.guestKey
              ? {
                  guestName: identity.guestDisplayName,
                  guestKey: identity.guestKey
                }
              : undefined
        })
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? (locale === "zh" ? "评分发布失败，请重试。" : "Unable to post ratings. Please try again."));
        return;
      }

      const postedRatings = (payload?.ratings as RatingValue[] | undefined) ?? [];
      const next = [
        ...items.filter((rating) =>
          viewer?.role === "student"
            ? !(rating.authorId === viewer.id && rating.role === "student")
            : identity.guestKey
              ? !(rating.guestKey === identity.guestKey && rating.role === "student")
              : true
        ),
        ...postedRatings
      ];

      setItems(next);
      onRatingsChange?.(next);
      setDraftMode(false);
      setDraftScores({});
      router.refresh();
    } finally {
      setSubmittingBatch(false);
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {isStudentRater ? (
        <div className="md:col-span-2">
          {!draftMode && !isStudentRatingLocked ? (
            <button
              type="button"
              onClick={startStudentRating}
              className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              {copy.iWantToRate}
            </button>
          ) : null}
          {draftMode ? <div className="mt-2 text-sm text-[var(--muted)]">{copy.pickStarsThenPost}</div> : null}
          {isStudentRatingLocked ? <div className="text-sm text-[var(--muted)]">{copy.ratingsLocked}</div> : null}
          {error ? <div className="mt-2 text-sm text-[var(--danger)]">{error}</div> : null}
        </div>
      ) : null}
      {dimensions.map((dimension) => {
        const relevantRatings = items.filter((rating) => rating.dimension === dimension.key);
        const values = relevantRatings.map((rating) => rating.score);
        const average = averageScore(values);
        const viewerScore = viewer
          ? relevantRatings.find((rating) => rating.authorId === viewer.id && rating.role === viewerRatingRole)?.score
          : identity.guestKey
            ? relevantRatings.find((rating) => rating.guestKey === identity.guestKey && rating.role === "student")?.score
            : undefined;
        const draftScore = draftScores[dimension.key];
        const activeScore = isStudentRater ? (draftMode ? draftScore : viewerScore) : viewerScore;
        const isSubmitting = submittingDimension === dimension.key || submittingBatch;

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
            <div className="mt-4 grid max-w-[220px] grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  disabled={!canRate || isSubmitting || (isStudentRater ? (!draftMode || isStudentRatingLocked) : false)}
                  onClick={() =>
                    isStudentRater
                      ? setDraftScores((current) => ({ ...current, [dimension.key]: score }))
                      : void submitTeacherRating(dimension.key, score)
                  }
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition",
                    activeScore && score <= activeScore ? "text-[var(--primary)]" : "text-slate-300",
                    (!canRate || isSubmitting) && "cursor-not-allowed opacity-60"
                  )}
                  aria-label={`${dimension.label[locale]} ${score}/5`}
                >
                  <Star className="h-6 w-6" fill={activeScore && score <= activeScore ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
              <span>
                {canRate
                  ? !viewer
                    ? locale === "zh"
                      ? targetType === "teacher"
                        ? "游客和学生账号都可以给老师评分"
                        : "游客和学生账号都可以给课程评分"
                      : targetType === "teacher"
                        ? "Guests and students can rate this teacher"
                        : "Guests and students can rate this course"
                    : copy.tapToRate
                  : !viewer
                    ? locale === "zh"
                      ? "请选择学生身份后评分"
                      : "Choose the student entry path to rate"
                    : copy.signInToRate}
              </span>
              {viewerScore ? (
                <span>
                  {copy.yourRating}: {viewerScore}/5
                </span>
              ) : null}
            </div>
            {isSubmitting ? <div className="mt-2 text-xs text-[var(--muted)]">{copy.saving}</div> : null}
          </div>
        );
      })}
      {isStudentRater && draftMode && !isStudentRatingLocked ? (
        <div className="md:col-span-2 flex justify-end">
          <button
            type="button"
            onClick={() => void submitStudentRatings()}
            disabled={submittingBatch}
            className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {copy.postAction}
          </button>
        </div>
      ) : null}
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
