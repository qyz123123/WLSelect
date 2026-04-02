import { NextRequest, NextResponse } from "next/server";

import { getCourseSelectorItems } from "@/lib/data";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  const items = await getCourseSelectorItems(query);

  return NextResponse.json({ items });
}
