import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  locale: z.enum(["en", "zh"])
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid locale." }, { status: 400 });
  }

  const session = await auth();

  if (session?.user?.id) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { language: parsed.data.locale }
    });
  }

  return NextResponse.json({ ok: true });
}
