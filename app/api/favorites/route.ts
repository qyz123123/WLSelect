import { TargetType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildTargetKeyFromUi } from "@/lib/targets";

const schema = z.object({
  targetType: z.enum(["teacher", "course"]),
  targetId: z.string().min(1)
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid favorite payload." }, { status: 400 });
  }

  const targetKey = buildTargetKeyFromUi(parsed.data.targetType, parsed.data.targetId);
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_targetKey: {
        userId: session.user.id,
        targetKey
      }
    }
  });

  if (existing) {
    await prisma.favorite.delete({
      where: {
        userId_targetKey: {
          userId: session.user.id,
          targetKey
        }
      }
    });

    return NextResponse.json({ ok: true, active: false });
  }

  await prisma.favorite.create({
    data: {
      userId: session.user.id,
      targetType: parsed.data.targetType === "teacher" ? TargetType.TEACHER : TargetType.COURSE,
      teacherProfileId: parsed.data.targetType === "teacher" ? parsed.data.targetId : null,
      courseId: parsed.data.targetType === "course" ? parsed.data.targetId : null,
      targetKey
    }
  });

  return NextResponse.json({ ok: true, active: true });
}
