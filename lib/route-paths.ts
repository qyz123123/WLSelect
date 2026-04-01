import { TargetType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getTargetDetailPath({
  targetType,
  teacherProfileId,
  courseId
}: {
  targetType: TargetType;
  teacherProfileId?: string | null;
  courseId?: string | null;
}) {
  if (targetType === TargetType.TEACHER && teacherProfileId) {
    return `/teachers/${teacherProfileId}`;
  }

  if (targetType === TargetType.COURSE && courseId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { slug: true }
    });

    if (course) {
      return `/courses/${course.slug}`;
    }
  }

  return null;
}
