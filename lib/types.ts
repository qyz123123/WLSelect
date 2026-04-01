export type Locale = "en" | "zh";

export type Role = "student" | "teacher" | "admin";

export type IdentityRole = "student" | "teacher";

export type IdentityStatus = "teacher-auth-required" | "student-browser" | "student-guest" | "student-logged-in" | "teacher-logged-in";

export type GradeLevel = "G9" | "G10" | "G11" | "G12";

export type CourseSystem = "AP" | "AL" | "GENERAL";

export type Visibility = "PUBLIC_ONLY" | "PUBLIC_AND_TEACHER";

export type RatingDimensionGroup = "teacher" | "course";

export interface AppUser {
  id: string;
  email: string;
  role: Role;
  language: Locale;
  name: string;
  avatar: string;
  gradeLevel?: GradeLevel;
  system?: CourseSystem;
  accountName?: string;
  teacherVerified?: boolean;
  teacherProfileId?: string;
  studentProfileId?: string;
}

export interface RatingDimension {
  key: string;
  label: {
    en: string;
    zh: string;
  };
}

export interface RatingValue {
  authorId?: string;
  guestKey?: string;
  dimension: string;
  score: number;
  role: "student" | "teacher-self";
}

export interface Course {
  id: string;
  slug: string;
  code: string;
  name: string;
  subject: string;
  description: string;
  gradeLevels: GradeLevel[];
  system: CourseSystem;
  prerequisites?: string;
  teacherIds: string[];
  stars: number;
  commentCount: number;
  questionCount: number;
  ratings: RatingValue[];
  teacherNames?: string[];
  isFavorite?: boolean;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  name: string;
  department: string;
  subjectArea: string;
  bio: string;
  teachingStyle: string;
  coursesTaught: string[];
  courseLinks?: Array<{
    id: string;
    slug: string;
    label: string;
  }>;
  avatar: string;
  stars: number;
  ratings: RatingValue[];
  isFavorite?: boolean;
}

export interface TeacherDashboardReminder {
  id: string;
  kind: "profile" | "course-profile" | "course-request";
  title: string;
  description: string;
  href: string;
}

export interface TeacherDashboardSummary {
  reminders: TeacherDashboardReminder[];
  questionCount: number;
  commentCount: number;
  pendingCourseRequests: number;
  incompleteCourseProfiles: Array<{
    courseId: string;
    courseName: string;
    slug: string;
  }>;
}

export interface CommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  body: string;
  createdAt: string;
  likes: number;
  viewerHasLiked?: boolean;
}

export interface Comment {
  id: string;
  targetType: "teacher" | "course";
  targetId: string;
  targetHref?: string;
  targetLabel?: string;
  authorId?: string;
  authorName: string;
  authorRole: Role;
  isGuest?: boolean;
  title: string;
  body: string;
  visibility: Visibility;
  likes: number;
  createdAt: string;
  replies: CommentReply[];
  ratings?: RatingValue[];
  viewerHasLiked?: boolean;
  canReply?: boolean;
}

export interface QuestionReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  body: string;
  createdAt: string;
  accepted?: boolean;
  likes: number;
  viewerHasLiked?: boolean;
}

export interface Question {
  id: string;
  targetType: "teacher" | "course";
  targetId: string;
  targetHref?: string;
  targetLabel?: string;
  authorId?: string;
  authorName: string;
  authorRole: Role;
  isGuest?: boolean;
  title: string;
  body: string;
  likes: number;
  answered: boolean;
  createdAt: string;
  replies: QuestionReply[];
  viewerHasLiked?: boolean;
  canReply?: boolean;
}

export interface StudentCourseMap {
  G9: string[];
  G10: string[];
  G11: string[];
  G12: string[];
}

export interface StudentProfile {
  userId: string;
  accountName: string;
  gradeLevel: GradeLevel;
  system: CourseSystem;
  bio: string;
  courseHistory: StudentCourseMap;
  savedTeacherIds: string[];
  savedCourseIds: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
}

export interface IdentityState {
  selectedRole: IdentityRole | null;
  status: IdentityStatus | null;
  guestDisplayName?: string;
  guestKey?: string;
}

export interface FeedItem {
  kind: "comment" | "question";
  createdAt: string;
  payload: Comment | Question;
}
