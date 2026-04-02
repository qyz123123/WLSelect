import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  bio: z.string().trim().max(500)
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bio payload." }, { status: 400 });
  }

  const teacher = await prisma.teacherProfile.findUnique({
    where: { id },
    select: { id: true, userId: true }
  });

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
  }

  if (session?.user?.id && session.user.role !== "student") {
    return NextResponse.json({ error: "Only students can edit teacher bios." }, { status: 403 });
  }

  await prisma.teacherProfile.update({
    where: { id },
    data: {
      shortBio: parsed.data.bio
    }
  });

  revalidatePath("/");
  revalidatePath("/teachers");
  revalidatePath(`/teachers/${id}`);

  return NextResponse.json({ ok: true, bio: parsed.data.bio });
}
