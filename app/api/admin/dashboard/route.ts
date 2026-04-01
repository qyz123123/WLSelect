import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getAdminDashboardData, getCurrentUser, getTeachers } from "@/lib/data";

export async function GET() {
  const session = await auth();

  if (session?.user?.role !== "admin" || !session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const [viewer, dashboard, teachers] = await Promise.all([
    getCurrentUser(session.user.id),
    getAdminDashboardData(),
    getTeachers(session.user.id)
  ]);

  return NextResponse.json({
    viewer,
    dashboard,
    teachers
  });
}
