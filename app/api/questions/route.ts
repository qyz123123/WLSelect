import { TargetType } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { ensureGuestNameAvailable, guestIdentitySchema } from "@/lib/guest";
import { prisma } from "@/lib/prisma";
import { getTargetDetailPath } from "@/lib/route-paths";

const schema = z.object({
  targetType: z.enum(["teacher", "course"]),
  targetId: z.string().min(1),
  title: z.string().min(4).max(160),
  body: z.string().min(8).max(4000),
  guest: guestIdentitySchema.optional()
});

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid question payload." }, { status: 400 });
  }

  const isAuthenticatedStudent = session?.user?.id && session.user.role === "student";
  const isGuestStudent = !session?.user?.id && Boolean(parsed.data.guest);

  if (!isAuthenticatedStudent && !isGuestStudent) {
    return NextResponse.json({ error: "Only students can ask questions." }, { status: 403 });
  }

  if (isGuestStudent && parsed.data.guest) {
    try {
      await ensureGuestNameAvailable(parsed.data.guest.guestName);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid guest name." }, { status: 409 });
    }
  }

  const question = await prisma.question.create({
    data: {
      authorId: isAuthenticatedStudent ? session!.user.id : null,
      guestName: isGuestStudent ? parsed.data.guest!.guestName : null,
      guestKey: isGuestStudent ? parsed.data.guest!.guestKey : null,
      targetType: parsed.data.targetType === "teacher" ? TargetType.TEACHER : TargetType.COURSE,
      teacherProfileId: parsed.data.targetType === "teacher" ? parsed.data.targetId : null,
      courseId: parsed.data.targetType === "course" ? parsed.data.targetId : null,
      title: parsed.data.title,
      body: parsed.data.body
    }
  });

  revalidatePath("/");
  const detailPath = await getTargetDetailPath({
    targetType: parsed.data.targetType === "teacher" ? TargetType.TEACHER : TargetType.COURSE,
    teacherProfileId: parsed.data.targetType === "teacher" ? parsed.data.targetId : null,
    courseId: parsed.data.targetType === "course" ? parsed.data.targetId : null
  });
  if (detailPath) {
    revalidatePath(detailPath);
  }
  if (isAuthenticatedStudent) {
    revalidatePath("/me/questions");
  }

  return NextResponse.json({ ok: true, id: question.id });
}
