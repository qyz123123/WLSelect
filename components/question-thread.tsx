"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, BadgeCheck, CircleHelp, ThumbsUp } from "lucide-react";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";
import { Question } from "@/lib/types";

export function QuestionThread({
  questions,
  onMutated,
  canReply
}: {
  questions: Question[];
  onMutated?: () => void;
  canReply?: boolean;
}) {
  const { copy, locale } = useLocale();
  const [items, setItems] = useState(questions);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setItems(questions);
  }, [questions]);

  async function toggleLike(questionId: string) {
    const response = await fetch(`/api/questions/${questionId}/like`, {
      method: "POST"
    });

    if (!response.ok) {
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === questionId
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

  async function submitReply(questionId: string) {
    const body = replyDrafts[questionId]?.trim();
    if (!body) {
      return;
    }

    const response = await fetch(`/api/questions/${questionId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ body })
    });

    if (!response.ok) {
      return;
    }

    setReplyDrafts((current) => ({ ...current, [questionId]: "" }));
    onMutated?.();
  }

  return (
    <div className="space-y-4">
      {items.map((question) => (
        <Card key={question.id} id={`question-${question.id}`} className={question.targetHref ? "transition hover:soft-ring" : undefined}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {question.targetHref ? (
                <Link href={question.targetHref} className="text-sm font-semibold transition hover:text-[var(--primary)] hover:underline">
                  {question.title}
                </Link>
              ) : (
                <h3 className="text-sm font-semibold">{question.title}</h3>
              )}
              <div className="mt-1 text-xs text-[var(--muted)]">
                {question.authorName} • {new Date(question.createdAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
              </div>
              {question.targetHref ? (
                <div className="mt-2 text-xs text-[var(--muted)]">
                  {question.targetLabel
                    ? `${copy.overview}: ${question.targetLabel}`
                    : question.targetType === "teacher"
                      ? copy.teacherPage
                      : copy.coursePage}
                </div>
              ) : null}
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                question.answered ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {question.answered ? <BadgeCheck className="h-3.5 w-3.5" /> : <CircleHelp className="h-3.5 w-3.5" />}
              {question.answered ? copy.answered : copy.unanswered}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6">{question.body}</p>
          <div className="mt-4 flex items-center gap-3 text-sm text-[var(--muted)]">
            <button
              type="button"
              onClick={() => void toggleLike(question.id)}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-alt)] px-3 py-1.5"
            >
              <ThumbsUp className="h-4 w-4" />
              {question.likes}
            </button>
            <span>{locale === "zh" ? `${question.replies.length}${copy.answers}` : `${question.replies.length} ${copy.answers}`}</span>
            {question.targetHref ? (
              <Link
                href={question.targetHref}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-sm font-medium text-[var(--primary)]"
              >
                <span>{copy.overview}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>
          {question.replies.length > 0 ? (
            <div className="mt-4 space-y-3 rounded-3xl bg-[var(--surface-alt)] p-4">
              {question.replies.map((reply) => (
                <div key={reply.id} className="rounded-2xl bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-[var(--muted)]">{reply.authorName}</div>
                    {reply.accepted ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        {copy.accepted}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-6">{reply.body}</p>
                </div>
              ))}
            </div>
          ) : null}
          {canReply ? (
            <div className="mt-4 rounded-3xl bg-[var(--surface-alt)] p-4">
              <textarea
                rows={3}
                value={replyDrafts[question.id] ?? ""}
                onChange={(event) =>
                  setReplyDrafts((current) => ({
                    ...current,
                    [question.id]: event.target.value
                  }))
                }
                placeholder={copy.writeAnswerPlaceholder}
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => void submitReply(question.id)}
                  className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
                >
                  {copy.answer}
                </button>
              </div>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
