import { Prisma, TargetType } from "@prisma/client";

import { buildTargetKey } from "@/lib/targets";

async function mergeFavoritesForTarget(
  tx: Prisma.TransactionClient,
  targetType: TargetType,
  sourceId: string,
  targetId: string
) {
  const favorites = await tx.favorite.findMany({
    where:
      targetType === TargetType.TEACHER
        ? { targetType, teacherProfileId: sourceId }
        : { targetType, courseId: sourceId }
  });
  const mergedTargetKey = buildTargetKey(targetType, targetId);

  for (const favorite of favorites) {
    const existing = await tx.favorite.findFirst({
      where: favorite.userId
        ? {
            userId: favorite.userId,
            targetKey: mergedTargetKey
          }
        : {
            guestKey: favorite.guestKey!,
            targetKey: mergedTargetKey
          },
      select: { id: true }
    });

    if (existing) {
      await tx.favorite.delete({
        where: { id: favorite.id }
      });
      continue;
    }

    await tx.favorite.update({
      where: { id: favorite.id },
      data:
        targetType === TargetType.TEACHER
          ? {
              teacherProfileId: targetId,
              targetKey: mergedTargetKey
            }
          : {
              courseId: targetId,
              targetKey: mergedTargetKey
            }
    });
  }
}

async function mergeRatingsForTarget(
  tx: Prisma.TransactionClient,
  targetType: TargetType,
  sourceId: string,
  targetId: string
) {
  const ratings = await tx.rating.findMany({
    where:
      targetType === TargetType.TEACHER
        ? { targetType, teacherProfileId: sourceId }
        : { targetType, courseId: sourceId }
  });
  const mergedTargetKey = buildTargetKey(targetType, targetId);

  for (const rating of ratings) {
    const existing = await tx.rating.findFirst({
      where: {
        id: { not: rating.id },
        targetKey: mergedTargetKey,
        dimension: rating.dimension,
        isTeacherSelf: rating.isTeacherSelf,
        ...(rating.authorId ? { authorId: rating.authorId } : { guestKey: rating.guestKey! })
      },
      select: {
        id: true,
        score: true,
        commentId: true
      }
    });

    if (existing) {
      await tx.rating.update({
        where: { id: existing.id },
        data: {
          score: Math.max(1, Math.min(5, Math.round((existing.score + rating.score) / 2))),
          commentId: existing.commentId ?? rating.commentId
        }
      });
      await tx.rating.delete({
        where: { id: rating.id }
      });
      continue;
    }

    await tx.rating.update({
      where: { id: rating.id },
      data:
        targetType === TargetType.TEACHER
          ? {
              teacherProfileId: targetId,
              targetKey: mergedTargetKey
            }
          : {
              courseId: targetId,
              targetKey: mergedTargetKey
            }
    });
  }
}

async function mergeTeacherLinksForCourse(
  tx: Prisma.TransactionClient,
  sourceCourseId: string,
  targetCourseId: string
) {
  const links = await tx.teacherCourse.findMany({
    where: { courseId: sourceCourseId }
  });

  for (const link of links) {
    const existing = await tx.teacherCourse.findUnique({
      where: {
        teacherId_courseId: {
          teacherId: link.teacherId,
          courseId: targetCourseId
        }
      },
      select: {
        id: true,
        canEdit: true
      }
    });

    if (existing) {
      if (link.canEdit && !existing.canEdit) {
        await tx.teacherCourse.update({
          where: { id: existing.id },
          data: { canEdit: true }
        });
      }
      await tx.teacherCourse.delete({
        where: { id: link.id }
      });
      continue;
    }

    await tx.teacherCourse.update({
      where: { id: link.id },
      data: { courseId: targetCourseId }
    });
  }
}

async function mergeTeacherLinksForTeacher(
  tx: Prisma.TransactionClient,
  sourceTeacherId: string,
  targetTeacherId: string
) {
  const links = await tx.teacherCourse.findMany({
    where: { teacherId: sourceTeacherId }
  });

  for (const link of links) {
    const existing = await tx.teacherCourse.findUnique({
      where: {
        teacherId_courseId: {
          teacherId: targetTeacherId,
          courseId: link.courseId
        }
      },
      select: {
        id: true,
        canEdit: true
      }
    });

    if (existing) {
      if (link.canEdit && !existing.canEdit) {
        await tx.teacherCourse.update({
          where: { id: existing.id },
          data: { canEdit: true }
        });
      }
      await tx.teacherCourse.delete({
        where: { id: link.id }
      });
      continue;
    }

    await tx.teacherCourse.update({
      where: { id: link.id },
      data: { teacherId: targetTeacherId }
    });
  }
}

async function mergeEnrollmentsForCourse(
  tx: Prisma.TransactionClient,
  sourceCourseId: string,
  targetCourseId: string
) {
  const enrollments = await tx.studentCourseRecord.findMany({
    where: { courseId: sourceCourseId }
  });

  for (const enrollment of enrollments) {
    const existing = await tx.studentCourseRecord.findUnique({
      where: {
        profileId_courseId_gradeLevel: {
          profileId: enrollment.profileId,
          courseId: targetCourseId,
          gradeLevel: enrollment.gradeLevel
        }
      },
      select: { id: true }
    });

    if (existing) {
      await tx.studentCourseRecord.delete({
        where: { id: enrollment.id }
      });
      continue;
    }

    await tx.studentCourseRecord.update({
      where: { id: enrollment.id },
      data: { courseId: targetCourseId }
    });
  }
}

export async function mergeCourses(
  tx: Prisma.TransactionClient,
  sourceCourseId: string,
  targetCourseId: string
) {
  await tx.comment.updateMany({
    where: { targetType: TargetType.COURSE, courseId: sourceCourseId },
    data: { courseId: targetCourseId }
  });

  await tx.question.updateMany({
    where: { targetType: TargetType.COURSE, courseId: sourceCourseId },
    data: { courseId: targetCourseId }
  });

  await mergeFavoritesForTarget(tx, TargetType.COURSE, sourceCourseId, targetCourseId);
  await mergeRatingsForTarget(tx, TargetType.COURSE, sourceCourseId, targetCourseId);
  await mergeTeacherLinksForCourse(tx, sourceCourseId, targetCourseId);
  await mergeEnrollmentsForCourse(tx, sourceCourseId, targetCourseId);

  await tx.course.delete({
    where: { id: sourceCourseId }
  });
}

export async function mergeTeachers(
  tx: Prisma.TransactionClient,
  sourceTeacherId: string,
  targetTeacherId: string
) {
  await tx.comment.updateMany({
    where: { targetType: TargetType.TEACHER, teacherProfileId: sourceTeacherId },
    data: { teacherProfileId: targetTeacherId }
  });

  await tx.question.updateMany({
    where: { targetType: TargetType.TEACHER, teacherProfileId: sourceTeacherId },
    data: { teacherProfileId: targetTeacherId }
  });

  await mergeFavoritesForTarget(tx, TargetType.TEACHER, sourceTeacherId, targetTeacherId);
  await mergeRatingsForTarget(tx, TargetType.TEACHER, sourceTeacherId, targetTeacherId);
  await mergeTeacherLinksForTeacher(tx, sourceTeacherId, targetTeacherId);

  await tx.teacherProfile.delete({
    where: { id: sourceTeacherId }
  });
}
