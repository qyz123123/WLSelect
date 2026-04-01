import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getBrowseTeachers, getCurrentUser } from "@/lib/data";

export async function GET(request: NextRequest) {
  const subject = request.nextUrl.searchParams.get("subject");
  const system = request.nextUrl.searchParams.get("system");
  const session = await auth();
  const viewer = session?.user?.id ? await getCurrentUser(session.user.id) : null;

  const teachers = await getBrowseTeachers({
    subject: subject ?? undefined,
    system: system ?? undefined,
    viewerId: viewer?.id
  });

  return NextResponse.json({ items: teachers, total: teachers.length });
}
