import { CourseRequestStatus, CourseSystem, Prisma, TargetType, UserRole, Visibility } from "@prisma/client";

import { getShanghaiDayRange } from "@/lib/analytics-time";
import { prisma } from "@/lib/prisma";
import { buildTargetKey } from "@/lib/targets";
import {
  AppUser,
  Comment,
  Course,
  FeedItem,
  NotificationItem,
  Question,
  StudentProfile,
  TeacherDashboardSummary,
  TeacherProfile
} from "@/lib/types";

const userProfileInclude = {
  studentProfile: {
    include: {
      enrollments: {
        include: {
          course: true
        }
      }
    }
  },
  teacherProfile: {
    include: {
      courseLinks: {
        include: {
          course: true
        }
      }
    }
  }
} satisfies Prisma.UserInclude;

type UserWithProfiles = Prisma.UserGetPayload<{
  include: typeof userProfileInclude;
}>;

function mapRole(role: UserRole) {
  return role.toLowerCase() as AppUser["role"];
}

function mapLocale(language: string) {
  return language === "zh" ? "zh" : "en";
}

function localizeNotification(locale: "en" | "zh", title: string, body: string) {
  if (locale === "zh") {
    if (title === "Your question received a new answer") {
      return {
        title: "你的问题收到了新回答",
        body: "Dr. Sofia Reyes 在 AP Physics 1 中进行了回复。"
      };
    }

    if (title === "Comment moderation reminder") {
      return {
        title: "评论审核提醒",
        body: "发布前现在会先显示社区规范。"
      };
    }

    if (title === "A teacher-visible comment was posted") {
      return {
        title: "收到一条教师可见评论",
        body: "你的资料页出现了一条新的学生评价。"
      };
    }
  }

  return { title, body };
}

function mapTargetType(targetType: TargetType): "teacher" | "course" {
  return targetType === TargetType.TEACHER ? "teacher" : "course";
}

function buildInteractionTargetMeta({
  interactionKind,
  interactionId,
  teacherProfileId,
  teacherName,
  course
}: {
  interactionKind: "comment" | "question";
  interactionId: string;
  teacherProfileId?: string | null;
  teacherName?: string | null;
  course?: { slug: string; name: string } | null;
}) {
  if (teacherProfileId) {
    return {
      targetHref: `/teachers/${teacherProfileId}#${interactionKind}-${interactionId}`,
      targetLabel: teacherName ?? undefined
    };
  }

  if (course?.slug) {
    return {
      targetHref: `/courses/${course.slug}#${interactionKind}-${interactionId}`,
      targetLabel: course.name
    };
  }

  return {
    targetHref: undefined,
    targetLabel: undefined
  };
}

function fallbackAvatar(seed: string) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
}

function resolveDisplayName(user: UserWithProfiles) {
  return user.teacherProfile?.displayName ?? user.studentProfile?.accountName ?? user.email.split("@")[0];
}

function resolveContentAuthor({
  author,
  guestName
}: {
  author: UserWithProfiles | null;
  guestName?: string | null;
}) {
  if (author) {
    return {
      authorId: author.id,
      authorName: resolveDisplayName(author),
      authorRole: mapRole(author.role),
      isGuest: false
    };
  }

  return {
    authorId: undefined,
    authorName: guestName?.trim() || "Guest",
    authorRole: "student" as const,
    isGuest: true
  };
}

function mapCommentReply({
  reply,
  viewerHasLiked = false
}: {
  reply: {
    id: string;
    authorId: string | null;
    guestName?: string | null;
    body: string;
    createdAt: Date;
    author: UserWithProfiles | null;
    _count: {
      likes: number;
    };
  };
  viewerHasLiked?: boolean;
}) {
  return {
    id: reply.id,
    authorId: reply.authorId ?? undefined,
    authorName: reply.author ? resolveDisplayName(reply.author) : reply.guestName?.trim() || "Guest",
    authorRole: reply.author ? mapRole(reply.author.role) : ("student" as const),
    isGuest: !reply.author,
    body: reply.body,
    createdAt: reply.createdAt.toISOString(),
    likes: reply._count.likes,
    viewerHasLiked
  };
}

function resolveAvatar(user: UserWithProfiles) {
  return user.teacherProfile?.avatarUrl ?? user.studentProfile?.avatarUrl ?? fallbackAvatar(resolveDisplayName(user));
}

function mapAppUser(user: UserWithProfiles): AppUser {
  return {
    id: user.id,
    email: user.email,
    role: mapRole(user.role),
    language: mapLocale(user.language),
    name: resolveDisplayName(user),
    avatar: resolveAvatar(user),
    gradeLevel: user.studentProfile?.gradeLevel,
    system: user.studentProfile?.courseSystem ?? undefined,
    accountName: user.studentProfile?.accountName,
    teacherVerified: user.isTeacherVerified,
    teacherProfileId: user.teacherProfile?.id,
    studentProfileId: user.studentProfile?.id
  };
}

function mapRatings(
  ratings: Array<{
    authorId: string | null;
    guestKey: string | null;
    dimension: string;
    score: number;
    isTeacherSelf: boolean;
  }>
) {
  return ratings.map((rating) => ({
    authorId: rating.authorId ?? undefined,
    guestKey: rating.guestKey ?? undefined,
    dimension: rating.dimension,
    score: rating.score,
    role: rating.isTeacherSelf ? ("teacher-self" as const) : ("student" as const)
  }));
}

async function getFavoriteKeySet(viewerId?: string, guestKey?: string) {
  if (!viewerId && !guestKey) {
    return new Set<string>();
  }

  const favorites = await prisma.favorite.findMany({
    where: viewerId ? { userId: viewerId } : { guestKey },
    select: { targetKey: true }
  });

  return new Set(favorites.map((favorite) => favorite.targetKey));
}

async function getTeacherVisibleUserId(teacherProfileId: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId },
    select: { userId: true }
  });

  return teacher?.userId ?? null;
}

function canSeeComment(
  visibility: Visibility,
  viewer: AppUser | null,
  authorId: string | null,
  teacherUserId: string | null,
  commentGuestKey: string | null,
  viewerGuestKey?: string
) {
  if (visibility === "PUBLIC_ONLY") {
    return true;
  }

  if (viewer) {
    return (authorId ? viewer.id === authorId : false) || viewer.id === teacherUserId;
  }

  return Boolean(viewerGuestKey && commentGuestKey && viewerGuestKey === commentGuestKey);
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userProfileInclude
  });

  return user ? mapAppUser(user) : null;
}

export async function getTeachers(viewerId?: string, guestKey?: string) {
  const favorites = await getFavoriteKeySet(viewerId, guestKey);
  const teachers = await prisma.teacherProfile.findMany({
    include: {
      user: {
        include: userProfileInclude
      },
      courseLinks: {
        include: {
          course: true
        }
      },
      ratings: true,
      _count: {
        select: {
          favorites: true,
          comments: true
        }
      }
    },
    orderBy: [{ favorites: { _count: "desc" } }, { displayName: "asc" }]
  });
  return teachers.map<TeacherProfile>((teacher) => ({
    id: teacher.id,
    userId: teacher.userId,
    name: teacher.displayName,
    department: teacher.department,
    subjectArea: teacher.subjectArea,
    bio: teacher.shortBio ?? "",
    teachingStyle: teacher.teachingStyle ?? "",
    coursesTaught: teacher.courseLinks.map((link) => `${link.course.code} • ${link.course.name}`),
    courseLinks: teacher.courseLinks.map((link) => ({
      id: link.course.id,
      slug: link.course.slug,
      label: `${link.course.code} • ${link.course.name}`
    })),
    avatar: teacher.avatarUrl ?? resolveAvatar(teacher.user),
    stars: teacher._count.favorites,
    commentCount: teacher.commentCount,
    ratings: mapRatings(teacher.ratings),
    isFavorite: favorites.has(buildTargetKey(TargetType.TEACHER, teacher.id))
  }));
}

export async function getTeacherById(id: string, viewerId?: string, guestKey?: string) {
  const favorites = await getFavoriteKeySet(viewerId, guestKey);
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id },
    include: {
      user: {
        include: userProfileInclude
      },
      courseLinks: {
        include: {
          course: true
        }
      },
      ratings: true,
      _count: {
        select: {
          favorites: true,
          comments: true
        }
      }
    }
  });

  if (!teacher) {
    return null;
  }

  return {
    id: teacher.id,
    userId: teacher.userId,
    name: teacher.displayName,
    department: teacher.department,
    subjectArea: teacher.subjectArea,
    bio: teacher.shortBio ?? "",
    teachingStyle: teacher.teachingStyle ?? "",
    coursesTaught: teacher.courseLinks.map((link) => `${link.course.code} • ${link.course.name}`),
    courseLinks: teacher.courseLinks.map((link) => ({
      id: link.course.id,
      slug: link.course.slug,
      label: `${link.course.code} • ${link.course.name}`
    })),
    avatar: teacher.avatarUrl ?? resolveAvatar(teacher.user),
    stars: teacher._count.favorites,
    commentCount: teacher.commentCount,
    ratings: mapRatings(teacher.ratings),
    isFavorite: favorites.has(buildTargetKey(TargetType.TEACHER, teacher.id))
  } satisfies TeacherProfile;
}

export async function getCourses(viewerId?: string, guestKey?: string) {
  const favorites = await getFavoriteKeySet(viewerId, guestKey);
  const courses = await prisma.course.findMany({
    include: {
      teacherLinks: {
        include: {
          teacher: true
        }
      },
      ratings: true,
      _count: {
        select: {
          favorites: true,
          comments: true,
          questions: true
        }
      }
    },
    orderBy: [{ favorites: { _count: "desc" } }, { code: "asc" }]
  });
  return courses.map<Course>((course) => ({
    id: course.id,
    slug: course.slug,
    code: course.code,
    name: course.name,
    subject: course.subject,
    description: course.description,
    gradeLevels: course.gradeLevels,
    system: course.system,
    prerequisites: course.prerequisites ?? undefined,
    teacherIds: course.teacherLinks.map((link) => link.teacher.id),
    teacherNames: course.teacherLinks.map((link) => link.teacher.displayName),
    stars: course._count.favorites,
    commentCount: course.commentCount,
    questionCount: course._count.questions,
    ratings: mapRatings(course.ratings),
    isFavorite: favorites.has(buildTargetKey(TargetType.COURSE, course.id))
  }));
}

export async function getCourseBySlug(slug: string, viewerId?: string, guestKey?: string) {
  const favorites = await getFavoriteKeySet(viewerId, guestKey);
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      teacherLinks: {
        include: {
          teacher: true
        }
      },
      ratings: true,
      _count: {
        select: {
          favorites: true,
          comments: true,
          questions: true
        }
      }
    }
  });

  if (!course) {
    return null;
  }

  return {
    id: course.id,
    slug: course.slug,
    code: course.code,
    name: course.name,
    subject: course.subject,
    description: course.description,
    gradeLevels: course.gradeLevels,
    system: course.system,
    prerequisites: course.prerequisites ?? undefined,
    teacherIds: course.teacherLinks.map((link) => link.teacher.id),
    teacherNames: course.teacherLinks.map((link) => link.teacher.displayName),
    stars: course._count.favorites,
    commentCount: course.commentCount,
    questionCount: course._count.questions,
    ratings: mapRatings(course.ratings),
    isFavorite: favorites.has(buildTargetKey(TargetType.COURSE, course.id))
  } satisfies Course;
}

export async function getCommentsForTarget(
  targetType: "teacher" | "course",
  targetId: string,
  viewer: AppUser | null = null,
  viewerGuestKey?: string
) {
  const teacherUserId = targetType === "teacher" ? await getTeacherVisibleUserId(targetId) : null;
  const comments = await prisma.comment.findMany({
    where:
      targetType === "teacher"
        ? { targetType: TargetType.TEACHER, teacherProfileId: targetId }
        : { targetType: TargetType.COURSE, courseId: targetId },
    include: {
      author: {
        include: userProfileInclude
      },
      teacherProfile: {
        select: {
          displayName: true
        }
      },
      course: {
        select: {
          slug: true,
          name: true
        }
      },
      ratings: true,
      likes: viewer
        ? {
            where: {
              userId: viewer.id
            }
          }
        : viewerGuestKey
          ? {
              where: {
                guestKey: viewerGuestKey
              }
            }
        : true,
      replies: {
        include: {
          author: {
            include: userProfileInclude
          },
          likes: viewer
            ? {
                where: {
                  userId: viewer.id
                }
              }
            : true,
          _count: {
            select: {
              likes: true
            }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      },
      _count: {
        select: {
          likes: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return comments
    .filter((comment) => canSeeComment(comment.visibility, viewer, comment.authorId, teacherUserId, comment.guestKey, viewerGuestKey))
    .map<Comment>((comment) => ({
      id: comment.id,
      targetType,
      targetId,
      ...buildInteractionTargetMeta({
        interactionKind: "comment",
        interactionId: comment.id,
        teacherProfileId: comment.teacherProfileId,
        teacherName: comment.teacherProfile?.displayName,
        course: comment.course
      }),
      ...resolveContentAuthor({
        author: comment.author,
        guestName: comment.guestName
      }),
      title: comment.title ?? "Comment",
      body: comment.body,
      visibility: comment.visibility,
      likes: comment._count.likes,
      viewerHasLiked: comment.likes.length > 0,
      createdAt: comment.createdAt.toISOString(),
      ratings: mapRatings(comment.ratings),
      canReply: Boolean(viewer || viewerGuestKey),
      replies: comment.replies.map((reply) => mapCommentReply({ reply, viewerHasLiked: viewer ? reply.likes.length > 0 : false }))
    }));
}

export async function getQuestionsForTarget(
  targetType: "teacher" | "course",
  targetId: string,
  viewer: AppUser | null = null
) {
  const questions = await prisma.question.findMany({
    where:
      targetType === "teacher"
        ? { targetType: TargetType.TEACHER, teacherProfileId: targetId }
        : { targetType: TargetType.COURSE, courseId: targetId },
    include: {
      author: {
        include: userProfileInclude
      },
      teacherProfile: {
        select: {
          displayName: true
        }
      },
      course: {
        select: {
          slug: true,
          name: true
        }
      },
      likes: viewer
        ? {
            where: {
              userId: viewer.id
            }
          }
        : true,
      replies: {
        include: {
          author: {
            include: userProfileInclude
          },
          likes: viewer
            ? {
                where: {
                  userId: viewer.id
                }
              }
            : true,
          _count: {
            select: {
              likes: true
            }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      },
      _count: {
        select: {
          likes: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return questions.map<Question>((question) => ({
    id: question.id,
    targetType,
    targetId,
    ...buildInteractionTargetMeta({
      interactionKind: "question",
      interactionId: question.id,
      teacherProfileId: question.teacherProfileId,
      teacherName: question.teacherProfile?.displayName,
      course: question.course
    }),
    ...resolveContentAuthor({
      author: question.author,
      guestName: question.guestName
    }),
    title: question.title,
    body: question.body,
    likes: question._count.likes,
    viewerHasLiked: viewer ? question.likes.length > 0 : false,
    answered: question.isAnswered,
    createdAt: question.createdAt.toISOString(),
    canReply: Boolean(viewer),
    replies: question.replies.map((reply) => ({
      id: reply.id,
      authorId: reply.authorId,
      authorName: resolveDisplayName(reply.author),
      authorRole: mapRole(reply.author.role),
      body: reply.body,
      createdAt: reply.createdAt.toISOString(),
      accepted: reply.isAccepted,
      likes: reply._count.likes,
      viewerHasLiked: viewer ? reply.likes.length > 0 : false
    }))
  }));
}

export async function getStudentProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userProfileInclude
  });

  if (!user?.studentProfile) {
    return null;
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { targetType: true, teacherProfileId: true, courseId: true }
  });

  const courseHistory: StudentProfile["courseHistory"] = {
    G9: [],
    G10: [],
    G11: [],
    G12: []
  };

  user.studentProfile.enrollments.forEach((record) => {
    courseHistory[record.gradeLevel].push(record.course.name);
  });

  return {
    userId,
    accountName: user.studentProfile.accountName,
    gradeLevel: user.studentProfile.gradeLevel,
    system: user.studentProfile.courseSystem,
    bio: user.studentProfile.bio ?? "",
    courseHistory,
    savedTeacherIds: favorites
      .filter((favorite) => favorite.targetType === TargetType.TEACHER && favorite.teacherProfileId)
      .map((favorite) => favorite.teacherProfileId as string),
    savedCourseIds: favorites
      .filter((favorite) => favorite.targetType === TargetType.COURSE && favorite.courseId)
      .map((favorite) => favorite.courseId as string)
  };
}

export async function getNotifications(userId: string) {
  const [user, notifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { language: true }
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc"
      },
      take: 6
    })
  ]);

  const locale = mapLocale(user?.language ?? "en");

  return notifications.map<NotificationItem>((notification) => ({
    ...localizeNotification(locale, notification.title, notification.body),
    id: notification.id,
    href: notification.href ?? "/",
    read: notification.isRead
  }));
}

export async function getFeedItems(viewer: AppUser | null = null) {
  const [comments, questions] = await Promise.all([
    prisma.comment.findMany({
      where: viewer
        ? {
            OR: [
              { visibility: Visibility.PUBLIC_ONLY },
              { authorId: viewer.id }
            ]
          }
        : { visibility: Visibility.PUBLIC_ONLY },
      include: {
        author: {
          include: userProfileInclude
        },
        teacherProfile: {
          select: {
            displayName: true
          }
        },
        course: {
          select: {
            slug: true,
            name: true
          }
        },
        ratings: true,
        replies: {
          include: {
            author: {
              include: userProfileInclude
            },
            _count: {
              select: { likes: true }
            }
          },
          orderBy: { createdAt: "asc" }
        },
        _count: {
          select: { likes: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    prisma.question.findMany({
      include: {
        author: {
          include: userProfileInclude
        },
        teacherProfile: {
          select: {
            displayName: true
          }
        },
        course: {
          select: {
            slug: true,
            name: true
          }
        },
        replies: {
          include: {
            author: {
              include: userProfileInclude
            },
            _count: {
              select: { likes: true }
            }
          },
          orderBy: { createdAt: "asc" }
        },
        _count: {
          select: { likes: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 6
    })
  ]);

  const items: FeedItem[] = [
    ...comments.map((comment) => ({
      kind: "comment" as const,
      createdAt: comment.createdAt.toISOString(),
      payload: {
        id: comment.id,
        targetType: mapTargetType(comment.targetType),
        targetId: comment.teacherProfileId ?? comment.courseId ?? "",
        ...buildInteractionTargetMeta({
          interactionKind: "comment",
          interactionId: comment.id,
          teacherProfileId: comment.teacherProfileId,
          teacherName: comment.teacherProfile?.displayName,
          course: comment.course
        }),
        ...resolveContentAuthor({
          author: comment.author,
          guestName: comment.guestName
        }),
        title: comment.title ?? "Comment",
        body: comment.body,
        visibility: comment.visibility,
        likes: comment._count.likes,
        createdAt: comment.createdAt.toISOString(),
        ratings: mapRatings(comment.ratings),
        replies: comment.replies.map((reply) => mapCommentReply({ reply }))
      }
    })),
    ...questions.map((question) => ({
      kind: "question" as const,
      createdAt: question.createdAt.toISOString(),
      payload: {
        id: question.id,
        targetType: mapTargetType(question.targetType),
        targetId: question.teacherProfileId ?? question.courseId ?? "",
        ...buildInteractionTargetMeta({
          interactionKind: "question",
          interactionId: question.id,
          teacherProfileId: question.teacherProfileId,
          teacherName: question.teacherProfile?.displayName,
          course: question.course
        }),
        ...resolveContentAuthor({
          author: question.author,
          guestName: question.guestName
        }),
        title: question.title,
        body: question.body,
        likes: question._count.likes,
        answered: question.isAnswered,
        createdAt: question.createdAt.toISOString(),
        replies: question.replies.map((reply) => ({
          id: reply.id,
          authorId: reply.authorId,
          authorName: resolveDisplayName(reply.author),
          authorRole: mapRole(reply.author.role),
          body: reply.body,
          createdAt: reply.createdAt.toISOString(),
          accepted: reply.isAccepted,
          likes: reply._count.likes
        }))
      }
    }))
  ];

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPopularComments(viewer: AppUser | null = null, take = 6) {
  const comments = await prisma.comment.findMany({
    where: viewer
      ? {
          OR: [
            { visibility: Visibility.PUBLIC_ONLY },
            { authorId: viewer.id }
          ]
        }
      : { visibility: Visibility.PUBLIC_ONLY },
    include: {
      author: {
        include: userProfileInclude
      },
      teacherProfile: {
        select: {
          displayName: true
        }
      },
      course: {
        select: {
          slug: true,
          name: true
        }
      },
      ratings: true,
      replies: {
        include: {
          author: {
            include: userProfileInclude
          },
          _count: {
            select: { likes: true }
          }
        },
        orderBy: { createdAt: "asc" }
      },
      _count: {
        select: {
          likes: true
        }
      }
    }
  });

  return comments
    .map<Comment>((comment) => ({
      id: comment.id,
      targetType: mapTargetType(comment.targetType),
      targetId: comment.teacherProfileId ?? comment.courseId ?? "",
      ...buildInteractionTargetMeta({
        interactionKind: "comment",
        interactionId: comment.id,
        teacherProfileId: comment.teacherProfileId,
        teacherName: comment.teacherProfile?.displayName,
        course: comment.course
      }),
      ...resolveContentAuthor({
        author: comment.author,
        guestName: comment.guestName
      }),
      title: comment.title ?? "Comment",
      body: comment.body,
      visibility: comment.visibility,
      likes: comment._count.likes,
      createdAt: comment.createdAt.toISOString(),
      ratings: mapRatings(comment.ratings),
      replies: comment.replies.map((reply) => mapCommentReply({ reply }))
    }))
    .sort((a, b) => b.likes - a.likes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, take);
}

export async function getRecentComments(
  viewer: AppUser | null = null,
  take = 8,
  targetType?: "course" | "teacher"
) {
  const comments = await prisma.comment.findMany({
    where: {
      ...(viewer
        ? {
            OR: [{ visibility: Visibility.PUBLIC_ONLY }, { authorId: viewer.id }]
          }
        : { visibility: Visibility.PUBLIC_ONLY }),
      ...(targetType
        ? {
            targetType: targetType === "course" ? TargetType.COURSE : TargetType.TEACHER
          }
        : {})
    },
    include: {
      author: {
        include: userProfileInclude
      },
      teacherProfile: {
        select: {
          displayName: true
        }
      },
      course: {
        select: {
          slug: true,
          name: true
        }
      },
      ratings: true,
      replies: {
        include: {
          author: {
            include: userProfileInclude
          },
          _count: {
            select: { likes: true }
          }
        },
        orderBy: { createdAt: "asc" }
      },
      _count: {
        select: {
          likes: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take
  });

  return comments.map<Comment>((comment) => ({
    id: comment.id,
    targetType: mapTargetType(comment.targetType),
    targetId: comment.teacherProfileId ?? comment.courseId ?? "",
    ...buildInteractionTargetMeta({
      interactionKind: "comment",
      interactionId: comment.id,
      teacherProfileId: comment.teacherProfileId,
      teacherName: comment.teacherProfile?.displayName,
      course: comment.course
    }),
    ...resolveContentAuthor({
      author: comment.author,
      guestName: comment.guestName
    }),
    title: comment.title ?? "Comment",
    body: comment.body,
    visibility: comment.visibility,
    likes: comment._count.likes,
    createdAt: comment.createdAt.toISOString(),
    ratings: mapRatings(comment.ratings),
    replies: comment.replies.map((reply) => mapCommentReply({ reply }))
  }));
}

export async function getUserComments(userId: string) {
  const viewer = await getCurrentUser(userId);

  const comments = await prisma.comment.findMany({
    where: { authorId: userId },
    include: {
      author: { include: userProfileInclude },
      teacherProfile: {
        select: {
          displayName: true
        }
      },
      course: {
        select: {
          slug: true,
          name: true
        }
      },
      ratings: true,
      replies: {
        include: {
          author: { include: userProfileInclude },
          _count: { select: { likes: true } }
        },
        orderBy: { createdAt: "asc" }
      },
      _count: { select: { likes: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return comments.map<Comment>((comment) => ({
    id: comment.id,
    targetType: mapTargetType(comment.targetType),
    targetId: comment.teacherProfileId ?? comment.courseId ?? "",
    ...buildInteractionTargetMeta({
      interactionKind: "comment",
      interactionId: comment.id,
      teacherProfileId: comment.teacherProfileId,
      teacherName: comment.teacherProfile?.displayName,
      course: comment.course
    }),
    ...resolveContentAuthor({
      author: comment.author,
      guestName: comment.guestName
    }),
    title: comment.title ?? "Comment",
    body: comment.body,
    visibility: comment.visibility,
    likes: comment._count.likes,
    viewerHasLiked: viewer ? false : false,
    createdAt: comment.createdAt.toISOString(),
    ratings: mapRatings(comment.ratings),
    replies: comment.replies.map((reply) => mapCommentReply({ reply }))
  }));
}

export async function getUserQuestions(userId: string) {
  const questions = await prisma.question.findMany({
    where: { authorId: userId },
    include: {
      author: { include: userProfileInclude },
      teacherProfile: {
        select: {
          displayName: true
        }
      },
      course: {
        select: {
          slug: true,
          name: true
        }
      },
      replies: {
        include: {
          author: { include: userProfileInclude },
          _count: { select: { likes: true } }
        },
        orderBy: { createdAt: "asc" }
      },
      _count: { select: { likes: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return questions.map<Question>((question) => ({
    id: question.id,
    targetType: mapTargetType(question.targetType),
    targetId: question.teacherProfileId ?? question.courseId ?? "",
    ...buildInteractionTargetMeta({
      interactionKind: "question",
      interactionId: question.id,
      teacherProfileId: question.teacherProfileId,
      teacherName: question.teacherProfile?.displayName,
      course: question.course
    }),
    ...resolveContentAuthor({
      author: question.author,
      guestName: question.guestName
    }),
    title: question.title,
    body: question.body,
    likes: question._count.likes,
    answered: question.isAnswered,
    createdAt: question.createdAt.toISOString(),
    replies: question.replies.map((reply) => ({
      id: reply.id,
      authorId: reply.authorId,
      authorName: resolveDisplayName(reply.author),
      authorRole: mapRole(reply.author.role),
      body: reply.body,
      createdAt: reply.createdAt.toISOString(),
      accepted: reply.isAccepted,
      likes: reply._count.likes
    }))
  }));
}

export async function getAdminDashboardData() {
  const { start, end, dayKey } = getShanghaiDayRange();
  const viewerDelegate = (prisma as typeof prisma & { viewer?: { count: (args?: unknown) => Promise<number> } }).viewer;
  const viewerVisitDelegate = (prisma as typeof prisma & { viewerVisit?: { count: (args?: unknown) => Promise<number> } }).viewerVisit;
  const [users, pendingTeachers, courseCount, teacherCount, totalComments, commentsToday, totalViewers, viewersToday, recentLogs] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        role: UserRole.TEACHER,
        isTeacherVerified: false
      }
    }),
    prisma.course.count(),
    prisma.teacherProfile.count(),
    prisma.comment.count(),
    prisma.comment.count({
      where: {
        createdAt: {
          gte: start,
          lt: end
        }
      }
    }),
    viewerDelegate ? viewerDelegate.count() : Promise.resolve(0),
    viewerVisitDelegate
      ? viewerVisitDelegate.count({
          where: {
            dayKey
          }
        })
      : Promise.resolve(0),
    prisma.moderationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  return {
    users,
    pendingTeachers,
    courseCount,
    teacherCount,
    totalComments,
    commentsToday,
    totalViewers,
    viewersToday,
    recentLogs
  };
}

export async function searchAll(query: string) {
  const lowered = query.trim().toLowerCase();

  if (!lowered) {
    return {
      teachers: [],
      courses: [],
      comments: [],
      questions: []
    };
  }

  const [teachers, courses, comments, questions] = await Promise.all([
    prisma.teacherProfile.findMany({
      where: {
        OR: [
          { displayName: { contains: lowered, mode: "insensitive" } },
          { subjectArea: { contains: lowered, mode: "insensitive" } },
          { shortBio: { contains: lowered, mode: "insensitive" } }
        ]
      },
      include: {
        user: { include: userProfileInclude },
        courseLinks: { include: { course: true } },
        ratings: true,
        _count: { select: { favorites: true, comments: true } }
      },
      take: 10
    }),
    prisma.course.findMany({
      where: {
        OR: [
          { name: { contains: lowered, mode: "insensitive" } },
          { code: { contains: lowered, mode: "insensitive" } },
          { description: { contains: lowered, mode: "insensitive" } }
        ]
      },
      include: {
        teacherLinks: { include: { teacher: true } },
        ratings: true,
        _count: { select: { favorites: true, comments: true, questions: true } }
      },
      take: 10
    }),
    prisma.comment.findMany({
      where: {
        OR: [
          { title: { contains: lowered, mode: "insensitive" } },
          { body: { contains: lowered, mode: "insensitive" } }
        ]
      },
      include: {
        author: { include: userProfileInclude },
        teacherProfile: {
          select: {
            displayName: true
          }
        },
        course: {
          select: {
            slug: true,
            name: true
          }
        },
        ratings: true,
        replies: {
          include: {
            author: { include: userProfileInclude },
            _count: { select: { likes: true } }
          }
        },
        _count: { select: { likes: true } }
      },
      take: 10
    }),
    prisma.question.findMany({
      where: {
        OR: [
          { title: { contains: lowered, mode: "insensitive" } },
          { body: { contains: lowered, mode: "insensitive" } }
        ]
      },
      include: {
        author: { include: userProfileInclude },
        teacherProfile: {
          select: {
            displayName: true
          }
        },
        course: {
          select: {
            slug: true,
            name: true
          }
        },
        replies: {
          include: {
            author: { include: userProfileInclude },
            _count: { select: { likes: true } }
          }
        },
        _count: { select: { likes: true } }
      },
      take: 10
    })
  ]);
  return {
    teachers: teachers.map<TeacherProfile>((teacher) => ({
      id: teacher.id,
      userId: teacher.userId,
      name: teacher.displayName,
      department: teacher.department,
      subjectArea: teacher.subjectArea,
      bio: teacher.shortBio ?? "",
      teachingStyle: teacher.teachingStyle ?? "",
      coursesTaught: teacher.courseLinks.map((link) => `${link.course.code} • ${link.course.name}`),
      courseLinks: teacher.courseLinks.map((link) => ({
        id: link.course.id,
        slug: link.course.slug,
        label: `${link.course.code} • ${link.course.name}`
      })),
      avatar: teacher.avatarUrl ?? resolveAvatar(teacher.user),
      stars: teacher._count.favorites,
      commentCount: teacher.commentCount,
      ratings: mapRatings(teacher.ratings)
    })),
    courses: courses.map<Course>((course) => ({
      id: course.id,
      slug: course.slug,
      code: course.code,
      name: course.name,
      subject: course.subject,
      description: course.description,
      gradeLevels: course.gradeLevels,
      system: course.system,
      prerequisites: course.prerequisites ?? undefined,
      teacherIds: course.teacherLinks.map((link) => link.teacher.id),
      teacherNames: course.teacherLinks.map((link) => link.teacher.displayName),
      stars: course._count.favorites,
      commentCount: course.commentCount,
      questionCount: course._count.questions,
      ratings: mapRatings(course.ratings)
    })),
    comments: comments.map<Comment>((comment) => ({
      id: comment.id,
      targetType: mapTargetType(comment.targetType),
      targetId: comment.teacherProfileId ?? comment.courseId ?? "",
      ...buildInteractionTargetMeta({
        interactionKind: "comment",
        interactionId: comment.id,
        teacherProfileId: comment.teacherProfileId,
        teacherName: comment.teacherProfile?.displayName,
        course: comment.course
      }),
      ...resolveContentAuthor({
        author: comment.author,
        guestName: comment.guestName
      }),
      title: comment.title ?? "Comment",
      body: comment.body,
      visibility: comment.visibility,
      likes: comment._count.likes,
      createdAt: comment.createdAt.toISOString(),
      ratings: mapRatings(comment.ratings),
      replies: comment.replies.map((reply) => mapCommentReply({ reply }))
    })),
    questions: questions.map<Question>((question) => ({
      id: question.id,
      targetType: mapTargetType(question.targetType),
      targetId: question.teacherProfileId ?? question.courseId ?? "",
      ...buildInteractionTargetMeta({
        interactionKind: "question",
        interactionId: question.id,
        teacherProfileId: question.teacherProfileId,
        teacherName: question.teacherProfile?.displayName,
        course: question.course
      }),
      ...resolveContentAuthor({
        author: question.author,
        guestName: question.guestName
      }),
      title: question.title,
      body: question.body,
      likes: question._count.likes,
      answered: question.isAnswered,
      createdAt: question.createdAt.toISOString(),
      replies: question.replies.map((reply) => ({
        id: reply.id,
        authorId: reply.authorId,
        authorName: resolveDisplayName(reply.author),
        authorRole: mapRole(reply.author.role),
        body: reply.body,
        createdAt: reply.createdAt.toISOString(),
        accepted: reply.isAccepted,
        likes: reply._count.likes
      }))
    }))
  };
}

export async function getBrowseTeachers(filters?: { subject?: string; system?: string; viewerId?: string; guestKey?: string }) {
  const teachers = await getTeachers(filters?.viewerId, filters?.guestKey);

  return teachers.filter((teacher) => {
    const subjectMatches = filters?.subject
      ? teacher.subjectArea.toLowerCase().includes(filters.subject.toLowerCase())
      : true;
    const systemMatches = filters?.system
      ? teacher.coursesTaught.some((course) => course.toLowerCase().includes(filters.system!.toLowerCase()))
      : true;
    return subjectMatches && systemMatches;
  });
}

export async function getBrowseCourses(filters?: { grade?: string; system?: string; viewerId?: string; guestKey?: string }) {
  const courses = await getCourses(filters?.viewerId, filters?.guestKey);

  return courses.filter((course) => {
    const gradeMatches = filters?.grade ? course.gradeLevels.includes(filters.grade as Course["gradeLevels"][number]) : true;
    const systemMatches = filters?.system ? course.system === (filters.system as CourseSystem) : true;
    return gradeMatches && systemMatches;
  });
}

export async function isRegisteredNameTaken(name: string) {
  const normalized = name.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  const [student, teacher] = await Promise.all([
    prisma.studentProfile.findFirst({
      where: {
        accountName: {
          equals: normalized,
          mode: "insensitive"
        }
      },
      select: { id: true }
    }),
    prisma.teacherProfile.findFirst({
      where: {
        displayName: {
          equals: normalized,
          mode: "insensitive"
        }
      },
      select: { id: true }
    })
  ]);

  return Boolean(student || teacher);
}

export async function getCourseSelectorItems(query?: string) {
  const trimmed = query?.trim();
  const courses = await prisma.course.findMany({
    where: trimmed
      ? {
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { code: { contains: trimmed, mode: "insensitive" } },
            { subject: { contains: trimmed, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: [{ subject: "asc" }, { code: "asc" }],
    take: trimmed ? 12 : 24,
    select: {
      id: true,
      slug: true,
      code: true,
      name: true,
      subject: true,
      system: true,
      gradeLevels: true
    }
  });

  return courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    code: course.code,
    name: course.name,
    subject: course.subject,
    system: course.system,
    gradeLevels: course.gradeLevels
  }));
}

export async function getTeacherDashboardData(userId: string): Promise<TeacherDashboardSummary | null> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          language: true
        }
      },
      courseLinks: {
        include: {
          course: {
            include: {
              _count: {
                select: {
                  comments: true,
                  questions: true
                }
              }
            }
          }
        }
      },
      _count: {
        select: {
          comments: true,
          questions: true
        }
      }
    }
  });

  if (!teacher) {
    return null;
  }

  const locale = mapLocale(teacher.user.language);

  const pendingCourseRequests = await prisma.courseRequest.count({
    where: {
      requesterId: userId,
      status: CourseRequestStatus.PENDING
    }
  });

  const incompletePersonalProfile =
    !teacher.displayName.trim() ||
    teacher.department === "Unassigned" ||
    teacher.subjectArea === "Unassigned" ||
    !teacher.shortBio?.trim() ||
    !teacher.teachingStyle?.trim();

  const incompleteCourseProfiles = teacher.courseLinks
    .map((link) => link.course)
    .filter((course) => !course.description.trim() || !course.prerequisites?.trim() || !course.subject.trim())
    .map((course) => ({
      courseId: course.id,
      courseName: course.name,
      slug: course.slug
    }));

  const reminders = [
    ...(incompletePersonalProfile
      ? [
          {
            id: "teacher-profile",
            kind: "profile" as const,
            title: locale === "zh" ? "请完善你的个人资料。" : "Please complete your personal profile.",
            description: locale === "zh" ? "请补充部门、学科方向、简介和教学风格。" : "Add your department, subject area, bio, and teaching style.",
            href: "/me/profile"
          }
        ]
      : []),
    ...incompleteCourseProfiles.map((course) => ({
      id: `course-${course.courseId}`,
      kind: "course-profile" as const,
      title: locale === "zh" ? `完善 ${course.courseName} 的课程资料。` : `Complete the profile for ${course.courseName}.`,
      description: locale === "zh" ? "学生仍然需要完整的课程描述和先修要求。" : "Students still need a full course description and prerequisites.",
      href: `/courses/${course.slug}#teacher-edit`
    })),
    ...(pendingCourseRequests > 0
      ? [
          {
            id: "course-request",
            kind: "course-request" as const,
            title:
              locale === "zh"
                ? `你还有 ${pendingCourseRequests} 条课程申请待处理。`
                : `You still have ${pendingCourseRequests} course request${pendingCourseRequests === 1 ? "" : "s"} pending.`,
            description: locale === "zh" ? "审核期间可以继续跟踪你提交的课程申请。" : "Track requested additions while waiting for review.",
            href: "/teacher/dashboard"
          }
        ]
      : [])
  ];

  const commentCount =
    teacher.commentCount +
    teacher.courseLinks.reduce((sum, link) => sum + link.course.commentCount, 0);
  const questionCount =
    teacher._count.questions +
    teacher.courseLinks.reduce((sum, link) => sum + link.course._count.questions, 0);

  return {
    reminders,
    commentCount,
    questionCount,
    pendingCourseRequests,
    incompleteCourseProfiles
  };
}
