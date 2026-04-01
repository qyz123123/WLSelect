"use client";

import { useEffect } from "react";

import { useIdentity } from "@/components/identity-provider";
import { RoleLoginCard } from "@/components/role-login-card";
import { useLocale } from "@/components/locale-provider";

export default function TeacherLoginPage() {
  const { locale } = useLocale();
  const { selectTeacher } = useIdentity();

  useEffect(() => {
    selectTeacher();
  }, [selectTeacher]);

  return (
    <div className="mx-auto max-w-xl py-8">
      <RoleLoginCard
        role="teacher"
        title={locale === "zh" ? "教师登录" : "Teacher login"}
        description={
          locale === "zh"
            ? "教师必须先使用邮箱登录后才能进入 WLSelect，并管理授课课程与资料。"
            : "Teachers must sign in with email before entering WLSelect and managing taught courses or profile reminders."
        }
        signupHref="/teacher/register"
        callbackUrl="/teacher/dashboard"
      />
    </div>
  );
}
