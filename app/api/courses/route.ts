import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getBrowseCourses, getCurrentUser } from "@/lib/data";

export async function GET(request: NextRequest) {
  const grade = request.nextUrl.searchParams.get("grade");
  const system = request.nextUrl.searchParams.get("system");
  const query = request.nextUrl.searchParams.get("q");
  const session = await auth();
  const viewer = session?.user?.id ? await getCurrentUser(session.user.id) : null;

  const courses = await getBrowseCourses({
    grade: grade ?? undefined,
    system: system ?? undefined,
    viewerId: viewer?.id
  });

  const filtered = query
    ? courses.filter((course) => {
        const lowered = query.toLowerCase();
        return (
          course.name.toLowerCase().includes(lowered) ||
          course.code.toLowerCase().includes(lowered) ||
          course.subject.toLowerCase().includes(lowered)
        );
      })
    : courses;

  return NextResponse.json({ items: filtered, total: filtered.length });
}
