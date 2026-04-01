import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
    getCommentsForTarget,
    getCourses,
    getCurrentUser,
    getFeedItems,
    getNotifications,
    getStudentProfile,
    getTeachers
} from "@/lib/data";

export async function GET() {
  const session = await auth();
  const currentUser = session?.user?.id ? await getCurrentUser(session.user.id) : null;
  const [teachers, courses, notifications, studentProfile, feedItems] = await Promise.all([
    getTeachers(currentUser?.id),
    getCourses(currentUser?.id),
    currentUser ? getNotifications(currentUser.id) : Promise.resolve([]),
    currentUser?.role === "student" ? getStudentProfile(currentUser.id) : Promise.resolve(null),
    getFeedItems(currentUser)
  ]);

  return NextResponse.json({
    currentUser,
    studentProfile,
    notifications,
    teachers,
    courses,
    feedItems,
    featuredTeacherComments: teachers[0] ? await getCommentsForTarget("teacher", teachers[0].id, currentUser) : [],
    featuredCourseComments: courses[0] ? await getCommentsForTarget("course", courses[0].id, currentUser) : []
  });
}
