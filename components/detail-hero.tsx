"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, MessageSquareMore, Star } from "lucide-react";

import { Card } from "@/components/card";
import { GuestNameDialog } from "@/components/guest-name-dialog";
import { useIdentity } from "@/components/identity-provider";
import { useLocale } from "@/components/locale-provider";

export function DetailHero({
  title,
  subtitle,
  showSubtitle = true,
  description,
  image,
  stars,
  extra,
  targetType,
  targetId,
  initialFavorite = false,
  canFavorite = false,
  favoriteInStar = false,
  onMutated,
  discussionHref
}: {
  title: string;
  subtitle: string;
  showSubtitle?: boolean;
  description: string;
  image?: string;
  stars: number;
  extra: ReactNode;
  targetType?: "teacher" | "course";
  targetId?: string;
  initialFavorite?: boolean;
  canFavorite?: boolean;
  favoriteInStar?: boolean;
  onMutated?: () => void;
  discussionHref?: string;
}) {
  const { copy } = useLocale();
  const { identity, enableGuestPosting } = useIdentity();
  const router = useRouter();
  const [saved, setSaved] = useState(initialFavorite);
  const [submitting, setSubmitting] = useState(false);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [pendingFavorite, setPendingFavorite] = useState(false);
  const usesGuestIdentity = identity.status === "student-browser" || identity.status === "student-guest";

  useEffect(() => {
    setSaved(initialFavorite);
  }, [initialFavorite]);

  useEffect(() => {
    if (!pendingFavorite || !identity.guestDisplayName || !identity.guestKey) {
      return;
    }

    setPendingFavorite(false);
    void toggleFavorite();
  }, [identity.guestDisplayName, identity.guestKey, pendingFavorite]);

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
      throw new Error(payload?.error ?? "Unable to save guest identity.");
    }

    enableGuestPosting(name);
    setGuestDialogOpen(false);
  }

  async function toggleFavorite() {
    if (!targetId || !targetType) {
      return;
    }

    const guestPayload =
      usesGuestIdentity && identity.guestDisplayName && identity.guestKey
        ? {
            guestName: identity.guestDisplayName,
            guestKey: identity.guestKey
          }
        : undefined;

    if (!canFavorite && identity.selectedRole !== "student") {
      return;
    }

    if (usesGuestIdentity && !guestPayload) {
      setPendingFavorite(true);
      setGuestDialogOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetType,
          targetId,
          guest: usesGuestIdentity ? guestPayload : undefined
        })
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { active: boolean };
      setSaved(payload.active);
      onMutated?.();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="h-24 bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-500" />
      <div className="px-6 pb-6">
        <div className="-mt-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
            {image ? (
              <img src={image} alt={title} className="soft-ring h-24 w-24 shrink-0 rounded-[28px] object-cover" />
            ) : (
              <div className="soft-ring flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-white text-3xl font-semibold text-[var(--primary)]">
                {title.slice(0, 2)}
              </div>
            )}
            <div className="min-w-0 pt-0 sm:pt-12">
              {showSubtitle && subtitle ? (
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">{subtitle}</div>
              ) : null}
              <h1 className={showSubtitle && subtitle ? "mt-2 text-3xl font-semibold tracking-tight" : "text-3xl font-semibold tracking-tight"}>{title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <button
              type="button"
              onClick={() => void toggleFavorite()}
              disabled={(!canFavorite && identity.selectedRole !== "student") || submitting}
              className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 disabled:opacity-60"
            >
              <Star className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
              {stars}
            </button>
            {!favoriteInStar ? (
              <button
                type="button"
                onClick={() => void toggleFavorite()}
                disabled={!canFavorite || submitting}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium"
              >
                <Bookmark className="h-4 w-4" />
                {saved ? copy.savedState : copy.save}
              </button>
            ) : null}
            <Link
              href={discussionHref ?? "#discussion-section"}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
            >
              <MessageSquareMore className="h-4 w-4" />
              {copy.joinDiscussion}
            </Link>
          </div>
        </div>
        <div className="mt-5">{extra}</div>
      </div>
      <GuestNameDialog
        open={guestDialogOpen}
        initialValue={identity.guestDisplayName}
        onClose={() => {
          setPendingFavorite(false);
          setGuestDialogOpen(false);
        }}
        onConfirm={saveGuestIdentity}
      />
    </Card>
  );
}
