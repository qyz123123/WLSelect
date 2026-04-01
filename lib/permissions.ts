import { AppUser, Comment, Question, Role } from "@/lib/types";

export const permissions: Record<Role, string[]> = {
  student: [
    "profile:update:self",
    "comment:create",
    "comment:update:self",
    "question:create",
    "question:update:self",
    "favorite:create",
    "rating:create"
  ],
  teacher: [
    "profile:update:self",
    "course:update:assigned",
    "comment:view:teacher-visible",
    "question:reply",
    "rating:create:self"
  ],
  admin: [
    "user:manage",
    "teacher:verify",
    "course:manage",
    "moderation:manage",
    "labels:manage"
  ]
};

export function canViewTeacherVisibleComment(
  user: AppUser,
  comment: Comment,
  teacherUserId?: string
) {
  if (comment.visibility === "PUBLIC_ONLY") {
    return true;
  }

  if (user.role === "admin") {
    return true;
  }

  return user.id === teacherUserId || user.id === comment.authorId;
}

export function canEditQuestion(user: AppUser, question: Question) {
  return user.role === "admin" || user.id === question.authorId;
}
