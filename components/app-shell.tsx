import { type ReactNode } from "react";

import { IdentityGate } from "@/components/identity-gate";
import { IdentityProvider } from "@/components/identity-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { ShellDataProvider } from "@/components/shell-data-provider";
import { ShellRightRail } from "@/components/shell-right-rail";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { ViewerProvider } from "@/components/viewer-provider";
import { AppUser, Course, NotificationItem, TeacherProfile } from "@/lib/types";

export function AppShell({
  children,
  initialLocale,
  viewer,
  teachers,
  courses,
  notifications,
  unreadNotifications
}: {
  children: ReactNode;
  initialLocale: "en" | "zh";
  viewer: AppUser | null;
  teachers: TeacherProfile[];
  courses: Course[];
  notifications: NotificationItem[];
  unreadNotifications: number;
}) {
  return (
    <ViewerProvider viewer={viewer}>
      <IdentityProvider viewer={viewer}>
        <LocaleProvider initialLocale={initialLocale} persistToAccount={Boolean(viewer)}>
          <ShellDataProvider viewer={viewer} teachers={teachers} courses={courses} notifications={notifications}>
            <IdentityGate viewer={viewer}>
              <Topbar user={viewer} unreadNotifications={unreadNotifications} />
              <div className="mx-auto grid max-w-[1480px] gap-6 px-4 pb-8 xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)_320px] lg:px-6">
                <Sidebar viewer={viewer} />
                <main className="min-w-0">{children}</main>
                <div className="xl:col-span-2 2xl:col-span-1">
                  <ShellRightRail />
                </div>
              </div>
            </IdentityGate>
          </ShellDataProvider>
        </LocaleProvider>
      </IdentityProvider>
    </ViewerProvider>
  );
}
