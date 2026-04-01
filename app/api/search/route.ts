import { NextRequest, NextResponse } from "next/server";

import { searchAll } from "@/lib/data";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (!query) {
    return NextResponse.json({ teachers: [], courses: [], comments: [], questions: [] });
  }

  return NextResponse.json(await searchAll(query));
}
