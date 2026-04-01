import { hash } from "bcryptjs";
import { CourseSystem, GradeLevel, PrismaClient, TargetType, UserRole, Visibility } from "@prisma/client";

import { buildTargetKey } from "../lib/targets";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Password123!", 12);

  await prisma.commentReplyLike.deleteMany();
  await prisma.questionReplyLike.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.questionLike.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.commentReply.deleteMany();
  await prisma.questionReply.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.moderationLog.deleteMany();
  await prisma.courseRequest.deleteMany();
  await prisma.studentCourseRecord.deleteMany();
  await prisma.teacherCourse.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      id: "user-student-1",
      email: "maya@wlselect.edu",
      passwordHash,
      role: UserRole.STUDENT,
      language: "en",
      studentProfile: {
        create: {
          id: "student-profile-1",
          accountName: "quietlibrary",
          privacyNoticeAt: new Date(),
          gradeLevel: GradeLevel.G11,
          courseSystem: CourseSystem.AP,
          bio: "Interested in physics, economics, and writing-intensive courses.",
          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      id: "user-student-2",
      email: "liam@wlselect.edu",
      passwordHash,
      role: UserRole.STUDENT,
      language: "zh",
      studentProfile: {
        create: {
          id: "student-profile-2",
          accountName: "graphpaper",
          privacyNoticeAt: new Date(),
          gradeLevel: GradeLevel.G12,
          courseSystem: CourseSystem.AL,
          bio: "Prefers organized classes with clear grading and strong feedback loops.",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      id: "user-teacher-1",
      email: "reyes@wlselect.edu",
      passwordHash,
      role: UserRole.TEACHER,
      language: "en",
      isTeacherVerified: true,
      teacherProfile: {
        create: {
          id: "teacher-sofia-reyes",
          displayName: "Dr. Sofia Reyes",
          department: "Science",
          subjectArea: "Physics",
          shortBio: "Teaches analytical physics with strong lab routines and structured exam prep.",
          teachingStyle: "Clear lecture flow, rigorous weekly checkpoints, and practical lab debriefs.",
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
          officeHours: "Tue 15:30-17:00",
          courseHighlights: "Strong AP exam preparation and lab design."
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      id: "user-teacher-2",
      email: "lin@wlselect.edu",
      passwordHash,
      role: UserRole.TEACHER,
      language: "zh",
      isTeacherVerified: true,
      teacherProfile: {
        create: {
          id: "teacher-ethan-lin",
          displayName: "Ethan Lin",
          department: "Humanities",
          subjectArea: "Economics",
          shortBio: "Focuses on essay framing, case-based discussion, and conceptual understanding.",
          teachingStyle: "Seminar-oriented classes with concise slides and strong feedback on writing.",
          avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
          officeHours: "Thu 16:00-17:00",
          courseHighlights: "Excellent case discussion and writing support."
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      id: "user-admin-1",
      email: "admin@wlselect.edu",
      passwordHash,
      role: UserRole.ADMIN,
      language: "en"
    }
  });

  await prisma.course.createMany({
    data: [
      {
        id: "course-ap-physics-1",
        slug: "ap-physics-1",
        code: "AP-PHY-101",
        name: "AP Physics 1",
        subject: "Physics",
        description: "Algebra-based introductory physics with a strong emphasis on conceptual mastery and lab interpretation.",
        gradeLevels: [GradeLevel.G11, GradeLevel.G12],
        system: CourseSystem.AP,
        prerequisites: "Strong Algebra II foundation recommended."
      },
      {
        id: "course-ap-physics-c",
        slug: "ap-physics-c",
        code: "AP-PHY-210",
        name: "AP Physics C",
        subject: "Physics",
        description: "Calculus-based mechanics and electricity and magnetism for advanced STEM students.",
        gradeLevels: [GradeLevel.G12],
        system: CourseSystem.AP,
        prerequisites: ""
      },
      {
        id: "course-ap-microeconomics",
        slug: "ap-microeconomics",
        code: "AP-ECON-110",
        name: "AP Microeconomics",
        subject: "Economics",
        description: "Microeconomic theory, market structures, and policy analysis with case-driven class discussion.",
        gradeLevels: [GradeLevel.G11, GradeLevel.G12],
        system: CourseSystem.AP,
        prerequisites: "Comfort with graphs and analytical writing."
      },
      {
        id: "course-al-economics",
        slug: "al-economics",
        code: "AL-ECON-201",
        name: "A Level Economics",
        subject: "Economics",
        description: "Macro and micro foundations with essay-based assessment and policy evaluation.",
        gradeLevels: [GradeLevel.G11, GradeLevel.G12],
        system: CourseSystem.AL,
        prerequisites: "None."
      }
    ]
  });

  await prisma.teacherCourse.createMany({
    data: [
      { teacherId: "teacher-sofia-reyes", courseId: "course-ap-physics-1" },
      { teacherId: "teacher-sofia-reyes", courseId: "course-ap-physics-c" },
      { teacherId: "teacher-ethan-lin", courseId: "course-ap-microeconomics" },
      { teacherId: "teacher-ethan-lin", courseId: "course-al-economics" }
    ]
  });

  await prisma.studentCourseRecord.createMany({
    data: [
      { profileId: "student-profile-1", courseId: "course-ap-physics-1", gradeLevel: GradeLevel.G11 },
      { profileId: "student-profile-1", courseId: "course-ap-microeconomics", gradeLevel: GradeLevel.G11 },
      { profileId: "student-profile-2", courseId: "course-al-economics", gradeLevel: GradeLevel.G12 }
    ]
  });

  await prisma.favorite.createMany({
    data: [
      {
        userId: "user-student-1",
        targetType: TargetType.TEACHER,
        teacherProfileId: "teacher-sofia-reyes",
        targetKey: buildTargetKey(TargetType.TEACHER, "teacher-sofia-reyes")
      },
      {
        userId: "user-student-1",
        targetType: TargetType.COURSE,
        courseId: "course-ap-physics-1",
        targetKey: buildTargetKey(TargetType.COURSE, "course-ap-physics-1")
      },
      {
        userId: "user-student-1",
        targetType: TargetType.TEACHER,
        teacherProfileId: "teacher-ethan-lin",
        targetKey: buildTargetKey(TargetType.TEACHER, "teacher-ethan-lin")
      },
      {
        userId: "user-student-2",
        targetType: TargetType.COURSE,
        courseId: "course-al-economics",
        targetKey: buildTargetKey(TargetType.COURSE, "course-al-economics")
      }
    ]
  });

  await prisma.comment.create({
    data: {
      id: "comment-1",
      authorId: "user-student-1",
      targetType: TargetType.TEACHER,
      teacherProfileId: "teacher-sofia-reyes",
      title: "Strong structure for AP prep",
      body: "Her pacing is demanding, but every unit has clear goals and the lab reviews make exam questions feel manageable.",
      visibility: Visibility.PUBLIC_AND_TEACHER,
      replies: {
        create: {
          id: "comment-reply-1",
          authorId: "user-teacher-1",
          body: "Thanks for the feedback. I’m adding one more problem-solving review before the next mock exam."
        }
      },
      ratings: {
        create: [
          {
            authorId: "user-student-1",
            targetType: TargetType.TEACHER,
            teacherProfileId: "teacher-sofia-reyes",
            targetKey: buildTargetKey(TargetType.TEACHER, "teacher-sofia-reyes"),
            dimension: "clarity",
            score: 5
          },
          {
            authorId: "user-student-1",
            targetType: TargetType.TEACHER,
            teacherProfileId: "teacher-sofia-reyes",
            targetKey: buildTargetKey(TargetType.TEACHER, "teacher-sofia-reyes"),
            dimension: "organization",
            score: 5
          },
          {
            authorId: "user-student-1",
            targetType: TargetType.TEACHER,
            teacherProfileId: "teacher-sofia-reyes",
            targetKey: buildTargetKey(TargetType.TEACHER, "teacher-sofia-reyes"),
            dimension: "friendliness",
            score: 4
          }
        ]
      }
    }
  });

  await prisma.comment.create({
    data: {
      id: "comment-2",
      authorId: "user-student-1",
      targetType: TargetType.COURSE,
      courseId: "course-ap-microeconomics",
      title: "Great if you like discussion",
      body: "This class works well for students who enjoy debating examples and writing concise explanations instead of pure memorization.",
      visibility: Visibility.PUBLIC_ONLY,
      replies: {
        create: {
          id: "comment-reply-2",
          authorId: "user-admin-1",
          body: "Reminder: keep examples general and avoid naming classmates in feedback."
        }
      },
      ratings: {
        create: [
          {
            authorId: "user-student-1",
            targetType: TargetType.COURSE,
            courseId: "course-ap-microeconomics",
            targetKey: buildTargetKey(TargetType.COURSE, "course-ap-microeconomics"),
            dimension: "engagement",
            score: 5
          },
          {
            authorId: "user-student-1",
            targetType: TargetType.COURSE,
            courseId: "course-ap-microeconomics",
            targetKey: buildTargetKey(TargetType.COURSE, "course-ap-microeconomics"),
            dimension: "feedback",
            score: 4
          },
          {
            authorId: "user-student-1",
            targetType: TargetType.COURSE,
            courseId: "course-ap-microeconomics",
            targetKey: buildTargetKey(TargetType.COURSE, "course-ap-microeconomics"),
            dimension: "difficulty",
            score: 3
          }
        ]
      }
    }
  });

  await prisma.comment.create({
    data: {
      id: "comment-3",
      authorId: "user-student-2",
      targetType: TargetType.COURSE,
      courseId: "course-al-economics",
      title: "Very manageable if you stay current",
      body: "Essay feedback is actionable and the pacing is predictable, but you need to stay consistent with weekly reading.",
      visibility: Visibility.PUBLIC_ONLY,
      ratings: {
        create: [
          {
            authorId: "user-student-2",
            targetType: TargetType.COURSE,
            courseId: "course-al-economics",
            targetKey: buildTargetKey(TargetType.COURSE, "course-al-economics"),
            dimension: "pace",
            score: 4
          },
          {
            authorId: "user-student-2",
            targetType: TargetType.COURSE,
            courseId: "course-al-economics",
            targetKey: buildTargetKey(TargetType.COURSE, "course-al-economics"),
            dimension: "grading",
            score: 4
          },
          {
            authorId: "user-student-2",
            targetType: TargetType.COURSE,
            courseId: "course-al-economics",
            targetKey: buildTargetKey(TargetType.COURSE, "course-al-economics"),
            dimension: "recommendation",
            score: 4
          }
        ]
      }
    }
  });

  await prisma.question.create({
    data: {
      id: "question-1",
      authorId: "user-student-1",
      targetType: TargetType.COURSE,
      courseId: "course-ap-physics-1",
      title: "How much calculus is needed before AP Physics 1?",
      body: "I have a solid Algebra II background but I am not taking calculus yet. Is that enough to keep up?",
      isAnswered: true,
      replies: {
        create: {
          id: "question-reply-1",
          authorId: "user-teacher-1",
          body: "For AP Physics 1, algebra is enough. The bigger factor is comfort with multi-step problem solving and graph interpretation.",
          isAccepted: true
        }
      }
    }
  });

  await prisma.question.create({
    data: {
      id: "question-2",
      authorId: "user-student-1",
      targetType: TargetType.TEACHER,
      teacherProfileId: "teacher-ethan-lin",
      title: "Does Mr. Lin give draft feedback before essays are submitted?",
      body: "Trying to understand how much support is available before the graded version is due.",
      isAnswered: false
    }
  });

  await prisma.rating.createMany({
    data: [
      {
        authorId: "user-teacher-1",
        targetType: TargetType.TEACHER,
        teacherProfileId: "teacher-sofia-reyes",
        targetKey: buildTargetKey(TargetType.TEACHER, "teacher-sofia-reyes"),
        dimension: "organization",
        score: 5,
        isTeacherSelf: true
      },
      {
        authorId: "user-teacher-1",
        targetType: TargetType.COURSE,
        courseId: "course-ap-physics-1",
        targetKey: buildTargetKey(TargetType.COURSE, "course-ap-physics-1"),
        dimension: "recommendation",
        score: 4,
        isTeacherSelf: true
      },
      {
        authorId: "user-teacher-2",
        targetType: TargetType.TEACHER,
        teacherProfileId: "teacher-ethan-lin",
        targetKey: buildTargetKey(TargetType.TEACHER, "teacher-ethan-lin"),
        dimension: "recommendation",
        score: 5,
        isTeacherSelf: true
      },
      {
        authorId: "user-student-2",
        targetType: TargetType.TEACHER,
        teacherProfileId: "teacher-ethan-lin",
        targetKey: buildTargetKey(TargetType.TEACHER, "teacher-ethan-lin"),
        dimension: "participation",
        score: 5
      },
      {
        authorId: "user-student-2",
        targetType: TargetType.TEACHER,
        teacherProfileId: "teacher-ethan-lin",
        targetKey: buildTargetKey(TargetType.TEACHER, "teacher-ethan-lin"),
        dimension: "friendliness",
        score: 5
      },
      {
        authorId: "user-student-2",
        targetType: TargetType.TEACHER,
        teacherProfileId: "teacher-ethan-lin",
        targetKey: buildTargetKey(TargetType.TEACHER, "teacher-ethan-lin"),
        dimension: "clarity",
        score: 4
      },
      {
        authorId: "user-student-2",
        targetType: TargetType.COURSE,
        courseId: "course-ap-physics-c",
        targetKey: buildTargetKey(TargetType.COURSE, "course-ap-physics-c"),
        dimension: "difficulty",
        score: 5
      },
      {
        authorId: "user-student-2",
        targetType: TargetType.COURSE,
        courseId: "course-ap-physics-c",
        targetKey: buildTargetKey(TargetType.COURSE, "course-ap-physics-c"),
        dimension: "assessment",
        score: 5
      },
      {
        authorId: "user-student-2",
        targetType: TargetType.COURSE,
        courseId: "course-ap-physics-c",
        targetKey: buildTargetKey(TargetType.COURSE, "course-ap-physics-c"),
        dimension: "prep",
        score: 4
      }
    ]
  });

  await prisma.commentLike.createMany({
    data: [
      { userId: "user-student-2", commentId: "comment-1" },
      { userId: "user-admin-1", commentId: "comment-2" }
    ]
  });

  await prisma.questionLike.createMany({
    data: [
      { userId: "user-student-2", questionId: "question-1" },
      { userId: "user-admin-1", questionId: "question-1" }
    ]
  });

  await prisma.commentReplyLike.create({
    data: {
      userId: "user-student-1",
      commentReplyId: "comment-reply-1"
    }
  });

  await prisma.questionReplyLike.create({
    data: {
      userId: "user-student-1",
      questionReplyId: "question-reply-1"
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: "user-student-1",
        title: "Your question received a new answer",
        body: "Dr. Sofia Reyes replied on AP Physics 1.",
        href: "/courses/ap-physics-1"
      },
      {
        userId: "user-student-1",
        title: "Comment moderation reminder",
        body: "Community guidelines now appear before posting.",
        href: "/me/comments",
        isRead: true
      },
      {
        userId: "user-teacher-1",
        title: "A teacher-visible comment was posted",
        body: "A new student review is visible on your profile.",
        href: "/teachers/teacher-sofia-reyes"
      }
    ]
  });

  await prisma.moderationLog.create({
    data: {
      moderatorId: "user-admin-1",
      action: "WARN",
      targetType: "COMMENT",
      targetId: "comment-2",
      details: "Community privacy reminder added to thread."
    }
  });

  await prisma.courseRequest.create({
    data: {
      requesterId: "user-teacher-1",
      requesterName: "Dr. Sofia Reyes",
      requesterEmail: "reyes@wlselect.edu",
      name: "AP Environmental Science",
      subject: "Science",
      system: CourseSystem.AP,
      gradeLevels: [GradeLevel.G11, GradeLevel.G12],
      notes: "Requested for the next scheduling cycle."
    }
  });

  console.log("WLSelect database seeded");
  console.log("Demo credentials");
  console.log("student: maya@wlselect.edu / Password123!");
  console.log("teacher: reyes@wlselect.edu / Password123!");
  console.log("admin: admin@wlselect.edu / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
