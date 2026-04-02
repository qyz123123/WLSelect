import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCommentsForTarget, getCourseBySlug, getCurrentUser, getQuestionsForTarget } from "@/lib/data";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const guestKey = request.nextUrl.searchParams.get("guestKey") ?? undefined;
  const viewer = session?.user?.id ? await getCurrentUser(session.user.id) : null;
  const course = await getCourseBySlug(slug, viewer?.id, guestKey);

  if (!course) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const [comments, questions] = await Promise.all([
    getCommentsForTarget("course", course.id, viewer, guestKey),
    getQuestionsForTarget("course", course.id, viewer)
  ]);

  return NextResponse.json({
    viewer,
    course,
    comments,
    questions
  });
}
