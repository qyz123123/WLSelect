import { UserRole, Visibility } from "@prisma/client";

export function isAdmin(role?: UserRole | string | null) {
  return role === "ADMIN" || role === "admin";
}

export function isTeacher(role?: UserRole | string | null) {
  return role === "TEACHER" || role === "teacher";
}

export function isStudent(role?: UserRole | string | null) {
  return role === "STUDENT" || role === "student";
}

export function canTeacherViewComment(
  visibility: Visibility,
  viewerUserId: string | null,
  teacherUserId: string | null,
  authorId: string
) {
  if (visibility === "PUBLIC_ONLY") {
    return true;
  }

  return viewerUserId === authorId || viewerUserId === teacherUserId;
}
