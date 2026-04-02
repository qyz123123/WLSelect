import { TargetType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { ensureGuestNameAvailable, guestIdentitySchema } from "@/lib/guest";
import { prisma } from "@/lib/prisma";
import { getTargetDetailPath } from "@/lib/route-paths";
import { buildTargetKeyFromUi } from "@/lib/targets";

const ratingEntrySchema = z.object({
  dimension: z.string().min(1),
  score: z.number().int().min(1).max(5)
});

const schema = z.object({
  targetType: z.enum(["teacher", "course"]),
  targetId: z.string().min(1),
  dimension: z.string().min(1).optional(),
  score: z.number().int().min(1).max(5).optional(),
  ratings: z.array(ratingEntrySchema).min(1).optional(),
  guest: guestIdentitySchema.optional()
}).superRefine((data, ctx) => {
  if (data.ratings?.length) {
    return;
  }

  if (!data.dimension || typeof data.score !== "number") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one rating is required."
    });
  }
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
  const isGuestStudent = !session?.user?.id && Boolean(parsed.data.guest);
  const ratingEntries = parsed.data.ratings ?? [{ dimension: parsed.data.dimension!, score: parsed.data.score! }];

  if (!session?.user?.id && !isGuestStudent) {
    return NextResponse.json({ error: "Student login or guest mode is required to rate." }, { status: 401 });
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
  const isLockedStudentRating = !isTeacherSelf;

  if (isLockedStudentRating) {
    const existingCount = await prisma.rating.count({
      where: authorId
        ? {
            authorId,
            targetKey,
            isTeacherSelf: false
          }
        : {
            guestKey: guestKey!,
            targetKey,
            isTeacherSelf: false
          }
    });

    if (existingCount > 0) {
      return NextResponse.json({ error: "Ratings have already been posted and cannot be changed." }, { status: 409 });
    }
  }

  const ratings = await prisma.$transaction(
    ratingEntries.map((entry) =>
      isTeacherSelf
        ? prisma.rating.upsert({
            where: {
              authorId_targetKey_dimension_isTeacherSelf: {
                authorId: authorId!,
                targetKey,
                dimension: entry.dimension,
                isTeacherSelf: true
              }
            },
            update: {
              score: entry.score,
              commentId: null
            },
            create: {
              authorId,
              guestKey,
              targetType,
              teacherProfileId: parsed.data.targetType === "teacher" ? parsed.data.targetId : null,
              courseId: parsed.data.targetType === "course" ? parsed.data.targetId : null,
              targetKey,
              dimension: entry.dimension,
              score: entry.score,
              isTeacherSelf: true
            }
          })
        : prisma.rating.create({
            data: {
              authorId,
              guestKey,
              targetType,
              teacherProfileId: parsed.data.targetType === "teacher" ? parsed.data.targetId : null,
              courseId: parsed.data.targetType === "course" ? parsed.data.targetId : null,
              targetKey,
              dimension: entry.dimension,
              score: entry.score,
              isTeacherSelf: false
            }
          })
    )
  );

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
    ratings: ratings.map((rating) => ({
      authorId: rating.authorId,
      guestKey: rating.guestKey,
      dimension: rating.dimension,
      score: rating.score,
      role: rating.isTeacherSelf ? "teacher-self" : "student"
    }))
  });
}
