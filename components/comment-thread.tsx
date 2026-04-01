"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Eye, Lock, MessageSquareText, ThumbsUp } from "lucide-react";

import { Card } from "@/components/card";
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
  const [items, setItems] = useState(comments);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setItems(comments);
  }, [comments]);

  async function toggleLike(commentId: string) {
    const response = await fetch(`/api/comments/${commentId}/like`, {
      method: "POST"
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

    const response = await fetch(`/api/comments/${commentId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ body })
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
                {comment.authorName} • {new Date(comment.createdAt).toLocaleDateString()}
              </div>
              {comment.targetHref ? (
                <div className="mt-2 text-xs text-[var(--muted)]">
                  {comment.targetLabel
                    ? `${copy.overview}: ${comment.targetLabel}`
                    : comment.targetType === "teacher"
                      ? locale === "zh"
                        ? "教师页面"
                        : "Teacher page"
                      : locale === "zh"
                        ? "课程页面"
                        : "Course page"}
                </div>
              ) : null}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
              {comment.visibility === "PUBLIC_AND_TEACHER" ? <Eye className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {comment.visibility === "PUBLIC_AND_TEACHER" ? copy.visibleToTeacher : copy.publicOnly}
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--foreground)]">{comment.body}</p>
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
              {comment.replies.length} replies
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
          {canReply ? (
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
                placeholder="Write a reply..."
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => void submitReply(comment.id)}
                  className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
                >
                  Reply
                </button>
              </div>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
