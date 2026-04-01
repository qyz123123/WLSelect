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
  const existing = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId: session.user.id,
        commentId: id
      }
    }
  });

  if (existing) {
    await prisma.commentLike.delete({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: id
        }
      }
    });
  } else {
    await prisma.commentLike.create({
      data: {
        userId: session.user.id,
        commentId: id
      }
    });
  }

  revalidatePath("/");
  revalidatePath("/me/comments");

  return NextResponse.json({ ok: true, active: !existing });
}
