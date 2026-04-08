import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { syncCommentCounts } from "@/lib/comment-counts";
import { ensureGuestNameAvailable, guestIdentitySchema } from "@/lib/guest";
import { prisma } from "@/lib/prisma";
import { getTargetDetailPath } from "@/lib/route-paths";

const schema = z.object({
  body: z.string().trim().min(1).max(2000),
  guest: guestIdentitySchema.optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reply." }, { status: 400 });
  }

  const isAuthenticated = Boolean(session?.user?.id);
  const isGuest = !isAuthenticated && Boolean(parsed.data.guest);

  if (!isAuthenticated && !isGuest) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (isGuest && parsed.data.guest) {
    try {
      await ensureGuestNameAvailable(parsed.data.guest.guestName);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid guest name." }, { status: 409 });
    }
  }

  const { id } = await params;
  const reply = await prisma.commentReply.create({
    data: {
      commentId: id,
      authorId: isAuthenticated ? session!.user.id : undefined,
      guestName: isGuest ? parsed.data.guest!.guestName : undefined,
      guestKey: isGuest ? parsed.data.guest!.guestKey : undefined,
      body: parsed.data.body
    }
  });

  const comment = await prisma.comment.findUnique({
    where: { id: reply.commentId },
    select: {
      targetType: true,
      teacherProfileId: true,
      courseId: true
    }
  });

  if (comment) {
    await syncCommentCounts(prisma, {
      teacherIds: comment.teacherProfileId ? [comment.teacherProfileId] : undefined,
      courseIds: comment.courseId ? [comment.courseId] : undefined
    });
  }

  revalidatePath("/");
  revalidatePath("/teachers");
  revalidatePath("/courses");
  const detailPath = comment
    ? await getTargetDetailPath({
        targetType: comment.targetType,
        teacherProfileId: comment.teacherProfileId,
        courseId: comment.courseId
      })
    : null;
  if (detailPath) {
    revalidatePath(detailPath);
  }
  revalidatePath("/me/comments");

  return NextResponse.json({ ok: true, id: reply.id });
}
