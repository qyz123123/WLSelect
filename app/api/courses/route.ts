import { CourseSystem, GradeLevel } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { getBrowseCourses, getCurrentUser } from "@/lib/data";
import { readGuestKeyFromCookie } from "@/lib/identity-cookie-server";
import { prisma } from "@/lib/prisma";

const createCourseSchema = z.object({
  name: z.string().trim().min(2).max(120),
  subject: z.string().trim().min(2).max(80),
  description: z.string().trim().min(8).max(2000),
  system: z.enum(["AP", "AL", "GENERAL"]),
  gradeLevels: z.array(z.enum(["G9", "G10", "G11", "G12"])).min(1)
});

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "course"
  );
}

function buildCodeBase(name: string) {
  const compact = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();

  if (!compact) {
    return "COURSE";
  }

  const initials = compact
    .split(/\s+/)
    .map((part) => part.slice(0, 4))
    .join("")
    .slice(0, 16);

  return initials || compact.replace(/\s+/g, "").slice(0, 16) || "COURSE";
}

async function buildUniqueCourseIdentifiers(name: string) {
  const slugBase = slugify(name);
  const codeBase = buildCodeBase(name);
  const existing = await prisma.course.findMany({
    where: {
      OR: [
        { slug: { startsWith: slugBase } },
        { code: { startsWith: codeBase } }
      ]
    },
    select: {
      slug: true,
      code: true
    }
  });

  const slugSet = new Set(existing.map((item) => item.slug));
  const codeSet = new Set(existing.map((item) => item.code));

  let slug = slugBase;
  let code = codeBase;
  let suffix = 2;

  while (slugSet.has(slug) || codeSet.has(code)) {
    slug = `${slugBase}-${suffix}`;
    code = `${codeBase}${suffix}`;
    suffix += 1;
  }

  return { slug, code };
}

export async function GET(request: NextRequest) {
  const grade = request.nextUrl.searchParams.get("grade");
  const system = request.nextUrl.searchParams.get("system");
  const query = request.nextUrl.searchParams.get("q");
  const session = await auth();
  const viewer = session?.user?.id ? await getCurrentUser(session.user.id) : null;
  const guestKey = viewer ? undefined : await readGuestKeyFromCookie();

  const courses = await getBrowseCourses({
    grade: grade ?? undefined,
    system: system ?? undefined,
    viewerId: viewer?.id,
    guestKey
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

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createCourseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid course payload." }, { status: 400 });
  }

  const { slug, code } = await buildUniqueCourseIdentifiers(parsed.data.name);

  const course = await prisma.course.create({
    data: {
      slug,
      code,
      name: parsed.data.name,
      subject: parsed.data.subject,
      description: parsed.data.description,
      prerequisites: "",
      system: parsed.data.system as CourseSystem,
      gradeLevels: parsed.data.gradeLevels as GradeLevel[]
    }
  });

  revalidatePath("/courses");
  revalidatePath("/");

  return NextResponse.json({
    ok: true,
    id: course.id,
    slug: course.slug
  });
}
