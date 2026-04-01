"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/card";
import { GuestNameDialog } from "@/components/guest-name-dialog";
import { useIdentity } from "@/components/identity-provider";
import { useLocale } from "@/components/locale-provider";
import { AppUser } from "@/lib/types";

export function DiscussionComposer({
  targetType,
  targetId,
  viewer,
  onMutated
}: {
  targetType: "teacher" | "course";
  targetId: string;
  viewer?: AppUser | null;
  onMutated?: () => void;
}) {
  const { locale, copy } = useLocale();
  const { identity, enableGuestPosting } = useIdentity();
  const [mode, setMode] = useState<"comment" | "question">("comment");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC_ONLY" | "PUBLIC_AND_TEACHER">("PUBLIC_ONLY");
  const [submitting, setSubmitting] = useState(false);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [guestSuggestion, setGuestSuggestion] = useState(identity.guestDisplayName ?? "");
  const [guestLoading, setGuestLoading] = useState(false);

  const canComment = viewer?.role === "student" || viewer?.role === "teacher" || identity.selectedRole === "student";
  const canAskQuestion = viewer?.role === "student" || identity.selectedRole === "student";
  const mustUseGuestIdentity = !viewer && identity.selectedRole === "student";

  useEffect(() => {
    if (viewer?.role === "teacher" && mode === "question") {
      setMode("comment");
    }
  }, [mode, viewer?.role]);

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

  async function ensureGuestIdentity() {
    if (identity.guestDisplayName && identity.guestKey) {
      return;
    }

    setGuestDialogOpen(true);
    throw new Error("guest-name-required");
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

  async function submit() {
    if (viewer?.role === "admin") {
      return;
    }

    if ((mode === "comment" && !canComment) || (mode === "question" && !canAskQuestion)) {
      return;
    }

    if (mustUseGuestIdentity) {
      try {
        await ensureGuestIdentity();
      } catch {
        return;
      }
    }

    setSubmitting(true);
    try {
      const endpoint = mode === "comment" ? "/api/comments" : "/api/questions";
      const payload =
        mode === "comment"
          ? {
              targetType,
              targetId,
              title,
              body,
              visibility,
              ratings: [],
              guest:
                !viewer && identity.guestDisplayName && identity.guestKey
                  ? {
                      guestName: identity.guestDisplayName,
                      guestKey: identity.guestKey
                    }
                  : undefined
            }
          : {
              targetType,
              targetId,
              title,
              body,
              guest:
                !viewer && identity.guestDisplayName && identity.guestKey
                  ? {
                      guestName: identity.guestDisplayName,
                      guestKey: identity.guestKey
                    }
                  : undefined
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        return;
      }

      setTitle("");
      setBody("");
      setVisibility("PUBLIC_ONLY");
      onMutated?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2 rounded-full bg-[var(--surface-alt)] p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("comment")}
          className={`rounded-full px-4 py-2 ${mode === "comment" ? "bg-white font-semibold text-[var(--foreground)]" : "text-[var(--muted)]"}`}
        >
          {copy.writeComment}
        </button>
        <button
          type="button"
          onClick={() => setMode("question")}
          disabled={!canAskQuestion}
          className={`rounded-full px-4 py-2 ${mode === "question" ? "bg-white font-semibold text-[var(--foreground)]" : "text-[var(--muted)]"} ${!canAskQuestion ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {copy.askQuestion}
        </button>
      </div>
      <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{copy.communityGuidelines}</p>
      {viewer?.role === "admin" ? (
        <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {locale === "zh" ? "管理员可回复现有内容，但不能发布新的评论或提问。" : "Admins can reply to existing threads, but cannot publish new top-level comments or questions."}
        </p>
      ) : null}
      {viewer?.role === "teacher" ? (
        <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {locale === "zh" ? "教师可以发布评论。提问仍由学生发起。" : "Teachers can post comments here. Questions remain student-led."}
        </p>
      ) : null}
      {!viewer && identity.selectedRole !== "student" ? (
        <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {locale === "zh" ? "请选择学生身份后再发言。" : "Choose the student entry path before posting."}
        </p>
      ) : null}
      {!viewer && identity.status === "student-browser" ? (
        <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {locale === "zh" ? "你可以先选择一个游客名称，再直接评论或提问。" : "You can post without full registration. We will ask for a guest display name first."}
        </p>
      ) : null}
      <div className="mt-4 grid gap-4">
        {mode === "comment" ? (
          <>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={locale === "en" ? "Add a short title" : "填写一个简短标题"}
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
            <textarea
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={locale === "en" ? "Share your experience constructively..." : "请建设性地分享你的体验..."}
              className="rounded-3xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
            <select
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as "PUBLIC_ONLY" | "PUBLIC_AND_TEACHER")}
            >
              <option value="PUBLIC_ONLY">{copy.publicOnly}</option>
              <option value="PUBLIC_AND_TEACHER">{copy.visibleToTeacher}</option>
            </select>
          </>
        ) : (
          <>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={locale === "en" ? "What do you want to know?" : "你想了解什么？"}
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
            <textarea
              rows={5}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={locale === "en" ? "Ask a clear, specific question..." : "请清晰具体地描述问题..."}
              className="rounded-3xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </>
        )}
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting || viewer?.role === "admin" || (mode === "comment" ? !canComment : !canAskQuestion)}
          className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {mode === "comment" ? copy.writeComment : copy.askQuestion}
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
