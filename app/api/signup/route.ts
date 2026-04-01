import { hash } from "bcryptjs";
import { CourseSystem, GradeLevel, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const studentSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.literal("student"),
  name: z.string().min(2).max(50),
  language: z.enum(["en", "zh"]).default("en"),
  gradeLevel: z.enum(["G9", "G10", "G11", "G12"]).optional(),
  system: z.enum(["AP", "AL"]).optional()
});

const teacherSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.literal("teacher"),
  name: z.string().min(2).max(80),
  language: z.enum(["en", "zh"]).default("en"),
  department: z.string().max(80).optional(),
  subjectArea: z.string().max(80).optional(),
  shortBio: z.string().max(500).optional(),
  teachingStyle: z.string().max(500).optional(),
  courseIds: z.array(z.string().min(1)).min(1)
});

const signupSchema = z.discriminatedUnion("role", [studentSignupSchema, teacherSignupSchema]);

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup data." }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (exists) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const teacherCourseIds = parsed.data.role === "teacher" ? [...new Set(parsed.data.courseIds)] : [];

  if (parsed.data.role === "teacher") {
    if (teacherCourseIds.length !== parsed.data.courseIds.length) {
      return NextResponse.json({ error: "Please remove duplicate courses." }, { status: 400 });
    }

    const courses = await prisma.course.findMany({
      where: {
        id: {
          in: teacherCourseIds
        }
      },
      select: { id: true }
    });

    if (courses.length !== teacherCourseIds.length) {
      return NextResponse.json({ error: "Please choose courses from the official course list only." }, { status: 400 });
    }
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role === "teacher" ? UserRole.TEACHER : UserRole.STUDENT,
        language: parsed.data.language,
        studentProfile:
          parsed.data.role === "student"
            ? {
                create: {
                  accountName: parsed.data.name,
                  privacyNoticeAt: new Date(),
                  gradeLevel: (parsed.data.gradeLevel ?? "G11") as GradeLevel,
                  courseSystem: (parsed.data.system ?? "AP") as CourseSystem,
                  bio: "",
                  avatarUrl: null
                }
              }
            : undefined,
        teacherProfile:
          parsed.data.role === "teacher"
            ? {
                create: {
                  displayName: parsed.data.name,
                  department: parsed.data.department?.trim() || "Unassigned",
                  subjectArea: parsed.data.subjectArea?.trim() || "Unassigned",
                  shortBio: parsed.data.shortBio?.trim() ?? "",
                  teachingStyle: parsed.data.teachingStyle?.trim() ?? "",
                  avatarUrl: null,
                  courseLinks: {
                    create: teacherCourseIds.map((courseId) => ({
                      courseId
                    }))
                  }
                }
              }
            : undefined
      }
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          parsed.data.role === "student"
            ? "That account name is already in use."
            : "Unable to create the account with the submitted details."
      },
      { status: 409 }
    );
  }
}
