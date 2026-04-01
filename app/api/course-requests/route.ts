import { CourseSystem, GradeLevel } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  requesterName: z.string().min(2).max(80).optional(),
  requesterEmail: z.string().email().optional(),
  name: z.string().min(2).max(120),
  subject: z.string().min(2).max(80),
  system: z.enum(["AP", "AL", "GENERAL"]).optional(),
  gradeLevels: z.array(z.enum(["G9", "G10", "G11", "G12"])).min(1),
  notes: z.string().max(500).optional()
});

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid course request." }, { status: 400 });
  }

  if (!session?.user?.id && (!parsed.data.requesterEmail || !parsed.data.requesterName)) {
    return NextResponse.json({ error: "Name and email are required for external course requests." }, { status: 400 });
  }

  const duplicate = await prisma.courseRequest.findFirst({
    where: {
      name: { equals: parsed.data.name, mode: "insensitive" },
      status: "PENDING"
    },
    select: { id: true }
  });

  if (duplicate) {
    return NextResponse.json({ error: "A matching course request is already pending." }, { status: 409 });
  }

  const existingCourse = await prisma.course.findFirst({
    where: {
      OR: [
        { name: { equals: parsed.data.name, mode: "insensitive" } }
      ]
    },
    select: { id: true }
  });

  if (existingCourse) {
    return NextResponse.json({ error: "That course already exists in the official list." }, { status: 409 });
  }

  const created = await prisma.courseRequest.create({
    data: {
      requesterId: session?.user?.id ?? null,
      requesterName: parsed.data.requesterName ?? session?.user?.name ?? null,
      requesterEmail: parsed.data.requesterEmail ?? session?.user?.email ?? null,
      name: parsed.data.name,
      subject: parsed.data.subject,
      system: parsed.data.system ? (parsed.data.system as CourseSystem) : null,
      gradeLevels: parsed.data.gradeLevels as GradeLevel[],
      notes: parsed.data.notes ?? ""
    }
  });

  return NextResponse.json({ ok: true, id: created.id });
}
