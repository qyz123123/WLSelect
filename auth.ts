import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const accountCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  expectedRole: z.enum(["student", "admin"]).optional()
});

const teacherCredentialsSchema = z.object({
  name: z.string().min(2).max(80),
  expectedRole: z.literal("teacher")
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        expectedRole: { label: "Expected role", type: "text" }
      },
      authorize: async (rawCredentials) => {
        const teacherCredentials = teacherCredentialsSchema.safeParse(rawCredentials);

        if (teacherCredentials.success) {
          const normalizedName = teacherCredentials.data.name.trim();

          const matches = await prisma.user.findMany({
            where: {
              role: UserRole.TEACHER,
              teacherProfile: {
                is: {
                  displayName: {
                    equals: normalizedName,
                    mode: "insensitive"
                  }
                }
              }
            },
            include: {
              studentProfile: true,
              teacherProfile: true
            }
          });

          if (matches.length !== 1) {
            return null;
          }

          const user = matches[0];
          const displayName =
            user.teacherProfile?.displayName ??
            user.studentProfile?.accountName ??
            user.email;
          const language = (user.language === "zh" ? "zh" : "en") as "en" | "zh";
          const avatarUrl =
            user.teacherProfile?.avatarUrl ??
            user.studentProfile?.avatarUrl ??
            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

          return {
            id: user.id,
            email: user.email,
            name: displayName,
            image: avatarUrl,
            role: "teacher" as const,
            language,
            teacherVerified: user.isTeacherVerified
          };
        }

        const parsed = accountCredentialsSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: {
            studentProfile: true,
            teacherProfile: true
          }
        });

        if (!user) {
          return null;
        }

        const matches = await compare(parsed.data.password, user.passwordHash);

        if (!matches) {
          return null;
        }

        const displayName =
          user.teacherProfile?.displayName ??
          user.studentProfile?.accountName ??
          user.email;

        const role = user.role.toLowerCase() as "student" | "teacher" | "admin";

        if (parsed.data.expectedRole && parsed.data.expectedRole !== role) {
          return null;
        }

        const language = (user.language === "zh" ? "zh" : "en") as "en" | "zh";
        const avatarUrl =
          user.teacherProfile?.avatarUrl ??
          user.studentProfile?.avatarUrl ??
          `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

        return {
          id: user.id,
          email: user.email,
          name: displayName,
          image: avatarUrl,
          role,
          language,
          teacherVerified: user.isTeacherVerified
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.language = user.language;
        token.teacherVerified = user.teacherVerified;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "student" | "teacher" | "admin") ?? "student";
        session.user.language = (token.language as "en" | "zh") ?? "en";
        session.user.teacherVerified = Boolean(token.teacherVerified);
      }

      return session;
    }
  }
});
