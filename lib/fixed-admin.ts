import { AppUser } from "@/lib/types";

export const FIXED_ADMIN_ID = "fixed-admin";
export const FIXED_ADMIN_EMAIL = process.env.FIXED_ADMIN_EMAIL ?? "admin@wlselect.org";
export const FIXED_ADMIN_PASSWORD = process.env.FIXED_ADMIN_PASSWORD ?? "watchpornhubeveryday";

export function isFixedAdminId(userId: string) {
  return userId === FIXED_ADMIN_ID;
}

export function getFixedAdminUser(): AppUser {
  return {
    id: FIXED_ADMIN_ID,
    email: FIXED_ADMIN_EMAIL,
    role: "admin",
    language: "zh",
    name: "Admin",
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent("Admin")}`,
    teacherVerified: false
  };
}
