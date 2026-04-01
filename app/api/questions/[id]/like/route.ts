import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.questionLike.findUnique({
    where: {
      userId_questionId: {
        userId: session.user.id,
        questionId: id
      }
    }
  });

  if (existing) {
    await prisma.questionLike.delete({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId: id
        }
      }
    });
  } else {
    await prisma.questionLike.create({
      data: {
        userId: session.user.id,
        questionId: id
      }
    });
  }

  revalidatePath("/");
  revalidatePath("/me/questions");

  return NextResponse.json({ ok: true, active: !existing });
}
