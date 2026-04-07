import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getShanghaiDayKey } from "@/lib/analytics-time";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  const payload = await request.json().catch(() => null);
  const rawPath = typeof payload?.path === "string" ? payload.path : undefined;
  const path = rawPath ? rawPath.slice(0, 255) : undefined;
  const viewerKey =
    session?.user?.id && typeof session.user.id === "string"
      ? `user:${session.user.id}`
      : typeof payload?.visitorKey === "string" && payload.visitorKey.trim()
        ? `guest:${payload.visitorKey.trim().slice(0, 120)}`
        : null;

  if (!viewerKey) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const dayKey = getShanghaiDayKey();
  const viewerDelegate = (prisma as typeof prisma & {
    viewer?: { upsert: (args: unknown) => Promise<unknown> };
    viewerVisit?: { upsert: (args: unknown) => Promise<unknown> };
  }).viewer;
  const viewerVisitDelegate = (prisma as typeof prisma & {
    viewer?: { upsert: (args: unknown) => Promise<unknown> };
    viewerVisit?: { upsert: (args: unknown) => Promise<unknown> };
  }).viewerVisit;

  if (!viewerDelegate || !viewerVisitDelegate) {
    return NextResponse.json({ ok: true });
  }

  await viewerDelegate.upsert({
    where: { viewerKey },
    update: {},
    create: { viewerKey }
  });

  await viewerVisitDelegate.upsert({
    where: {
      viewerKey_dayKey: {
        viewerKey,
        dayKey
      }
    },
    update: {
      lastPath: path
    },
    create: {
      viewerKey,
      dayKey,
      lastPath: path
    }
  });

  return NextResponse.json({ ok: true });
}
