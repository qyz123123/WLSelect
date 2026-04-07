import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

import { auth } from "@/auth";
import { getAdminDashboardData, getCurrentUser, getTeachers } from "@/lib/data";
import { getFixedAdminUser } from "@/lib/fixed-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin" || !session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const [viewer, dashboard, teachers, courses, comments] = await Promise.all([
      getCurrentUser(session.user.id),
      getAdminDashboardData(),
      getTeachers(session.user.id),
      prisma.course.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          subject: true,
          system: true
        }
      }),
      prisma.comment.findMany({
        where: {
          OR: [
            { author: { is: { role: UserRole.STUDENT } } },
            { guestKey: { not: null } }
          ]
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          body: true,
          guestName: true,
          createdAt: true,
          targetType: true,
          author: {
            select: {
              studentProfile: {
                select: {
                  accountName: true
                }
              }
            }
          },
          teacherProfile: {
            select: {
              displayName: true
            }
          },
          course: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      viewer: viewer ?? getFixedAdminUser(),
      dashboard,
      teachers,
      courses,
      comments: comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
        authorName: comment.author?.studentProfile?.accountName ?? comment.guestName ?? "Guest",
        targetLabel: comment.teacherProfile?.displayName ?? comment.course?.name ?? "Unknown",
        targetType: comment.targetType === "TEACHER" ? "teacher" : "course"
      }))
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Admin dashboard request failed."
      },
      { status: 500 }
    );
  }
}
