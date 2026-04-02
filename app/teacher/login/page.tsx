"use client";

import { useEffect } from "react";

import { useIdentity } from "@/components/identity-provider";
import { RoleLoginCard } from "@/components/role-login-card";
import { useLocale } from "@/components/locale-provider";
import { useViewer } from "@/components/viewer-provider";

export default function TeacherLoginPage() {
  const { locale } = useLocale();
  const viewer = useViewer();
  const { selectTeacher } = useIdentity();

  useEffect(() => {
    if (!viewer) {
      selectTeacher();
    }
  }, [selectTeacher, viewer]);

  return (
    <div className="mx-auto max-w-xl py-8">
      <RoleLoginCard
        role="teacher"
        title={locale === "zh" ? "教师登录" : "Teacher login"}
        description={
          locale === "zh"
            ? "教师现在可直接通过姓名登录，无需密码。"
            : "Teachers can now sign in directly with their name, with no password required."
        }
        signupHref="/teacher/register"
        callbackUrl="/teacher/dashboard"
      />
    </div>
  );
}
