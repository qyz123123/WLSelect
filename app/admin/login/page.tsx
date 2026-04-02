"use client";

import { RoleLoginCard } from "@/components/role-login-card";
import { useLocale } from "@/components/locale-provider";

export default function AdminLoginPage() {
  const { locale } = useLocale();

  return (
    <div className="mx-auto max-w-xl py-8">
      <RoleLoginCard
        role="admin"
        title={locale === "zh" ? "管理员登录" : "Admin login"}
        description={locale === "zh" ? "管理员可直接通过邮箱登录。" : "Admins can log in directly with email and password."}
      />
    </div>
  );
}
