import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { mergeTeachers } from "@/lib/admin-merge";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  sourceId: z.string().min(1),
  targetId: z.string().min(1)
});

export async function POST(request: Request) {
  try {
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
      prisma.teacherProfile.findUnique({
        where: { id: parsed.data.sourceId },
        select: { id: true, displayName: true }
      }),
      prisma.teacherProfile.findUnique({
        where: { id: parsed.data.targetId },
        select: { id: true, displayName: true }
      })
    ]);

    if (!source || !target) {
      return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await mergeTeachers(tx, source.id, target.id);
      await tx.moderationLog.create({
        data: {
          moderatorId: session.user.id,
          action: "REMOVE",
          details: `Merged teacher ${source.displayName} into ${target.displayName}.`
        }
      });
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/teachers");
    revalidatePath(`/teachers/${source.id}`);
    revalidatePath(`/teachers/${target.id}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Merge failed." }, { status: 500 });
  }
}
