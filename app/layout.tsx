import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { getCourses, getCurrentUser, getNotifications, getTeachers } from "@/lib/data";
import { readGuestKeyFromCookie } from "@/lib/identity-cookie-server";
import { defaultLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "WLSelect",
  description: "School community platform for exploring teachers."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();
  const viewer = session?.user?.id ? await getCurrentUser(session.user.id) : null;
  const guestKey = viewer ? undefined : await readGuestKeyFromCookie();
  const [teachers, courses, notifications] = await Promise.all([
    getTeachers(viewer?.id, guestKey),
    getCourses(viewer?.id, guestKey),
    viewer ? getNotifications(viewer.id) : Promise.resolve([])
  ]);

  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        <AppShell
          initialLocale={viewer?.language ?? defaultLocale}
          viewer={viewer}
          teachers={teachers}
          courses={courses}
          notifications={notifications}
          unreadNotifications={notifications.filter((notification) => !notification.read).length}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
