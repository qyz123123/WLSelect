import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCommentsForTarget, getCurrentUser, getQuestionsForTarget, getTeacherById } from "@/lib/data";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guestKey = request.nextUrl.searchParams.get("guestKey") ?? undefined;
  const viewer = session?.user?.id ? await getCurrentUser(session.user.id) : null;
  const teacher = await getTeacherById(id, viewer?.id, guestKey);

  if (!teacher) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const [comments, questions] = await Promise.all([
    getCommentsForTarget("teacher", id, viewer, guestKey),
    getQuestionsForTarget("teacher", id, viewer)
  ]);

  return NextResponse.json({
    viewer,
    teacher,
    comments,
    questions
  });
}
