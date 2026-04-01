import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { getCourses, getCurrentUser, getNotifications, getTeachers } from "@/lib/data";
import { defaultLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "WLSelect",
  description: "School community platform for exploring teachers and courses."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();
  const viewer = session?.user?.id ? await getCurrentUser(session.user.id) : null;
  const [teachers, courses, notifications] = await Promise.all([
    getTeachers(viewer?.id),
    getCourses(viewer?.id),
    viewer ? getNotifications(viewer.id) : Promise.resolve([])
  ]);

  return (
    <html lang="en">
      <body>
        <AppShell
          initialLocale={viewer?.language ?? defaultLocale}
          viewer={viewer}
          teachers={teachers.slice(0, 2)}
          courses={courses.slice(0, 3)}
          notifications={notifications}
          unreadNotifications={notifications.filter((notification) => !notification.read).length}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
