"use client";

import { type ComponentType } from "react";
import { ShieldCheck, User, UserRoundCog } from "lucide-react";

import { useLocale } from "@/components/locale-provider";
import { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const iconMap: Record<Role, ComponentType<{ className?: string }>> = {
  student: User,
  teacher: ShieldCheck,
  admin: UserRoundCog
};

export function RoleBadge({ role, verified }: { role: Role; verified?: boolean }) {
  const { copy } = useLocale();
  const Icon = iconMap[role];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        role === "student" && "bg-slate-100 text-slate-700",
        role === "teacher" && "bg-sky-100 text-sky-800",
        role === "admin" && "bg-amber-100 text-amber-800"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {role === "student" ? copy.student : role === "teacher" ? copy.teacher : copy.admin}
      {verified ? " • Verified" : ""}
    </span>
  );
}
