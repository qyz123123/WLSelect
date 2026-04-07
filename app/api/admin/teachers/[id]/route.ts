import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (session?.user?.role !== "admin" || !session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      displayName: true
    }
  });

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
  }

  await prisma.user.delete({
    where: { id: teacher.userId }
  });

  await prisma.moderationLog.create({
    data: {
      moderatorId: session.user.id,
      action: "REMOVE",
      details: `Deleted teacher ${teacher.displayName}.`
    }
  });

  revalidatePath("/admin");
  revalidatePath("/teachers");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
