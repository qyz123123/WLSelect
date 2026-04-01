"use client";

import Link from "next/link";

import { useLocale } from "@/components/locale-provider";
import { RoleBadge } from "@/components/role-badge";
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
  const { copy } = useLocale();

  return (
    <div className="hidden space-y-4 2xl:block">
      <section className="card-surface rounded-[28px] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{copy.trending}</h2>
          <span className="text-xs text-[var(--muted)]">{copy.starred}</span>
        </div>
        <div className="space-y-3">
          {teachers.map((teacher) => (
            <Link key={teacher.id} href={`/teachers/${teacher.id}`} className="block rounded-2xl bg-[var(--surface-alt)] p-3">
              <div className="flex items-center gap-3">
                <img src={teacher.avatar} alt={teacher.name} className="h-11 w-11 rounded-2xl object-cover" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{teacher.name}</div>
                  <div className="text-xs text-[var(--muted)]">{teacher.subjectArea}</div>
                </div>
              </div>
            </Link>
          ))}
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.slug}`} className="block rounded-2xl border border-[var(--border)] px-3 py-2.5">
              <div className="text-sm font-semibold">{course.name}</div>
              <div className="mt-1 text-xs text-[var(--muted)]">
                {course.code} • {course.subject}
              </div>
            </Link>
          ))}
        </div>
      </section>
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
    </div>
  );
}
