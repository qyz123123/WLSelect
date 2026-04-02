"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { usePathname } from "next/navigation";

import { GuestNameDialog } from "@/components/guest-name-dialog";
import { useIdentity } from "@/components/identity-provider";
import { useLocale } from "@/components/locale-provider";
import { RoleBadge } from "@/components/role-badge";
import { summarizeRatings } from "@/lib/analytics";
import { AppUser, Course, NotificationItem, TeacherProfile } from "@/lib/types";

export function RightRail({
  teachers,
  courses,
  notifications,
  user
}: {
  teachers: TeacherProfile[];
  courses: Course[];
  notifications: NotificationItem[];
  user: AppUser | null;
}) {
  const { copy, locale } = useLocale();
  const { identity, enableGuestPosting } = useIdentity();
  const pathname = usePathname();
  const showGuestHomeCard = !user && pathname === "/";
  const [teacherItems, setTeacherItems] = useState(teachers);
  const [courseItems, setCourseItems] = useState(courses);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [guestSuggestion, setGuestSuggestion] = useState(identity.guestDisplayName ?? "");
  const [guestLoading, setGuestLoading] = useState(false);
  const [pendingFavorite, setPendingFavorite] = useState<{ targetType: "teacher" | "course"; targetId: string } | null>(null);

  useEffect(() => {
    setTeacherItems(teachers);
  }, [teachers]);

  useEffect(() => {
    setCourseItems(courses);
  }, [courses]);

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
    if (!pendingFavorite || !identity.guestDisplayName || !identity.guestKey) {
      return;
    }

    const nextPending = pendingFavorite;
    setPendingFavorite(null);
    void toggleFavorite(nextPending.targetType, nextPending.targetId);
  }, [identity.guestDisplayName, identity.guestKey, pendingFavorite]);

  const trendingCourses = useMemo(
    () =>
      [...courseItems]
        .map((course) => {
          const ratingSummary = summarizeRatings(course.ratings);
          const score = Number((course.stars * 2 + ratingSummary.average * 20).toFixed(1));

          return {
            ...course,
            trendScore: score,
            overallScore: ratingSummary.average
          };
        })
        .sort((a, b) => b.trendScore - a.trendScore || b.stars - a.stars || a.name.localeCompare(b.name))
        .slice(0, 5),
    [courseItems]
  );
  const trendingTeachers = useMemo(
    () =>
      [...teacherItems]
        .map((teacher) => {
          const ratingSummary = summarizeRatings(teacher.ratings);
          const score = Number((teacher.stars * 2 + ratingSummary.average * 20).toFixed(1));

          return {
            ...teacher,
            trendScore: score,
            overallScore: ratingSummary.average
          };
        })
        .sort((a, b) => b.trendScore - a.trendScore || b.stars - a.stars || a.name.localeCompare(b.name))
        .slice(0, 5),
    [teacherItems]
  );
  const formatScore = (score: number) => (score > 0 ? (Number.isInteger(score) ? score.toFixed(0) : score.toFixed(1)) : "—");

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

  async function toggleFavorite(targetType: "teacher" | "course", targetId: string) {
    const guestPayload =
      identity.selectedRole === "student" && identity.guestDisplayName && identity.guestKey
        ? {
            guestName: identity.guestDisplayName,
            guestKey: identity.guestKey
          }
        : undefined;

    if (!user && identity.selectedRole !== "student") {
      return;
    }

    if (!user && !guestPayload) {
      setPendingFavorite({ targetType, targetId });
      setGuestDialogOpen(true);
      return;
    }

    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        targetType,
        targetId,
        guest: !user ? guestPayload : undefined
      })
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { active: boolean };

    if (targetType === "teacher") {
      setTeacherItems((current) =>
        current.map((teacher) =>
          teacher.id === targetId
            ? {
                ...teacher,
                isFavorite: payload.active,
                stars: Math.max(0, teacher.stars + (payload.active ? 1 : -1))
              }
            : teacher
        )
      );
      return;
    }

    setCourseItems((current) =>
      current.map((course) =>
        course.id === targetId
          ? {
              ...course,
              isFavorite: payload.active,
              stars: Math.max(0, course.stars + (payload.active ? 1 : -1))
            }
          : course
      )
    );
  }

  return (
    <div className="hidden space-y-4 2xl:block">
      <section className="card-surface rounded-[28px] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{copy.trending}</h2>
          <span className="text-xs text-[var(--muted)]">{copy.starred}</span>
        </div>
        <p className="mb-4 text-xs leading-5 text-[var(--muted)]">
          {locale === "zh"
            ? "老师和课程都按综合评分与星标数排序。"
            : "Teachers and courses are both ranked by comprehensive score and stars."}
        </p>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-[var(--muted)]">学生榜</div>
            {trendingCourses.map((course) => (
              <div key={course.id} className="rounded-2xl bg-[var(--surface-alt)] px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/courses/${course.slug}`} className="min-w-0 truncate text-sm font-semibold">
                    {course.name}
                  </Link>
                  <div className="shrink-0 text-xs text-[var(--muted)]">
                    <button
                      type="button"
                      onClick={() => void toggleFavorite("course", course.id)}
                      className="inline-flex items-center gap-1 text-amber-600"
                      aria-label={course.isFavorite ? `Unsave ${course.name}` : `Save ${course.name}`}
                    >
                      <Star className="h-3.5 w-3.5" fill={course.isFavorite ? "currentColor" : "none"} />
                      {course.stars}
                    </button>
                    <span className="mx-1.5">•</span>
                    <span>{locale === "zh" ? copy.overallScore : copy.overallScore}: {formatScore(course.overallScore)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-1">
            <div className="text-sm font-semibold text-[var(--muted)]">老师榜</div>
            {trendingTeachers.map((teacher) => (
              <div key={teacher.id} className="rounded-2xl bg-[var(--surface-alt)] px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/teachers/${teacher.id}`} className="flex min-w-0 items-center gap-3">
                    <img src={teacher.avatar} alt={teacher.name} className="h-9 w-9 rounded-full object-cover" />
                    <div className="min-w-0 truncate text-sm font-semibold">{teacher.name}</div>
                  </Link>
                  <div className="shrink-0 text-xs text-[var(--muted)]">
                    <button
                      type="button"
                      onClick={() => void toggleFavorite("teacher", teacher.id)}
                      className="inline-flex items-center gap-1 text-amber-600"
                      aria-label={teacher.isFavorite ? `Unsave ${teacher.name}` : `Save ${teacher.name}`}
                    >
                      <Star className="h-3.5 w-3.5" fill={teacher.isFavorite ? "currentColor" : "none"} />
                      {teacher.stars}
                    </button>
                    <span className="mx-1.5">•</span>
                    <span>{locale === "zh" ? copy.overallScore : copy.overallScore}: {formatScore(teacher.overallScore)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {showGuestHomeCard ? (
        <section className="card-surface rounded-[28px] p-5">
          <div className="text-sm font-semibold text-[var(--foreground)]">{copy.joinCommunity}</div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{copy.privacyWarning}</p>
          <div className="mt-5 flex gap-3">
            <Link href="/signup" className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
              {copy.signUp}
            </Link>
            <Link href="/login" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
              {copy.logIn}
            </Link>
          </div>
        </section>
      ) : null}
      {user ? (
        <section className="card-surface rounded-[28px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">{copy.notifications}</h2>
            <RoleBadge role={user.role} verified={user.teacherVerified} />
          </div>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.href}
                className="block rounded-2xl border border-[var(--border)] px-3 py-3"
              >
                <div className="text-sm font-semibold">{notification.title}</div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{notification.body}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <GuestNameDialog
        open={guestDialogOpen}
        loading={guestLoading}
        initialValue={identity.guestDisplayName ?? guestSuggestion}
        onClose={() => {
          setPendingFavorite(null);
          setGuestDialogOpen(false);
        }}
        onConfirm={saveGuestIdentity}
      />
    </div>
  );
}
