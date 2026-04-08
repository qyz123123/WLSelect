import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin" || !session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    await prisma.course.delete({
      where: { id: course.id }
    });

    await prisma.moderationLog.create({
      data: {
        moderatorId: session.user.id,
        action: "REMOVE",
        details: `Deleted course ${course.name}.`
      }
    });

    revalidatePath("/admin");
    revalidatePath("/courses");
    revalidatePath("/");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed." }, { status: 500 });
  }
}
