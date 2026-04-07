import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { isFixedAdminId } from "@/lib/fixed-admin";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin" || !session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = await params;
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        body: true,
        teacherProfileId: true,
        course: {
          select: {
            slug: true
          }
        }
      }
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    }

    await prisma.comment.delete({
      where: { id: comment.id }
    });

    if (!isFixedAdminId(session.user.id)) {
      await prisma.moderationLog.create({
        data: {
          moderatorId: session.user.id,
          action: "REMOVE",
          targetType: "COMMENT",
          targetId: comment.id,
          details: `Deleted comment ${comment.body.slice(0, 80)}`
        }
      });
    }

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/me/comments");

    if (comment.teacherProfileId) {
      revalidatePath(`/teachers/${comment.teacherProfileId}`);
    }

    if (comment.course?.slug) {
      revalidatePath(`/courses/${comment.course.slug}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed." }, { status: 500 });
  }
}
