import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  expectedRole: z.enum(["student", "teacher", "admin"]).optional()
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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        expectedRole: { label: "Expected role", type: "text" }
      },
      authorize: async (rawCredentials) => {
        const parsed = credentialsSchema.safeParse(rawCredentials);

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
