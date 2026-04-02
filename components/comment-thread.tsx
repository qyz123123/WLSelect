"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Eye, Lock, MessageSquareText, ThumbsUp } from "lucide-react";

import { Card } from "@/components/card";
import { GuestNameDialog } from "@/components/guest-name-dialog";
import { useIdentity } from "@/components/identity-provider";
import { useLocale } from "@/components/locale-provider";
import { Comment } from "@/lib/types";

export function CommentThread({
  comments,
  onMutated,
  canReply
}: {
  comments: Comment[];
  onMutated?: () => void;
  canReply?: boolean;
}) {
  const { copy, locale } = useLocale();
  const { identity, enableGuestPosting } = useIdentity();
  const [items, setItems] = useState(comments);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [guestSuggestion, setGuestSuggestion] = useState(identity.guestDisplayName ?? "");
  const [guestLoading, setGuestLoading] = useState(false);
  const [pendingReplyCommentId, setPendingReplyCommentId] = useState<string | null>(null);
  const [pendingLikeCommentId, setPendingLikeCommentId] = useState<string | null>(null);

  useEffect(() => {
    setItems(comments);
  }, [comments]);

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
    if (!identity.guestDisplayName || !identity.guestKey) {
      return;
    }

    if (pendingReplyCommentId) {
      const commentId = pendingReplyCommentId;
      setPendingReplyCommentId(null);
      void submitReply(commentId);
    }

    if (pendingLikeCommentId) {
      const commentId = pendingLikeCommentId;
      setPendingLikeCommentId(null);
      void toggleLike(commentId);
    }
  }, [identity.guestDisplayName, identity.guestKey, pendingLikeCommentId, pendingReplyCommentId]);

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

  async function toggleLike(commentId: string) {
    const guestPayload =
      identity.selectedRole === "student" && identity.guestDisplayName && identity.guestKey
        ? {
            guestName: identity.guestDisplayName,
            guestKey: identity.guestKey
          }
        : undefined;

    if (!canReply && identity.selectedRole === "student" && !guestPayload) {
      setPendingLikeCommentId(commentId);
      setGuestDialogOpen(true);
      return;
    }

    const response = await fetch(`/api/comments/${commentId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        guest: !canReply ? guestPayload : undefined
      })
    });

    if (!response.ok) {
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === commentId
          ? {
              ...item,
              viewerHasLiked: !item.viewerHasLiked,
              likes: item.viewerHasLiked ? item.likes - 1 : item.likes + 1
            }
          : item
      )
    );
    onMutated?.();
  }

  async function submitReply(commentId: string) {
    const body = replyDrafts[commentId]?.trim();
    if (!body) {
      return;
    }

    const canGuestReply = identity.selectedRole === "student";

    if (!canReply && !canGuestReply) {
      return;
    }

    if (!canReply && (!identity.guestDisplayName || !identity.guestKey)) {
      setPendingReplyCommentId(commentId);
      setGuestDialogOpen(true);
      return;
    }

    const response = await fetch(`/api/comments/${commentId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        body,
        guest:
          !canReply && identity.guestDisplayName && identity.guestKey
            ? {
                guestName: identity.guestDisplayName,
                guestKey: identity.guestKey
              }
            : undefined
      })
    });

    if (!response.ok) {
      return;
    }

    setReplyDrafts((current) => ({ ...current, [commentId]: "" }));
    onMutated?.();
  }

  return (
    <div className="space-y-4">
      {items.map((comment) => (
        <Card key={comment.id} id={`comment-${comment.id}`} className={comment.targetHref ? "transition hover:soft-ring" : undefined}>
          {(() => {
            const normalizedTitle = comment.title.trim();
            const normalizedBody = comment.body.trim();
            const showBody = normalizedBody.length > 0 && normalizedBody !== normalizedTitle;

            return (
              <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {comment.targetHref ? (
                <Link href={comment.targetHref} className="text-sm font-semibold transition hover:text-[var(--primary)] hover:underline">
                  {comment.title}
                </Link>
              ) : (
                <div className="text-sm font-semibold">{comment.title}</div>
              )}
              <div className="mt-1 text-xs text-[var(--muted)]">
                {comment.authorName} • {new Date(comment.createdAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
              </div>
              {comment.targetHref ? (
                <div className="mt-2 text-xs text-[var(--muted)]">
                  {comment.targetLabel
                    ? `${copy.overview}: ${comment.targetLabel}`
                    : comment.targetType === "teacher"
                      ? copy.teacherPage
                      : copy.coursePage}
                </div>
              ) : null}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
              {comment.visibility === "PUBLIC_AND_TEACHER" ? <Eye className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {comment.visibility === "PUBLIC_AND_TEACHER" ? copy.visibleToTeacher : copy.publicOnly}
            </div>
          </div>
          {showBody ? <p className="mt-4 text-sm leading-6 text-[var(--foreground)]">{comment.body}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <button
              type="button"
              onClick={() => void toggleLike(comment.id)}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-alt)] px-3 py-1.5"
            >
              <ThumbsUp className="h-4 w-4" />
              {comment.likes}
            </button>
            <span className="inline-flex items-center gap-2">
              <MessageSquareText className="h-4 w-4" />
              {locale === "zh" ? `${comment.replies.length}${copy.replies}` : `${comment.replies.length} ${copy.replies}`}
            </span>
            {comment.targetHref ? (
              <Link
                href={comment.targetHref}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-sm font-medium text-[var(--primary)]"
              >
                <span>{copy.overview}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>
          {comment.replies.length > 0 ? (
            <div className="mt-4 space-y-3 rounded-3xl bg-[var(--surface-alt)] p-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="rounded-2xl bg-white px-4 py-3">
                  <div className="text-xs font-semibold text-[var(--muted)]">{reply.authorName}</div>
                  <p className="mt-2 text-sm leading-6">{reply.body}</p>
                </div>
              ))}
            </div>
          ) : null}
          {canReply || identity.selectedRole === "student" ? (
            <div className="mt-4 rounded-3xl bg-[var(--surface-alt)] p-4">
              <textarea
                rows={3}
                value={replyDrafts[comment.id] ?? ""}
                onChange={(event) =>
                  setReplyDrafts((current) => ({
                    ...current,
                    [comment.id]: event.target.value
                  }))
                }
                placeholder={copy.writeReplyPlaceholder}
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => void submitReply(comment.id)}
                  className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
                >
                  {copy.reply}
                </button>
              </div>
            </div>
          ) : null}
              </>
            );
          })()}
        </Card>
      ))}
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
