import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { mergeCourses } from "@/lib/admin-merge";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  sourceId: z.string().min(1),
  targetId: z.string().min(1)
});

export async function POST(request: Request) {
  const session = await auth();

  if (session?.user?.role !== "admin" || !session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success || parsed.data.sourceId === parsed.data.targetId) {
    return NextResponse.json({ error: "Invalid merge payload." }, { status: 400 });
  }

  const [source, target] = await Promise.all([
    prisma.course.findUnique({
      where: { id: parsed.data.sourceId },
      select: { id: true, name: true, slug: true }
    }),
    prisma.course.findUnique({
      where: { id: parsed.data.targetId },
      select: { id: true, name: true, slug: true }
    })
  ]);

  if (!source || !target) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await mergeCourses(tx, source.id, target.id);
    await tx.moderationLog.create({
      data: {
        moderatorId: session.user.id,
        action: "REMOVE",
        details: `Merged course ${source.name} into ${target.name}.`
      }
    });
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath(`/courses/${source.slug}`);
  revalidatePath(`/courses/${target.slug}`);

  return NextResponse.json({ ok: true });
}
