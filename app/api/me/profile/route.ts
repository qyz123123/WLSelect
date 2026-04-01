import { CourseSystem, GradeLevel, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const studentSchema = z.object({
  role: z.literal("student"),
  accountName: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
  gradeLevel: z.enum(["G9", "G10", "G11", "G12"]),
  system: z.enum(["AP", "AL", "GENERAL"]),
  coursesByGrade: z.record(z.enum(["G9", "G10", "G11", "G12"]), z.array(z.string()))
});

const teacherSchema = z.object({
  role: z.literal("teacher"),
  displayName: z.string().min(2).max(80),
  department: z.string().min(2).max(80),
  subjectArea: z.string().min(2).max(80),
  shortBio: z.string().max(500).optional(),
  teachingStyle: z.string().max(500).optional()
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const raw = await request.json();

  if (raw.role === "student") {
    const parsed = studentSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid student profile payload." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { studentProfile: true }
    });

    if (!user || user.role !== UserRole.STUDENT || !user.studentProfile) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    await prisma.studentProfile.update({
      where: { userId: session.user.id },
      data: {
        accountName: parsed.data.accountName,
        bio: parsed.data.bio ?? "",
        gradeLevel: parsed.data.gradeLevel as GradeLevel,
        courseSystem: parsed.data.system as CourseSystem
      }
    });

    await prisma.studentCourseRecord.deleteMany({
      where: { profileId: user.studentProfile.id }
    });

    const allCourseNames = Object.values(parsed.data.coursesByGrade).flat();
    const courseRecords = await prisma.course.findMany({
      where: {
        name: {
          in: allCourseNames
        }
      },
      select: { id: true, name: true }
    });
    const courseIdByName = new Map(courseRecords.map((course) => [course.name, course.id]));

    await prisma.studentCourseRecord.createMany({
      data: Object.entries(parsed.data.coursesByGrade).flatMap(([grade, courses]) =>
        courses
          .map((courseName) => courseIdByName.get(courseName))
          .filter(Boolean)
          .map((courseId) => ({
            profileId: user.studentProfile!.id,
            courseId: courseId as string,
            gradeLevel: grade as GradeLevel
          }))
      )
    });
  } else {
    const parsed = teacherSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid teacher profile payload." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { teacherProfile: true }
    });

    if (!user || user.role !== UserRole.TEACHER || !user.teacherProfile) {
      return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
    }

    await prisma.teacherProfile.update({
      where: { userId: session.user.id },
      data: {
        displayName: parsed.data.displayName,
        department: parsed.data.department,
        subjectArea: parsed.data.subjectArea,
        shortBio: parsed.data.shortBio ?? "",
        teachingStyle: parsed.data.teachingStyle ?? ""
      }
    });
  }

  revalidatePath("/me/profile");
  revalidatePath("/");
  revalidatePath("/teachers");
  revalidatePath("/teacher/dashboard");

  return NextResponse.json({ ok: true });
}
