import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getNotifications, getStudentProfile, getTeacherById, getUserComments, getUserQuestions, getCurrentUser } from "@/lib/data";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({
      user: null,
      profile: null,
      teacherProfile: null,
      notifications: [],
      comments: [],
      questions: []
    });
  }

  const user = await getCurrentUser(session.user.id);
  const [profile, notifications, comments, questions, teacherProfile] = await Promise.all([
    getStudentProfile(session.user.id),
    getNotifications(session.user.id),
    getUserComments(session.user.id),
    getUserQuestions(session.user.id),
    user?.teacherProfileId ? getTeacherById(user.teacherProfileId, user.id) : Promise.resolve(null)
  ]);

  return NextResponse.json({
    user,
    profile,
    teacherProfile,
    notifications,
    comments,
    questions
  });
}
