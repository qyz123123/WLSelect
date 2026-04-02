"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/card";
import { GuestNameDialog } from "@/components/guest-name-dialog";
import { useIdentity } from "@/components/identity-provider";
import { useLocale } from "@/components/locale-provider";
import { AppUser } from "@/lib/types";

export function DiscussionComposer({
  targetType,
  targetId,
  viewer,
  onMutated,
  successAnchorId = "comments-section",
  onPosted
}: {
  targetType: "teacher" | "course";
  targetId: string;
  viewer?: AppUser | null;
  onMutated?: () => void;
  successAnchorId?: string;
  onPosted?: () => void;
}) {
  const { locale, copy } = useLocale();
  const { identity, enableGuestPosting } = useIdentity();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC_ONLY" | "PUBLIC_AND_TEACHER">("PUBLIC_ONLY");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [guestSuggestion, setGuestSuggestion] = useState(identity.guestDisplayName ?? "");
  const [guestLoading, setGuestLoading] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const canComment = viewer?.role === "student" || viewer?.role === "teacher" || identity.selectedRole === "student";
  const mustUseGuestIdentity = !viewer && identity.selectedRole === "student";

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
    if (!pendingSubmit || !identity.guestDisplayName || !identity.guestKey) {
      return;
    }

    setPendingSubmit(false);
    void submit();
  }, [identity.guestDisplayName, identity.guestKey, pendingSubmit]);

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

  async function submit(options?: {
    guest?: {
      guestName: string;
      guestKey?: string;
    };
  }) {
    if (viewer?.role === "admin") {
      return;
    }

    if (!canComment) {
      setError(locale === "zh" ? "请先以学生身份登录或继续。" : "Please continue as a student first.");
      return;
    }

    const guestPayload =
      !viewer && (options?.guest?.guestName || identity.guestDisplayName)
        ? {
            guestName: options?.guest?.guestName ?? identity.guestDisplayName!,
            guestKey: options?.guest?.guestKey ?? identity.guestKey ?? ""
          }
        : undefined;

    if (mustUseGuestIdentity && !guestPayload?.guestKey) {
      setError(null);
      setPendingSubmit(true);
      setGuestDialogOpen(true);
      return;
    }

    if (mustUseGuestIdentity && !guestPayload) {
      setError(null);
      setPendingSubmit(true);
      setGuestDialogOpen(true);
      return;
    }

    if (!body.trim()) {
      setError(locale === "zh" ? "请输入评论内容。" : "Please enter a comment.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetType,
          targetId,
          body: body.trim(),
          visibility,
          ratings: [],
          guest: !viewer ? guestPayload : undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.error ?? (locale === "zh" ? "评论发布失败，请重试。" : "Unable to post the comment. Please try again."));
        return;
      }

      setBody("");
      setVisibility("PUBLIC_ONLY");
      onMutated?.();
      router.refresh();
      onPosted?.();
      if (onPosted) {
        return;
      }
      window.requestAnimationFrame(() => {
        const anchor = document.getElementById(successAnchorId);
        if (!anchor) {
          return;
        }

        window.history.replaceState(null, "", `#${successAnchorId}`);
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <div className="text-sm font-semibold text-[var(--foreground)]">{copy.writeComment}</div>
      <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{copy.communityGuidelines}</p>
      {viewer?.role === "admin" ? (
        <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {locale === "zh" ? "管理员可回复现有内容，但不能发布新的评论。" : "Admins can reply to existing threads, but cannot publish new top-level comments."}
        </p>
      ) : null}
      {viewer?.role === "teacher" ? (
        <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {locale === "zh" ? "教师可以在这里发布评论。" : "Teachers can post comments here."}
        </p>
      ) : null}
      {!viewer && identity.selectedRole !== "student" ? (
        <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {locale === "zh" ? "请选择学生身份后再发言。" : "Choose the student entry path before posting."}
        </p>
      ) : null}
      {!viewer && identity.status === "student-browser" ? (
        <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {locale === "zh" ? "你可以先选择一个游客名称，再直接发表评论。" : "You can post without full registration. We will ask for a guest display name first."}
        </p>
      ) : null}
      <div className="mt-4 grid gap-4">
        <textarea
          rows={5}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={locale === "en" ? "Share your experience constructively..." : "请建设性地分享你的体验..."}
          className="min-w-0 w-full rounded-3xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--primary)]"
        />
        <select
          className="min-w-0 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as "PUBLIC_ONLY" | "PUBLIC_AND_TEACHER")}
        >
          <option value="PUBLIC_AND_TEACHER">{copy.visibleToTeacherOption}</option>
          <option value="PUBLIC_ONLY">{copy.publicOnlyOption}</option>
        </select>
      </div>
      {error ? <div className="mt-4 text-sm text-[var(--danger)]">{error}</div> : null}
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting || viewer?.role === "admin" || !canComment}
          className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {copy.writeComment}
        </button>
      </div>
      <GuestNameDialog
        open={guestDialogOpen}
        loading={guestLoading}
        initialValue={identity.guestDisplayName ?? guestSuggestion}
        onClose={() => setGuestDialogOpen(false)}
        onConfirm={saveGuestIdentity}
      />
    </Card>
  );
}
