import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTargetDetailPath } from "@/lib/route-paths";

const schema = z.object({
  body: z.string().min(2).max(2000),
  accepted: z.boolean().optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answer payload." }, { status: 400 });
  }

  const { id } = await params;
  const reply = await prisma.questionReply.create({
    data: {
      questionId: id,
      authorId: session.user.id,
      body: parsed.data.body,
      isAccepted: parsed.data.accepted ?? false
    },
    include: {
      question: true
    }
  });

  await prisma.question.update({
    where: { id },
    data: { isAnswered: true }
  });

  revalidatePath("/");
  const detailPath = await getTargetDetailPath({
    targetType: reply.question.targetType,
    teacherProfileId: reply.question.teacherProfileId,
    courseId: reply.question.courseId
  });
  if (detailPath) {
    revalidatePath(detailPath);
  }
  revalidatePath("/me/questions");

  return NextResponse.json({ ok: true, id: reply.id });
}
