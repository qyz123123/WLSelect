import { type ReactNode } from "react";

import { IdentityGate } from "@/components/identity-gate";
import { IdentityProvider } from "@/components/identity-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { ShellDataProvider } from "@/components/shell-data-provider";
import { ShellRightRail } from "@/components/shell-right-rail";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { ViewTracker } from "@/components/view-tracker";
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
              <ViewTracker viewerId={viewer?.id ?? null} />
              <Topbar user={viewer} unreadNotifications={unreadNotifications} />
              <div className="mx-auto grid max-w-[1560px] gap-6 px-4 pb-8 xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)_380px] lg:px-6">
                <Sidebar viewer={viewer} />
                <main className="min-w-0">{children}</main>
                <div className="min-w-0 xl:col-start-2 2xl:col-start-auto 2xl:w-[380px]">
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
