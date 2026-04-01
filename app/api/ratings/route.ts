import { TargetType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { ensureGuestNameAvailable, guestIdentitySchema } from "@/lib/guest";
import { prisma } from "@/lib/prisma";
import { getTargetDetailPath } from "@/lib/route-paths";
import { buildTargetKeyFromUi } from "@/lib/targets";

const schema = z.object({
  targetType: z.enum(["teacher", "course"]),
  targetId: z.string().min(1),
  dimension: z.string().min(1),
  score: z.number().int().min(1).max(5),
  guest: guestIdentitySchema.optional()
});

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role === "admin") {
    return NextResponse.json({ error: "Admins cannot submit ratings." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid rating payload." }, { status: 400 });
  }

  const targetType = parsed.data.targetType === "teacher" ? TargetType.TEACHER : TargetType.COURSE;
  const targetKey = buildTargetKeyFromUi(parsed.data.targetType, parsed.data.targetId);
  const isTeacherSelf = session?.user?.role === "teacher";
  const isAuthenticatedStudent = session?.user?.id && session.user.role === "student";
  const isGuestStudent = !session?.user?.id && parsed.data.targetType === "course" && Boolean(parsed.data.guest);

  if (!session?.user?.id && !isGuestStudent) {
    return NextResponse.json({ error: "Student login or guest mode is required to rate." }, { status: 401 });
  }

  if (parsed.data.targetType === "teacher" && isGuestStudent) {
    return NextResponse.json({ error: "Guest ratings are available on course pages only." }, { status: 403 });
  }

  if (isGuestStudent && parsed.data.guest) {
    try {
      await ensureGuestNameAvailable(parsed.data.guest.guestName);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid guest name." }, { status: 409 });
    }
  }

  const authorId = session?.user?.id ?? null;
  const guestKey = isGuestStudent ? parsed.data.guest!.guestKey : null;

  const rating = await prisma.rating.upsert({
    where:
      authorId
        ? {
            authorId_targetKey_dimension_isTeacherSelf: {
              authorId,
              targetKey,
              dimension: parsed.data.dimension,
              isTeacherSelf
            }
          }
        : {
            guestKey_targetKey_dimension_isTeacherSelf: {
              guestKey: guestKey!,
              targetKey,
              dimension: parsed.data.dimension,
              isTeacherSelf: false
            }
          },
    update: {
      score: parsed.data.score,
      commentId: null
    },
    create: {
      authorId,
      guestKey,
      targetType,
      teacherProfileId: parsed.data.targetType === "teacher" ? parsed.data.targetId : null,
      courseId: parsed.data.targetType === "course" ? parsed.data.targetId : null,
      targetKey,
      dimension: parsed.data.dimension,
      score: parsed.data.score,
      isTeacherSelf: Boolean(isTeacherSelf && !isAuthenticatedStudent)
    }
  });

  revalidatePath("/");
  revalidatePath("/teachers");
  revalidatePath("/courses");

  const detailPath = await getTargetDetailPath({
    targetType,
    teacherProfileId: parsed.data.targetType === "teacher" ? parsed.data.targetId : null,
    courseId: parsed.data.targetType === "course" ? parsed.data.targetId : null
  });

  if (detailPath) {
    revalidatePath(detailPath);
  }

  return NextResponse.json({
    ok: true,
    rating: {
      authorId: rating.authorId,
      guestKey: rating.guestKey,
      dimension: rating.dimension,
      score: rating.score,
      role: rating.isTeacherSelf ? "teacher-self" : "student"
    }
  });
}
