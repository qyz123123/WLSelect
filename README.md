# WLSelect

WLSelect is a production-style Next.js scaffold for a bilingual school community platform where students review, discuss, and compare teachers and courses.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL schema
- NextAuth-ready dependency set
- Modular domain data layer with demo seed content

## What is included

- LinkedIn-style shell with top search bar, left navigation, and right utility rail
- Bilingual UI structure with immediate English / Chinese switching
- Teacher and course browse pages
- Teacher and course detail pages with ratings, comments, replies, questions, and favorites UX
- Student profile, saved items, comment history, and question history
- Admin management page for moderation and data integrity workflows
- Prisma schema covering users, student profiles, teacher profiles, courses, comments, replies, questions, ratings, favorites, notifications, and moderation logs
- Demo API routes for bootstrap, teachers, courses, comments, and search

## Architecture

- `app/`
  - Route-driven UI pages and API endpoints
- `components/`
  - Shared shell, cards, discussion threads, rating widgets, and bilingual UI helpers
- `lib/`
  - Domain types, demo data, analytics, i18n copy, permissions, and data access helpers
- `prisma/`
  - PostgreSQL schema and seed entry point

## Core flows

1. Student flow
   - Sign up with email and password
   - See privacy warning for account naming
   - Complete grade, system, and course history
   - Browse teachers and courses
   - Post comments, ratings, replies, questions, and favorites
2. Teacher flow
   - Sign up and enter verification workflow
   - Edit profile and assigned courses
   - View only comments marked teacher-visible
   - Add teacher self-ratings
3. Admin flow
   - Manage users and roles
   - Verify teachers
   - Maintain official course list
   - Moderate comments, replies, and questions

## Permission model

- Student
  - Edit own profile, comments, questions
  - Create ratings and favorites
- Teacher
  - Edit own profile
  - Edit assigned courses
  - View teacher-visible comments only when permitted
  - Reply to questions
- Admin
  - Manage users, verification, moderation, and official labels

## API shape

- `GET /api/bootstrap`
  - Returns current user, profile, notifications, teachers, courses, and featured comment data
- `GET /api/teachers?subject=&system=`
  - Filtered teacher list
- `GET /api/courses?grade=&system=`
  - Filtered course list
- `GET /api/search?q=`
  - Search across teachers, courses, comments, and questions
- `GET /api/comments`
  - Demo comment feed

## Database notes

- Prisma schema is ready for PostgreSQL
- Demo UI currently reads from local sample data for immediate usability
- Replace `lib/data.ts` with Prisma-backed queries and authenticated server actions as the next implementation step

## Local setup

1. Install dependencies:
   - `npm install`
2. Start the local Postgres container:
   - `npm run db:up`
3. Use the provided `.env` or copy from `.env.example`
4. Generate Prisma client:
   - `npm run db:generate`
5. Push the schema:
   - `npm run db:push`
6. Seed demo data:
   - `npm run seed`
7. Run the app:
   - `npm run dev`

## Seed data

Demo users, teachers, courses, comments, questions, ratings, favorites, and notifications are inserted by [prisma/seed.ts](/Users/qyz123123/Documents/WLSelect/prisma/seed.ts).

## Demo credentials

- Student: `maya@wlselect.edu` / `Password123!`
- Teacher: `reyes@wlselect.edu` / `Password123!`
- Admin: `admin@wlselect.edu` / `Password123!`
