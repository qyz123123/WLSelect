import { TargetType, Visibility } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { ensureGuestNameAvailable, guestIdentitySchema } from "@/lib/guest";
import { prisma } from "@/lib/prisma";
import { getTargetDetailPath } from "@/lib/route-paths";
import { buildTargetKeyFromUi } from "@/lib/targets";

const schema = z.object({
  targetType: z.enum(["teacher", "course"]),
  targetId: z.string().min(1),
  title: z.string().trim().max(120).optional().default(""),
  body: z.string().trim().min(2).max(4000),
  visibility: z.enum(["PUBLIC_ONLY", "PUBLIC_AND_TEACHER"]).default("PUBLIC_ONLY"),
  ratings: z
    .array(
      z.object({
        dimension: z.string().min(1),
        score: z.number().int().min(1).max(5)
      })
    )
    .default([]),
  guest: guestIdentitySchema.optional()
});

export async function GET() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return NextResponse.json({
    items: comments,
    total: comments.length
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid comment payload." }, { status: 400 });
  }

  const isAuthenticatedTeacher = session?.user?.id && session.user.role === "teacher";
  const isAuthenticatedStudent = session?.user?.id && session.user.role === "student";
  const isGuestStudent = !session?.user?.id && Boolean(parsed.data.guest);

  if (!isAuthenticatedTeacher && !isAuthenticatedStudent && !isGuestStudent) {
    return NextResponse.json({ error: "Only students, guest students, or teachers can post comments." }, { status: 403 });
  }

  if (isGuestStudent && parsed.data.guest) {
    try {
      await ensureGuestNameAvailable(parsed.data.guest.guestName);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid guest name." }, { status: 409 });
    }
  }

  const targetKey = buildTargetKeyFromUi(parsed.data.targetType, parsed.data.targetId);
  const targetType = parsed.data.targetType === "teacher" ? TargetType.TEACHER : TargetType.COURSE;
  const authorId = isAuthenticatedTeacher || isAuthenticatedStudent ? session!.user.id : null;
  const guestName = isGuestStudent ? parsed.data.guest!.guestName : null;
  const guestKey = isGuestStudent ? parsed.data.guest!.guestKey : null;
  const trimmedBody = parsed.data.body.trim();
  const title = parsed.data.title.trim() || trimmedBody.slice(0, 120) || "Comment";
  const duplicateWindowStart = new Date(Date.now() - 10 * 60 * 1000);

  const duplicateComment = await prisma.comment.findFirst({
    where: {
      targetType,
      teacherProfileId: parsed.data.targetType === "teacher" ? parsed.data.targetId : null,
      courseId: parsed.data.targetType === "course" ? parsed.data.targetId : null,
      ...(authorId ? { authorId } : { guestKey: guestKey! }),
      OR: [
        {
          body: {
            equals: trimmedBody,
            mode: "insensitive"
          }
        },
        {
          createdAt: {
            gte: duplicateWindowStart
          }
        }
      ]
    },
    select: {
      id: true
    }
  });

  if (duplicateComment) {
    return NextResponse.json(
      {
        error:
          parsed.data.targetType === "teacher"
            ? "You already posted a similar comment on this teacher recently."
            : "You already posted a similar comment on this course recently."
      },
      { status: 409 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      authorId,
      guestName,
      guestKey,
      targetType,
      teacherProfileId: parsed.data.targetType === "teacher" ? parsed.data.targetId : null,
      courseId: parsed.data.targetType === "course" ? parsed.data.targetId : null,
      title,
      body: trimmedBody,
      visibility: parsed.data.visibility as Visibility
    }
  });

  await Promise.all(
    parsed.data.ratings.map((rating) =>
      prisma.rating.upsert({
        where:
          authorId
            ? {
                authorId_targetKey_dimension_isTeacherSelf: {
                  authorId,
                  targetKey,
                  dimension: rating.dimension,
                  isTeacherSelf: false
                }
              }
            : {
                guestKey_targetKey_dimension_isTeacherSelf: {
                  guestKey: guestKey!,
                  targetKey,
                  dimension: rating.dimension,
                  isTeacherSelf: false
                }
              },
        update: {
          score: rating.score,
          commentId: comment.id
        },
        create: {
          authorId,
          guestKey,
          targetType,
          teacherProfileId: parsed.data.targetType === "teacher" ? parsed.data.targetId : null,
          courseId: parsed.data.targetType === "course" ? parsed.data.targetId : null,
          commentId: comment.id,
          targetKey,
          dimension: rating.dimension,
          score: rating.score,
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
  if (authorId) {
    revalidatePath("/me/comments");
  }

  return NextResponse.json({ ok: true, id: comment.id });
}
