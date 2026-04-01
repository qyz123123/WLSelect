"use client";

import { useEffect } from "react";

import { useIdentity } from "@/components/identity-provider";
import { RoleLoginCard } from "@/components/role-login-card";
import { useLocale } from "@/components/locale-provider";

export default function StudentLoginPage() {
  const { locale } = useLocale();
  const { selectStudent } = useIdentity();

  useEffect(() => {
    selectStudent();
  }, [selectStudent]);

  return (
    <div className="mx-auto max-w-xl py-8">
      <RoleLoginCard
        role="student"
        title={locale === "zh" ? "学生登录" : "Student login"}
        description={
          locale === "zh"
            ? "登录后可保存收藏、同步语言偏好，并在所有设备上保留你的互动记录。"
            : "Sign in to keep saved items, sync language preference, and preserve your activity across devices."
        }
        signupHref="/student/register"
        callbackUrl="/"
      />
    </div>
  );
}
