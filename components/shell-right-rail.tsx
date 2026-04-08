"use client";

import { usePathname } from "next/navigation";

import { RightRail } from "@/components/right-rail";
import { useShellData } from "@/components/shell-data-provider";

export function ShellRightRail() {
  const pathname = usePathname();
  const { viewer, teachers, courses, notifications } = useShellData();
  const variant = pathname === "/" ? "no-trending" : "full";

  return (
    <div className={pathname === "/" ? "hidden xl:block 2xl:w-full" : "block 2xl:w-full"}>
      <RightRail teachers={teachers} courses={courses} notifications={notifications} user={viewer} variant={variant} />
    </div>
  );
}
