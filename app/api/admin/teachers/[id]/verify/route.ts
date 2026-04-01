import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;

  await prisma.teacherProfile.update({
    where: { id },
    data: {
      user: {
        update: {
          isTeacherVerified: true
        }
      }
    }
  });

  revalidatePath("/admin");
  revalidatePath(`/teachers/${id}`);

  return NextResponse.json({ ok: true });
}
