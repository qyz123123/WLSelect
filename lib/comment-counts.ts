import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

async function syncCourseCommentCounts(client: DbClient, courseIds?: string[]) {
  const ids =
    courseIds ??
    (await client.course.findMany({
      select: { id: true }
    })).map((course) => course.id);

  if (ids.length === 0) {
    return;
  }

  const comments = await client.comment.findMany({
    where: {
      courseId: {
        in: ids
      }
    },
    select: {
      courseId: true,
      _count: {
        select: {
          replies: true
        }
      }
    }
  });

  const counts = new Map(ids.map((id) => [id, 0]));

  for (const comment of comments) {
    if (!comment.courseId) {
      continue;
    }

    counts.set(comment.courseId, (counts.get(comment.courseId) ?? 0) + 1 + comment._count.replies);
  }

  await Promise.all(
    ids.map((id) =>
      client.course.update({
        where: { id },
        data: { commentCount: counts.get(id) ?? 0 }
      })
    )
  );
}

async function syncTeacherCommentCounts(client: DbClient, teacherIds?: string[]) {
  const ids =
    teacherIds ??
    (await client.teacherProfile.findMany({
      select: { id: true }
    })).map((teacher) => teacher.id);

  if (ids.length === 0) {
    return;
  }

  const comments = await client.comment.findMany({
    where: {
      teacherProfileId: {
        in: ids
      }
    },
    select: {
      teacherProfileId: true,
      _count: {
        select: {
          replies: true
        }
      }
    }
  });

  const counts = new Map(ids.map((id) => [id, 0]));

  for (const comment of comments) {
    if (!comment.teacherProfileId) {
      continue;
    }

    counts.set(comment.teacherProfileId, (counts.get(comment.teacherProfileId) ?? 0) + 1 + comment._count.replies);
  }

  await Promise.all(
    ids.map((id) =>
      client.teacherProfile.update({
        where: { id },
        data: { commentCount: counts.get(id) ?? 0 }
      })
    )
  );
}

export async function syncCommentCounts(
  client: DbClient,
  options: {
    courseIds?: string[];
    teacherIds?: string[];
  } = {}
) {
  await Promise.all([
    syncCourseCommentCounts(client, options.courseIds),
    syncTeacherCommentCounts(client, options.teacherIds)
  ]);
}
