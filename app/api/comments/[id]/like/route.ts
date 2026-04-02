import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { guestIdentitySchema } from "@/lib/guest";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  guest: guestIdentitySchema.optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid like payload." }, { status: 400 });
  }

  const userId = session?.user?.id ?? null;
  const guestKey = userId ? null : parsed.data.guest?.guestKey ?? null;

  if (!userId && !guestKey) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.commentLike.findFirst({
    where: userId
      ? {
          userId,
          commentId: id
        }
      : {
          guestKey: guestKey!,
          commentId: id
        }
  });

  if (existing) {
    await prisma.commentLike.delete({
      where: { id: existing.id }
    });
  } else {
    await prisma.commentLike.create({
      data: {
        userId: userId ?? undefined,
        guestKey: guestKey ?? undefined,
        commentId: id
      }
    });
  }

  revalidatePath("/");
  revalidatePath("/me/comments");

  return NextResponse.json({ ok: true, active: !existing });
}
