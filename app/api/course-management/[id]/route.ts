import { CourseSystem, GradeLevel } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(40),
  subject: z.string().min(2).max(80),
  description: z.string().min(8).max(2000),
  prerequisites: z.string().max(200).optional(),
  system: z.enum(["AP", "AL", "GENERAL"]),
  gradeLevels: z.array(z.enum(["G9", "G10", "G11", "G12"])).min(1)
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid course payload." }, { status: 400 });
  }

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id }
  });

  const linked = teacherProfile
    ? await prisma.teacherCourse.findUnique({
        where: {
          teacherId_courseId: {
            teacherId: teacherProfile.id,
            courseId: id
          }
        }
      })
    : null;

  if (session.user.role !== "admin" && !linked) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const course = await prisma.course.update({
    where: { id },
    data: {
      name: parsed.data.name,
      code: parsed.data.code,
      subject: parsed.data.subject,
      description: parsed.data.description,
      prerequisites: parsed.data.prerequisites ?? "",
      system: parsed.data.system as CourseSystem,
      gradeLevels: parsed.data.gradeLevels as GradeLevel[]
    }
  });

  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/courses");
  revalidatePath("/teacher/dashboard");

  return NextResponse.json({ ok: true });
}
