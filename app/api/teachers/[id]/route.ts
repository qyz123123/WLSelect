import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCommentsForTarget, getCurrentUser, getQuestionsForTarget, getTeacherById } from "@/lib/data";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const viewer = session?.user?.id ? await getCurrentUser(session.user.id) : null;
  const teacher = await getTeacherById(id, viewer?.id);

  if (!teacher) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const [comments, questions] = await Promise.all([
    getCommentsForTarget("teacher", id, viewer),
    getQuestionsForTarget("teacher", id, viewer)
  ]);

  return NextResponse.json({
    viewer,
    teacher,
    comments,
    questions
  });
}
