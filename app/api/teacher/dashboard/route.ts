import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getCurrentUser, getTeacherDashboardData } from "@/lib/data";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const viewer = await getCurrentUser(session.user.id);
  const dashboard = await getTeacherDashboardData(session.user.id);

  if (!viewer || !dashboard) {
    return NextResponse.json({ error: "Teacher dashboard not found." }, { status: 404 });
  }

  return NextResponse.json({
    viewer,
    dashboard
  });
}
