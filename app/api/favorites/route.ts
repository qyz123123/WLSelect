import { TargetType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { guestIdentitySchema } from "@/lib/guest";
import { prisma } from "@/lib/prisma";
import { buildTargetKeyFromUi } from "@/lib/targets";

const schema = z.object({
  targetType: z.enum(["teacher", "course"]),
  targetId: z.string().min(1),
  guest: guestIdentitySchema.optional()
});

export async function POST(request: Request) {
  const session = await auth();

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid favorite payload." }, { status: 400 });
  }

  const userId = session?.user?.id ?? null;
  const guestKey = userId ? null : parsed.data.guest?.guestKey ?? null;

  if (!userId && !guestKey) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const targetKey = buildTargetKeyFromUi(parsed.data.targetType, parsed.data.targetId);
  const existing = await prisma.favorite.findFirst({
    where: userId
      ? {
          userId,
          targetKey
        }
      : {
          guestKey: guestKey!,
          targetKey
        }
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id }
    });

    return NextResponse.json({ ok: true, active: false });
  }

  await prisma.favorite.create({
    data: {
      userId: userId ?? undefined,
      guestKey: guestKey ?? undefined,
      targetType: parsed.data.targetType === "teacher" ? TargetType.TEACHER : TargetType.COURSE,
      teacherProfileId: parsed.data.targetType === "teacher" ? parsed.data.targetId : null,
      courseId: parsed.data.targetType === "course" ? parsed.data.targetId : null,
      targetKey
    }
  });

  return NextResponse.json({ ok: true, active: true });
}
