"use client";

import Link from "next/link";
import { BellRing, CheckCheck } from "lucide-react";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { NotificationItem } from "@/lib/types";

export default function NotificationsPage() {
  const { copy, locale } = useLocale();
  const { data, loading, error, setData } = useApiData<{
    items: NotificationItem[];
    unreadCount: number;
  }>("/api/notifications");

  async function markAllAsRead() {
    const response = await fetch("/api/notifications", {
      method: "POST"
    });

    if (!response.ok || !data) {
      return;
    }

    setData({
      unreadCount: 0,
      items: data.items.map((item) => ({ ...item, read: true }))
    });
  }

  async function markOneAsRead(notificationId: string) {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: "POST"
    });

    if (!response.ok || !data) {
      return;
    }

    const wasUnread = data.items.find((item) => item.id === notificationId && !item.read);

    setData({
      unreadCount: wasUnread ? Math.max(0, data.unreadCount - 1) : data.unreadCount,
      items: data.items.map((item) => (item.id === notificationId ? { ...item, read: true } : item))
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading
          title={copy.notifications}
          description={
            locale === "en"
              ? "Stay updated on replies, reminders, and important activity."
              : "查看回复、提醒和重要动态。"
          }
          action={
            data && data.items.length > 0 ? (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
              >
                <CheckCheck className="h-4 w-4" />
                {locale === "en" ? "Mark all as read" : "全部标为已读"}
              </button>
            ) : null
          }
        />
        <div className="flex items-center gap-3 rounded-3xl bg-[var(--surface-alt)] px-4 py-4">
          <BellRing className="h-5 w-5 text-[var(--primary)]" />
          <div className="text-sm text-[var(--muted)]">
            {loading
              ? locale === "en"
                ? "Loading notifications..."
                : "正在加载通知..."
              : locale === "en"
                ? `${data?.unreadCount ?? 0} unread notifications`
                : `${data?.unreadCount ?? 0} 条未读通知`}
          </div>
        </div>
      </Card>

      {error ? <Card>{error}</Card> : null}

      {data && data.items.length === 0 ? (
        <Card>
          <div className="text-sm text-[var(--muted)]">
            {locale === "en" ? "You have no notifications yet." : "你暂时还没有通知。"}
          </div>
        </Card>
      ) : null}

      <div className="space-y-4">
        {data?.items.map((notification) => (
          <Card key={notification.id} className={notification.read ? "" : "soft-ring"}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-base font-semibold">{notification.title}</div>
                  {!notification.read ? <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" /> : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{notification.body}</p>
              </div>
              {!notification.read ? (
                <button
                  type="button"
                  onClick={() => void markOneAsRead(notification.id)}
                  className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-medium"
                >
                  {locale === "en" ? "Mark read" : "标为已读"}
                </button>
              ) : null}
            </div>
            <div className="mt-4">
              <Link
                href={notification.href}
                onClick={() => {
                  if (!notification.read) {
                    void markOneAsRead(notification.id);
                  }
                }}
                className="inline-flex rounded-full bg-[var(--primary-soft)] px-4 py-2 text-sm font-semibold text-[var(--primary)]"
              >
                {locale === "en" ? "Open" : "打开"}
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
