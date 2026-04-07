import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCommentsForTarget, getCurrentUser, getPopularComments } from "@/lib/data";
import { readGuestKeyFromCookie } from "@/lib/identity-cookie-server";

export async function GET(request: NextRequest) {
  const targetType = request.nextUrl.searchParams.get("targetType");
  const targetId = request.nextUrl.searchParams.get("targetId");

  if (targetType === "all-courses") {
    const session = await auth();
    const viewer = session?.user?.id ? await getCurrentUser(session.user.id) : null;
    const comments = await getPopularComments(viewer, 30);

    return NextResponse.json({
      comments: comments.filter((comment) => comment.targetType === "course").slice(0, 6)
    });
  }

  if ((targetType !== "teacher" && targetType !== "course") || !targetId) {
    return NextResponse.json({ comments: [] });
  }

  const session = await auth();
  const viewer = session?.user?.id ? await getCurrentUser(session.user.id) : null;
  const guestKey = viewer ? undefined : await readGuestKeyFromCookie();
  const comments = await getCommentsForTarget(targetType, targetId, viewer, guestKey);

  return NextResponse.json({
    comments: comments
      .slice()
      .sort((a, b) => b.likes - a.likes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
  });
}
