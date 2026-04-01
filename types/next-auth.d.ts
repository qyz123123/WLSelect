import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "student" | "teacher" | "admin";
      language: "en" | "zh";
      teacherVerified: boolean;
    };
  }

  interface User {
    role: "student" | "teacher" | "admin";
    language: "en" | "zh";
    teacherVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "student" | "teacher" | "admin";
    language?: "en" | "zh";
    teacherVerified?: boolean;
  }
}
