import { CourseSystem, GradeLevel } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  slug: z.string().min(2).max(120),
  code: z.string().min(2).max(40),
  name: z.string().min(2).max(120),
  subject: z.string().min(2).max(80),
  description: z.string().min(8).max(2000),
  prerequisites: z.string().max(200).optional(),
  system: z.enum(["AP", "AL", "GENERAL"]),
  gradeLevels: z.array(z.enum(["G9", "G10", "G11", "G12"])).min(1)
});

export async function POST(request: Request) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid course payload." }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: {
      slug: parsed.data.slug,
      code: parsed.data.code,
      name: parsed.data.name,
      subject: parsed.data.subject,
      description: parsed.data.description,
      prerequisites: parsed.data.prerequisites ?? "",
      system: parsed.data.system as CourseSystem,
      gradeLevels: parsed.data.gradeLevels as GradeLevel[]
    }
  });

  revalidatePath("/admin");
  revalidatePath("/courses");

  return NextResponse.json({ ok: true, id: course.id });
}
