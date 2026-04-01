import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTargetDetailPath } from "@/lib/route-paths";

const schema = z.object({
  body: z.string().min(2).max(2000)
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reply." }, { status: 400 });
  }

  const { id } = await params;
  const reply = await prisma.commentReply.create({
    data: {
      commentId: id,
      authorId: session.user.id,
      body: parsed.data.body
    },
    include: {
      comment: true
    }
  });

  revalidatePath("/");
  const detailPath = await getTargetDetailPath({
    targetType: reply.comment.targetType,
    teacherProfileId: reply.comment.teacherProfileId,
    courseId: reply.comment.courseId
  });
  if (detailPath) {
    revalidatePath(detailPath);
  }
  revalidatePath("/me/comments");

  return NextResponse.json({ ok: true, id: reply.id });
}
