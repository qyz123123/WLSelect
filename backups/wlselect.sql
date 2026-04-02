--
-- PostgreSQL database dump
--

\restrict cvYivb1fTk1IKtNgiUiXuN8TRdocwJdGomgsICjIQQwRecVHnW1PO5u8ARqS7Cn

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."TeacherProfile" DROP CONSTRAINT IF EXISTS "TeacherProfile_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."TeacherCourse" DROP CONSTRAINT IF EXISTS "TeacherCourse_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."TeacherCourse" DROP CONSTRAINT IF EXISTS "TeacherCourse_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentProfile" DROP CONSTRAINT IF EXISTS "StudentProfile_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentCourseRecord" DROP CONSTRAINT IF EXISTS "StudentCourseRecord_profileId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudentCourseRecord" DROP CONSTRAINT IF EXISTS "StudentCourseRecord_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Rating" DROP CONSTRAINT IF EXISTS "Rating_teacherProfileId_fkey";
ALTER TABLE IF EXISTS ONLY public."Rating" DROP CONSTRAINT IF EXISTS "Rating_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Rating" DROP CONSTRAINT IF EXISTS "Rating_commentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Rating" DROP CONSTRAINT IF EXISTS "Rating_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."Question" DROP CONSTRAINT IF EXISTS "Question_teacherProfileId_fkey";
ALTER TABLE IF EXISTS ONLY public."Question" DROP CONSTRAINT IF EXISTS "Question_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Question" DROP CONSTRAINT IF EXISTS "Question_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."QuestionReply" DROP CONSTRAINT IF EXISTS "QuestionReply_questionId_fkey";
ALTER TABLE IF EXISTS ONLY public."QuestionReply" DROP CONSTRAINT IF EXISTS "QuestionReply_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."QuestionReplyLike" DROP CONSTRAINT IF EXISTS "QuestionReplyLike_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."QuestionReplyLike" DROP CONSTRAINT IF EXISTS "QuestionReplyLike_questionReplyId_fkey";
ALTER TABLE IF EXISTS ONLY public."QuestionLike" DROP CONSTRAINT IF EXISTS "QuestionLike_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."QuestionLike" DROP CONSTRAINT IF EXISTS "QuestionLike_questionId_fkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."ModerationLog" DROP CONSTRAINT IF EXISTS "ModerationLog_moderatorId_fkey";
ALTER TABLE IF EXISTS ONLY public."Favorite" DROP CONSTRAINT IF EXISTS "Favorite_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Favorite" DROP CONSTRAINT IF EXISTS "Favorite_teacherProfileId_fkey";
ALTER TABLE IF EXISTS ONLY public."Favorite" DROP CONSTRAINT IF EXISTS "Favorite_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."CourseRequest" DROP CONSTRAINT IF EXISTS "CourseRequest_requesterId_fkey";
ALTER TABLE IF EXISTS ONLY public."Comment" DROP CONSTRAINT IF EXISTS "Comment_teacherProfileId_fkey";
ALTER TABLE IF EXISTS ONLY public."Comment" DROP CONSTRAINT IF EXISTS "Comment_courseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Comment" DROP CONSTRAINT IF EXISTS "Comment_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."CommentReply" DROP CONSTRAINT IF EXISTS "CommentReply_commentId_fkey";
ALTER TABLE IF EXISTS ONLY public."CommentReply" DROP CONSTRAINT IF EXISTS "CommentReply_authorId_fkey";
ALTER TABLE IF EXISTS ONLY public."CommentReplyLike" DROP CONSTRAINT IF EXISTS "CommentReplyLike_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."CommentReplyLike" DROP CONSTRAINT IF EXISTS "CommentReplyLike_commentReplyId_fkey";
ALTER TABLE IF EXISTS ONLY public."CommentLike" DROP CONSTRAINT IF EXISTS "CommentLike_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."CommentLike" DROP CONSTRAINT IF EXISTS "CommentLike_commentId_fkey";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."TeacherProfile_userId_key";
DROP INDEX IF EXISTS public."TeacherCourse_teacherId_courseId_key";
DROP INDEX IF EXISTS public."StudentProfile_userId_key";
DROP INDEX IF EXISTS public."StudentProfile_accountName_key";
DROP INDEX IF EXISTS public."StudentCourseRecord_profileId_courseId_gradeLevel_key";
DROP INDEX IF EXISTS public."Rating_targetType_dimension_idx";
DROP INDEX IF EXISTS public."Rating_guestKey_targetKey_dimension_isTeacherSelf_key";
DROP INDEX IF EXISTS public."Rating_authorId_targetKey_dimension_isTeacherSelf_key";
DROP INDEX IF EXISTS public."QuestionReplyLike_userId_questionReplyId_key";
DROP INDEX IF EXISTS public."QuestionLike_userId_questionId_key";
DROP INDEX IF EXISTS public."Favorite_userId_targetType_idx";
DROP INDEX IF EXISTS public."Favorite_userId_targetKey_key";
DROP INDEX IF EXISTS public."Favorite_guestKey_targetType_idx";
DROP INDEX IF EXISTS public."Favorite_guestKey_targetKey_key";
DROP INDEX IF EXISTS public."Course_slug_key";
DROP INDEX IF EXISTS public."Course_code_key";
DROP INDEX IF EXISTS public."CommentReplyLike_userId_commentReplyId_key";
DROP INDEX IF EXISTS public."CommentLike_userId_commentId_key";
DROP INDEX IF EXISTS public."CommentLike_guestKey_commentId_key";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."TeacherProfile" DROP CONSTRAINT IF EXISTS "TeacherProfile_pkey";
ALTER TABLE IF EXISTS ONLY public."TeacherCourse" DROP CONSTRAINT IF EXISTS "TeacherCourse_pkey";
ALTER TABLE IF EXISTS ONLY public."StudentProfile" DROP CONSTRAINT IF EXISTS "StudentProfile_pkey";
ALTER TABLE IF EXISTS ONLY public."StudentCourseRecord" DROP CONSTRAINT IF EXISTS "StudentCourseRecord_pkey";
ALTER TABLE IF EXISTS ONLY public."Rating" DROP CONSTRAINT IF EXISTS "Rating_pkey";
ALTER TABLE IF EXISTS ONLY public."Question" DROP CONSTRAINT IF EXISTS "Question_pkey";
ALTER TABLE IF EXISTS ONLY public."QuestionReply" DROP CONSTRAINT IF EXISTS "QuestionReply_pkey";
ALTER TABLE IF EXISTS ONLY public."QuestionReplyLike" DROP CONSTRAINT IF EXISTS "QuestionReplyLike_pkey";
ALTER TABLE IF EXISTS ONLY public."QuestionLike" DROP CONSTRAINT IF EXISTS "QuestionLike_pkey";
ALTER TABLE IF EXISTS ONLY public."Notification" DROP CONSTRAINT IF EXISTS "Notification_pkey";
ALTER TABLE IF EXISTS ONLY public."ModerationLog" DROP CONSTRAINT IF EXISTS "ModerationLog_pkey";
ALTER TABLE IF EXISTS ONLY public."Favorite" DROP CONSTRAINT IF EXISTS "Favorite_pkey";
ALTER TABLE IF EXISTS ONLY public."Course" DROP CONSTRAINT IF EXISTS "Course_pkey";
ALTER TABLE IF EXISTS ONLY public."CourseRequest" DROP CONSTRAINT IF EXISTS "CourseRequest_pkey";
ALTER TABLE IF EXISTS ONLY public."Comment" DROP CONSTRAINT IF EXISTS "Comment_pkey";
ALTER TABLE IF EXISTS ONLY public."CommentReply" DROP CONSTRAINT IF EXISTS "CommentReply_pkey";
ALTER TABLE IF EXISTS ONLY public."CommentReplyLike" DROP CONSTRAINT IF EXISTS "CommentReplyLike_pkey";
ALTER TABLE IF EXISTS ONLY public."CommentLike" DROP CONSTRAINT IF EXISTS "CommentLike_pkey";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."TeacherProfile";
DROP TABLE IF EXISTS public."TeacherCourse";
DROP TABLE IF EXISTS public."StudentProfile";
DROP TABLE IF EXISTS public."StudentCourseRecord";
DROP TABLE IF EXISTS public."Rating";
DROP TABLE IF EXISTS public."QuestionReplyLike";
DROP TABLE IF EXISTS public."QuestionReply";
DROP TABLE IF EXISTS public."QuestionLike";
DROP TABLE IF EXISTS public."Question";
DROP TABLE IF EXISTS public."Notification";
DROP TABLE IF EXISTS public."ModerationLog";
DROP TABLE IF EXISTS public."Favorite";
DROP TABLE IF EXISTS public."CourseRequest";
DROP TABLE IF EXISTS public."Course";
DROP TABLE IF EXISTS public."CommentReplyLike";
DROP TABLE IF EXISTS public."CommentReply";
DROP TABLE IF EXISTS public."CommentLike";
DROP TABLE IF EXISTS public."Comment";
DROP TYPE IF EXISTS public."Visibility";
DROP TYPE IF EXISTS public."UserRole";
DROP TYPE IF EXISTS public."TargetType";
DROP TYPE IF EXISTS public."ModerationAction";
DROP TYPE IF EXISTS public."InteractionKind";
DROP TYPE IF EXISTS public."GradeLevel";
DROP TYPE IF EXISTS public."CourseSystem";
DROP TYPE IF EXISTS public."CourseRequestStatus";
--
-- Name: CourseRequestStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CourseRequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."CourseRequestStatus" OWNER TO postgres;

--
-- Name: CourseSystem; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CourseSystem" AS ENUM (
    'AP',
    'AL',
    'GENERAL'
);


ALTER TYPE public."CourseSystem" OWNER TO postgres;

--
-- Name: GradeLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."GradeLevel" AS ENUM (
    'G9',
    'G10',
    'G11',
    'G12'
);


ALTER TYPE public."GradeLevel" OWNER TO postgres;

--
-- Name: InteractionKind; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InteractionKind" AS ENUM (
    'COMMENT',
    'QUESTION'
);


ALTER TYPE public."InteractionKind" OWNER TO postgres;

--
-- Name: ModerationAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ModerationAction" AS ENUM (
    'REMOVE',
    'HIDE',
    'WARN',
    'VERIFY_TEACHER',
    'CHANGE_ROLE'
);


ALTER TYPE public."ModerationAction" OWNER TO postgres;

--
-- Name: TargetType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TargetType" AS ENUM (
    'TEACHER',
    'COURSE'
);


ALTER TYPE public."TargetType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'STUDENT',
    'TEACHER',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: Visibility; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Visibility" AS ENUM (
    'PUBLIC_ONLY',
    'PUBLIC_AND_TEACHER'
);


ALTER TYPE public."Visibility" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Comment" (
    id text NOT NULL,
    "authorId" text,
    "targetType" public."TargetType" NOT NULL,
    "teacherProfileId" text,
    "courseId" text,
    title text,
    body text NOT NULL,
    visibility public."Visibility" DEFAULT 'PUBLIC_ONLY'::public."Visibility" NOT NULL,
    "isAnonymous" boolean DEFAULT true NOT NULL,
    "isReported" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "guestKey" text,
    "guestName" text
);


ALTER TABLE public."Comment" OWNER TO postgres;

--
-- Name: CommentLike; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CommentLike" (
    id text NOT NULL,
    "userId" text,
    "commentId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "guestKey" text
);


ALTER TABLE public."CommentLike" OWNER TO postgres;

--
-- Name: CommentReply; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CommentReply" (
    id text NOT NULL,
    "commentId" text NOT NULL,
    "authorId" text,
    body text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "guestKey" text,
    "guestName" text
);


ALTER TABLE public."CommentReply" OWNER TO postgres;

--
-- Name: CommentReplyLike; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CommentReplyLike" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "commentReplyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CommentReplyLike" OWNER TO postgres;

--
-- Name: Course; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Course" (
    id text NOT NULL,
    slug text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    "gradeLevels" public."GradeLevel"[],
    system public."CourseSystem" NOT NULL,
    prerequisites text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Course" OWNER TO postgres;

--
-- Name: CourseRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CourseRequest" (
    id text NOT NULL,
    "requesterId" text,
    "requesterName" text,
    "requesterEmail" text,
    name text NOT NULL,
    subject text NOT NULL,
    system public."CourseSystem",
    "gradeLevels" public."GradeLevel"[],
    notes text,
    status public."CourseRequestStatus" DEFAULT 'PENDING'::public."CourseRequestStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CourseRequest" OWNER TO postgres;

--
-- Name: Favorite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Favorite" (
    id text NOT NULL,
    "userId" text,
    "targetType" public."TargetType" NOT NULL,
    "teacherProfileId" text,
    "courseId" text,
    "targetKey" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "guestKey" text
);


ALTER TABLE public."Favorite" OWNER TO postgres;

--
-- Name: ModerationLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ModerationLog" (
    id text NOT NULL,
    "moderatorId" text NOT NULL,
    action public."ModerationAction" NOT NULL,
    "targetType" public."InteractionKind",
    "targetId" text,
    details text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ModerationLog" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    href text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Question" (
    id text NOT NULL,
    "authorId" text,
    "targetType" public."TargetType" NOT NULL,
    "teacherProfileId" text,
    "courseId" text,
    title text NOT NULL,
    body text NOT NULL,
    "isAnswered" boolean DEFAULT false NOT NULL,
    "isAnonymous" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "guestKey" text,
    "guestName" text
);


ALTER TABLE public."Question" OWNER TO postgres;

--
-- Name: QuestionLike; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."QuestionLike" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "questionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."QuestionLike" OWNER TO postgres;

--
-- Name: QuestionReply; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."QuestionReply" (
    id text NOT NULL,
    "questionId" text NOT NULL,
    "authorId" text NOT NULL,
    body text NOT NULL,
    "isAccepted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."QuestionReply" OWNER TO postgres;

--
-- Name: QuestionReplyLike; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."QuestionReplyLike" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "questionReplyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."QuestionReplyLike" OWNER TO postgres;

--
-- Name: Rating; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Rating" (
    id text NOT NULL,
    "authorId" text,
    "targetType" public."TargetType" NOT NULL,
    "teacherProfileId" text,
    "courseId" text,
    "commentId" text,
    "targetKey" text NOT NULL,
    dimension text NOT NULL,
    score integer NOT NULL,
    "isTeacherSelf" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "guestKey" text
);


ALTER TABLE public."Rating" OWNER TO postgres;

--
-- Name: StudentCourseRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StudentCourseRecord" (
    id text NOT NULL,
    "profileId" text NOT NULL,
    "courseId" text NOT NULL,
    "gradeLevel" public."GradeLevel" NOT NULL
);


ALTER TABLE public."StudentCourseRecord" OWNER TO postgres;

--
-- Name: StudentProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StudentProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "accountName" text NOT NULL,
    "privacyNoticeAt" timestamp(3) without time zone,
    "gradeLevel" public."GradeLevel" NOT NULL,
    "courseSystem" public."CourseSystem" NOT NULL,
    bio text,
    "avatarUrl" text
);


ALTER TABLE public."StudentProfile" OWNER TO postgres;

--
-- Name: TeacherCourse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TeacherCourse" (
    id text NOT NULL,
    "teacherId" text NOT NULL,
    "courseId" text NOT NULL,
    "canEdit" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."TeacherCourse" OWNER TO postgres;

--
-- Name: TeacherProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TeacherProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "displayName" text NOT NULL,
    department text NOT NULL,
    "subjectArea" text NOT NULL,
    "shortBio" text,
    "teachingStyle" text,
    "avatarUrl" text,
    "officeHours" text,
    "courseHighlights" text
);


ALTER TABLE public."TeacherProfile" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."UserRole" NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    "isTeacherVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Comment" (id, "authorId", "targetType", "teacherProfileId", "courseId", title, body, visibility, "isAnonymous", "isReported", "createdAt", "updatedAt", "guestKey", "guestName") FROM stdin;
cmnhipncy0003x3ykik56lciz	\N	COURSE	\N	cmnh794hs0021x3ovth93wre3	这个课好难啊😭\n救命谁在学	这个课好难啊😭\n救命谁在学	PUBLIC_ONLY	t	f	2026-04-02 13:35:58.595	2026-04-02 13:35:58.595	64e5c53a-5060-4170-bb5f-5f3453ac0a3c	游客1676
\.


--
-- Data for Name: CommentLike; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CommentLike" (id, "userId", "commentId", "createdAt", "guestKey") FROM stdin;
\.


--
-- Data for Name: CommentReply; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CommentReply" (id, "commentId", "authorId", body, "createdAt", "updatedAt", "guestKey", "guestName") FROM stdin;
\.


--
-- Data for Name: CommentReplyLike; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CommentReplyLike" (id, "userId", "commentReplyId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Course" (id, slug, code, name, subject, description, "gradeLevels", system, prerequisites, "createdAt", "updatedAt") FROM stdin;
cmnh794hr001mx3ovzjr0ogho	ap-chemistry-grade-11	AP-CHEMISTRY-GRADE-11	AP Chemistry	Chemistry	AP Chemistry for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001nx3ovcr4qxs47	ap-biology-grade-11	AP-BIOLOGY-GRADE-11	AP Biology	Biology	AP Biology for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001ox3ov7paafjlm	physiology-and-ecology-grade-11	PHYSIOLOGY-AND-ECOLOGY-GRADE-11	Physiology and Ecology	Biology	Physiology and Ecology for Grade 11 students. Regular track.	{G11}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001px3ovz559d2b8	ap-environmental-science-grade-11	AP-ENVIRONMENTAL-SCIENCE-GRADE-11	AP Environmental Science	Biology	AP Environmental Science for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001qx3ovuaednu0x	ap-studio-art-grade-11	AP-STUDIO-ART-GRADE-11	AP Studio Art	Arts	AP Studio Art for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs001rx3ov4zkdsyt7	ap-art-history-grade-11	AP-ART-HISTORY-GRADE-11	AP Art History	Humanities	AP Art History for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs001sx3ovc9vo8qnw	world-theatre-studies-grade-11	WORLD-THEATRE-STUDIES-GRADE-11	World Theatre Studies	Arts	World Theatre Studies for Grade 11 students. Regular track.	{G11}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs001tx3ovul9ha92c	ap-music-theory-grade-11	AP-MUSIC-THEORY-GRADE-11	AP Music Theory	Arts	AP Music Theory for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs001ux3ovb5s61lr2	united-states-history-ii-grade-11	UNITED-STATES-HISTORY-II-GRADE-11	United States History II	Humanities	United States History II for Grade 11 students. Regular track.	{G11}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs001vx3ovh27lbt8p	world-history-ii-grade-11	WORLD-HISTORY-II-GRADE-11	World History II	Humanities	World History II for Grade 11 students. Regular track.	{G11}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs001wx3ovefpsuuvf	ap-united-states-history-grade-11	AP-UNITED-STATES-HISTORY-GRADE-11	AP United States History	Humanities	AP United States History for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs001xx3ov5xmo6wqu	ap-world-history-grade-11	AP-WORLD-HISTORY-GRADE-11	AP World History	Humanities	AP World History for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs001yx3ov1j7tzhhk	ap-human-geography-grade-11	AP-HUMAN-GEOGRAPHY-GRADE-11	AP Human Geography	Humanities	AP Human Geography for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs001zx3ovl49z5esp	ap-european-history-grade-11	AP-EUROPEAN-HISTORY-GRADE-11	AP European History	Humanities	AP European History for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs0020x3ovp57hpyes	ap-computer-science-a-grade-11	AP-COMPUTER-SCIENCE-A-GRADE-11	AP Computer Science A	Computer Science	AP Computer Science A for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs0021x3ovth93wre3	adv-artificial-intelligence-grade-11	ADV-ARTIFICIAL-INTELLIGENCE-GRADE-11	Adv. Artificial Intelligence	Computer Science	Adv. Artificial Intelligence for Grade 11 students. Advanced track.	{G11}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs0022x3ov2aukabe2	ap-psychology-grade-11	AP-PSYCHOLOGY-GRADE-11	AP Psychology	Psychology	AP Psychology for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs0023x3ovwts6herx	ap-comparative-government-and-politics-grade-11	AP-COMPARATIVE-GOVERNMENT-AND-POLITICS-GRADE-11	AP Comparative Government & Politics	Humanities	AP Comparative Government & Politics for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs0024x3ovvia1uyr3	ap-micro-economics-grade-11	AP-MICRO-ECONOMICS-GRADE-11	AP Micro-Economics	Economics	AP Micro-Economics for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs0025x3ovhnmtpj5u	ap-macro-economics-grade-11	AP-MACRO-ECONOMICS-GRADE-11	AP Macro-Economics	Economics	AP Macro-Economics for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs0026x3ovzw8qjpue	adv-differential-equations-and-graph-theory-grade-11	ADV-DIFFERENTIAL-EQUATIONS-AND-GRAPH-THEORY-GRADE-11	Adv. Differential Equations & Graph Theory	General Studies	Adv. Differential Equations & Graph Theory for Grade 11 students. Advanced track.	{G11}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs0027x3ov42uj5rlu	college-preparatory-english-grade-10	COLLEGE-PREPARATORY-ENGLISH-GRADE-10	College Preparatory English	English	College Preparatory English for Grade 10 students. Regular track.	{G10}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs0028x3ovwue6qtb8	pre-ap-english-grade-10	PRE-AP-ENGLISH-GRADE-10	Pre-AP English	English	Pre-AP English for Grade 10 students. Advanced track.	{G10}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0000x3ovsa8dkyyl	adv-expansive-english-grade-12	ADV-EXPANSIVE-ENGLISH-GRADE-12	Adv. Expansive English	English	Adv. Expansive English for Grade 12 students. Advanced track.	{G12}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0001x3ovhcsh42en	ap-english-literature-and-composition-grade-12	AP-ENGLISH-LITERATURE-AND-COMPOSITION-GRADE-12	AP English Literature & Composition	English	AP English Literature & Composition for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0002x3ovv3amkvru	chinese-iii-grade-12	CHINESE-III-GRADE-12	Chinese III	Chinese	Chinese III for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0003x3overuwg6q5	chinese-strategy-grade-12	CHINESE-STRATEGY-GRADE-12	Chinese Strategy	Chinese	Chinese Strategy for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0004x3ov4j6sbx8o	ap-research-grade-12	AP-RESEARCH-GRADE-12	AP Research	Interdisciplinary Studies	AP Research for Grade 12 students. Discussion track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0005x3ovl9cxpinw	humanities-labs-grade-12	HUMANITIES-LABS-GRADE-12	Humanities Labs	Interdisciplinary Studies	Humanities Labs for Grade 12 students. Discussion track.	{G12}	GENERAL	Participation and seminar-style discussion expected.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0006x3ovquirfj5j	assimilation-and-differences-across-societies-grade-12	ASSIMILATION-AND-DIFFERENCES-ACROSS-SOCIETIES-GRADE-12	Assimilation and Differences Across Societies	Humanities	Assimilation and Differences Across Societies for Grade 12 students. Discussion track.	{G12}	GENERAL	Participation and seminar-style discussion expected.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0007x3ovvqi85re3	cross-cultural-philosophy-and-ethics-grade-12	CROSS-CULTURAL-PHILOSOPHY-AND-ETHICS-GRADE-12	Cross-Cultural Philosophy and Ethics	Humanities	Cross-Cultural Philosophy and Ethics for Grade 12 students. Discussion track.	{G12}	GENERAL	Participation and seminar-style discussion expected.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0008x3ovqio99w9t	contemporary-china-grade-12	CONTEMPORARY-CHINA-GRADE-12	Contemporary China	Humanities	Contemporary China for Grade 12 students. Discussion track.	{G12}	GENERAL	Participation and seminar-style discussion expected.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0009x3ovkjez4t3h	general-math-grade-12	GENERAL-MATH-GRADE-12	General Math	Mathematics	General Math for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000ax3ovu7gxv9gt	ap-calculus-ab-grade-12	AP-CALCULUS-AB-GRADE-12	AP Calculus AB	Mathematics	AP Calculus AB for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000bx3ovy9naz08l	ap-statistics-grade-12	AP-STATISTICS-GRADE-12	AP Statistics	Mathematics	AP Statistics for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000cx3ovmaqwixt1	adv-linear-algebra-and-group-theory-grade-12	ADV-LINEAR-ALGEBRA-AND-GROUP-THEORY-GRADE-12	Adv. Linear Algebra and Group Theory	Mathematics	Adv. Linear Algebra and Group Theory for Grade 12 students. Advanced track.	{G12}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000dx3ovo0d7ug78	multivariable-calculus-grade-12	MULTIVARIABLE-CALCULUS-GRADE-12	Multivariable Calculus	Mathematics	Multivariable Calculus for Grade 12 students. Advanced track.	{G12}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000ex3ov4z80p9us	pe-grade-12	PE-GRADE-12	PE	Physical Education	PE for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000fx3ovaxjsyecr	career-readiness-grade-12	CAREER-READINESS-GRADE-12	Career Readiness	College and Career	Career Readiness for Grade 12 students.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000gx3ovea3cqceh	ap-cybersecurity-grade-12	AP-CYBERSECURITY-GRADE-12	AP Cybersecurity	Computer Science	AP Cybersecurity for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000hx3ova32x8v7a	adv-further-physics-grade-12	ADV-FURTHER-PHYSICS-GRADE-12	Adv. Further Physics	Physics	Adv. Further Physics for Grade 12 students. Advanced track.	{G12}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000ix3ovw8m7okka	adv-data-analyze-in-physics-grade-12	ADV-DATA-ANALYZE-IN-PHYSICS-GRADE-12	Adv. Data Analyze in Physics	Physics	Adv. Data Analyze in Physics for Grade 12 students. Advanced track.	{G12}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000jx3ovqggm21ws	adv-introduction-to-modern-astrophysics-grade-12	ADV-INTRODUCTION-TO-MODERN-ASTROPHYSICS-GRADE-12	Adv. Introduction to Modern Astrophysics	Physics	Adv. Introduction to Modern Astrophysics for Grade 12 students. Advanced track.	{G12}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000kx3ovz81f31sx	ap-chemistry-grade-12	AP-CHEMISTRY-GRADE-12	AP Chemistry	Chemistry	AP Chemistry for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000lx3ovvyncqhc2	adv-organic-chemistry-grade-12	ADV-ORGANIC-CHEMISTRY-GRADE-12	Adv. Organic Chemistry	Chemistry	Adv. Organic Chemistry for Grade 12 students. Advanced track.	{G12}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000mx3ov27b9equl	practical-and-research-chemistry-grade-12	PRACTICAL-AND-RESEARCH-CHEMISTRY-GRADE-12	Practical & Research Chemistry	Chemistry	Practical & Research Chemistry for Grade 12 students. Advanced track.	{G12}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000nx3ovlidfucft	adv-genetic-analysis-grade-12	ADV-GENETIC-ANALYSIS-GRADE-12	Adv. Genetic Analysis	Biology	Adv. Genetic Analysis for Grade 12 students. Advanced track.	{G12}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000ox3ovl46eykmk	ap-biology-grade-12	AP-BIOLOGY-GRADE-12	AP Biology	Biology	AP Biology for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000px3ovltvcgxoc	general-biology-grade-12	GENERAL-BIOLOGY-GRADE-12	General Biology	Biology	General Biology for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs0029x3ovyqs30h36	chinese-i-chinese-literature-grade-10	CHINESE-I-CHINESE-LITERATURE-GRADE-10	Chinese I (Chinese Literature)	Chinese	Chinese I (Chinese Literature) for Grade 10 students. Regular track.	{G10}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000qx3ovtm42jr8g	ap-environmental-science-grade-12	AP-ENVIRONMENTAL-SCIENCE-GRADE-12	AP Environmental Science	Biology	AP Environmental Science for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000rx3ov2anx6uo0	ap-macro-economics-grade-12	AP-MACRO-ECONOMICS-GRADE-12	AP Macro-Economics	Economics	AP Macro-Economics for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000sx3ov0mv3dilv	ap-human-geography-grade-12	AP-HUMAN-GEOGRAPHY-GRADE-12	AP Human Geography	Humanities	AP Human Geography for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000tx3ov3lb4f16g	history-of-ideas-revolution-and-change-grade-12	HISTORY-OF-IDEAS-REVOLUTION-AND-CHANGE-GRADE-12	History of Ideas: Revolution and Change	Humanities	History of Ideas: Revolution and Change for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000ux3ovc7dzeq9u	gender-studies-grade-12	GENDER-STUDIES-GRADE-12	Gender Studies	Humanities	Gender Studies for Grade 12 students. Advanced track.	{G12}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000vx3ov06jpq2l4	ap-european-history-grade-12	AP-EUROPEAN-HISTORY-GRADE-12	AP European History	Humanities	AP European History for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000wx3ovpx4rv4dm	the-anthropology-of-consumption-culture-power-and-transformation-grade-12	THE-ANTHROPOLOGY-OF-CONSUMPTION-CULTURE-POWER-AND-TRANSFORMATION-GRADE-12	The Anthropology of Consumption: Culture, Power, and Transformation	Humanities	The Anthropology of Consumption: Culture, Power, and Transformation for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000xx3ov1lu6ezva	ap-comparative-government-and-politics-grade-12	AP-COMPARATIVE-GOVERNMENT-AND-POLITICS-GRADE-12	AP Comparative Government & Politics	Humanities	AP Comparative Government & Politics for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000yx3ovmt1vy03y	introduction-to-french-language-and-culture-grade-12	INTRODUCTION-TO-FRENCH-LANGUAGE-AND-CULTURE-GRADE-12	Introduction to French Language and Culture	World Languages	Introduction to French Language and Culture for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr000zx3ovarl72v1z	introduction-to-japanese-language-and-culture-grade-12	INTRODUCTION-TO-JAPANESE-LANGUAGE-AND-CULTURE-GRADE-12	Introduction to Japanese Language and Culture	World Languages	Introduction to Japanese Language and Culture for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0010x3ov632ah4q7	introduction-to-spanish-language-and-culture-grade-12	INTRODUCTION-TO-SPANISH-LANGUAGE-AND-CULTURE-GRADE-12	Introduction to Spanish Language and Culture	World Languages	Introduction to Spanish Language and Culture for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0011x3ovpm79vpen	ap-psychology-grade-12	AP-PSYCHOLOGY-GRADE-12	AP Psychology	Psychology	AP Psychology for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0012x3ovcu7kl911	visual-art-grade-12	VISUAL-ART-GRADE-12	Visual Art	Arts	Visual Art for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0013x3ovb9ebecfh	film-production-grade-12	FILM-PRODUCTION-GRADE-12	Film Production	Arts	Film Production for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0014x3ovnsy5dvwr	ap-art-history-grade-12	AP-ART-HISTORY-GRADE-12	AP Art History	Humanities	AP Art History for Grade 12 students. Advanced track.	{G12}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0015x3ovih2mlu4o	architecture-foundation-grade-12	ARCHITECTURE-FOUNDATION-GRADE-12	Architecture Foundation	Arts	Architecture Foundation for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0016x3ovq4hnhv2q	advanced-theatre-grade-12	ADVANCED-THEATRE-GRADE-12	Advanced Theatre	Arts	Advanced Theatre for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0017x3ovm9vebk41	music-performance-grade-12	MUSIC-PERFORMANCE-GRADE-12	Music Performance	Arts	Music Performance for Grade 12 students. Regular track.	{G12}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0018x3ov7fuldkj1	adv-english-grade-11	ADV-ENGLISH-GRADE-11	Adv. English	English	Adv. English for Grade 11 students. Advanced track.	{G11}	GENERAL	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr0019x3ovmxop7inx	ap-english-language-and-composition-grade-11	AP-ENGLISH-LANGUAGE-AND-COMPOSITION-GRADE-11	AP English Language & Composition	English	AP English Language & Composition for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001ax3ovwu931exc	chinese-ii-chinese-literature-grade-11	CHINESE-II-CHINESE-LITERATURE-GRADE-11	Chinese II (Chinese Literature)	Chinese	Chinese II (Chinese Literature) for Grade 11 students. Regular track.	{G11}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001bx3ovf0q8llq7	ap-seminar-grade-11	AP-SEMINAR-GRADE-11	AP Seminar	General Studies	AP Seminar for Grade 11 students. Discussion track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001cx3ov3zao8ylb	colloquy-grade-11	COLLOQUY-GRADE-11	Colloquy	Interdisciplinary Studies	Colloquy for Grade 11 students. Discussion track.	{G11}	GENERAL	Participation and seminar-style discussion expected.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001dx3ovepe685dl	cross-cultural-leadership-program-grade-11	CROSS-CULTURAL-LEADERSHIP-PROGRAM-GRADE-11	Cross-Cultural Leadership Program	Interdisciplinary Studies	Cross-Cultural Leadership Program for Grade 11 students. Discussion track.	{G11}	GENERAL	Participation and seminar-style discussion expected.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001ex3ov7b7yx4u9	ap-calculus-ab-grade-11	AP-CALCULUS-AB-GRADE-11	AP Calculus AB	Mathematics	AP Calculus AB for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001fx3ov20qw0ohn	ap-calculus-bc-grade-11	AP-CALCULUS-BC-GRADE-11	AP Calculus BC	Mathematics	AP Calculus BC for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001gx3ovq1bit7ld	ap-statistics-grade-11	AP-STATISTICS-GRADE-11	AP Statistics	Mathematics	AP Statistics for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001hx3ovo933t58s	pe-grade-11	PE-GRADE-11	PE	Physical Education	PE for Grade 11 students. Regular track.	{G11}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001ix3ovgivdrv74	career-readiness-grade-11	CAREER-READINESS-GRADE-11	Career Readiness	College and Career	Career Readiness for Grade 11 students.	{G11}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001jx3ovkqlhtn7p	ap-physics-c-mechanics-grade-11	AP-PHYSICS-C-MECHANICS-GRADE-11	AP Physics C: Mechanics	Physics	AP Physics C: Mechanics for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001kx3ovxu9muaa4	ap-physics-c-electricity-and-magnetism-grade-11	AP-PHYSICS-C-ELECTRICITY-AND-MAGNETISM-GRADE-11	AP Physics C: Electricity & Magnetism	Physics	AP Physics C: Electricity & Magnetism for Grade 11 students. Advanced track.	{G11}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hr001lx3ov8cbi3i65	general-chemistry-grade-11	GENERAL-CHEMISTRY-GRADE-11	General Chemistry	Chemistry	General Chemistry for Grade 11 students. Regular track.	{G11}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002ax3ovdka3t3jd	sdp-grade-10	SDP-GRADE-10	SDP	Interdisciplinary Studies	SDP for Grade 10 students. Discussion track.	{G10}	GENERAL	Participation and seminar-style discussion expected.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002bx3ovrj0aco1r	colloquy-grade-10	COLLOQUY-GRADE-10	Colloquy	Interdisciplinary Studies	Colloquy for Grade 10 students. Discussion track.	{G10}	GENERAL	Participation and seminar-style discussion expected.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002cx3ovy66nhjnv	ap-pre-calculus-grade-10	AP-PRE-CALCULUS-GRADE-10	AP Pre-Calculus	Mathematics	AP Pre-Calculus for Grade 10 students. Regular track.	{G10}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002dx3ov8fgoqhiu	college-algebra-grade-10	COLLEGE-ALGEBRA-GRADE-10	College Algebra	Mathematics	College Algebra for Grade 10 students. Regular track.	{G10}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002ex3ov2hcs5ux5	pe-grade-10	PE-GRADE-10	PE	Physical Education	PE for Grade 10 students. Regular track.	{G10}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002fx3ov49dsi9ps	career-readiness-grade-10	CAREER-READINESS-GRADE-10	Career Readiness	College and Career	Career Readiness for Grade 10 students.	{G10}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002gx3ov0bj1eh8d	general-physics-grade-10	GENERAL-PHYSICS-GRADE-10	General Physics	Physics	General Physics for Grade 10 students. Regular track.	{G10}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002hx3ovb6f1a4cy	ap-physics-1-grade-10	AP-PHYSICS-1-GRADE-10	AP Physics 1	Physics	AP Physics 1 for Grade 10 students. Advanced track.	{G10}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002ix3ovme4sx5js	pre-ap-chemistry-grade-10	PRE-AP-CHEMISTRY-GRADE-10	Pre-AP Chemistry	Chemistry	Pre-AP Chemistry for Grade 10 students. Regular track.	{G10}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002jx3ovw5rcjf89	pre-ap-biology-grade-10	PRE-AP-BIOLOGY-GRADE-10	Pre-AP Biology	Biology	Pre-AP Biology for Grade 10 students. Regular track.	{G10}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002kx3ov28br422j	art-grade-10	ART-GRADE-10	Art	Arts	Art for Grade 10 students. Regular track.	{G10}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002lx3ovh6b0yhac	drama-grade-10	DRAMA-GRADE-10	Drama	Arts	Drama for Grade 10 students. Regular track.	{G10}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002mx3ovi3djk8mf	music-grade-10	MUSIC-GRADE-10	Music	Arts	Music for Grade 10 students. Regular track.	{G10}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002nx3ovpp9rurm6	u-s-history-i-grade-10	U-S-HISTORY-I-GRADE-10	U.S. History I	Humanities	U.S. History I for Grade 10 students. Regular track.	{G10}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002ox3ovh26vwgu9	world-history-i-grade-10	WORLD-HISTORY-I-GRADE-10	World History I	Humanities	World History I for Grade 10 students. Regular track.	{G10}	GENERAL	None.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002px3ovce4nijmd	ap-computer-science-principles-grade-10	AP-COMPUTER-SCIENCE-PRINCIPLES-GRADE-10	AP Computer Science Principles	Computer Science	AP Computer Science Principles for Grade 10 students. Advanced track.	{G10}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002qx3ov3e69dhzb	ap-micro-economics-grade-10	AP-MICRO-ECONOMICS-GRADE-10	AP Micro-Economics	Economics	AP Micro-Economics for Grade 10 students. Advanced track.	{G10}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
cmnh794hs002rx3ovgzle8nkh	pre-ap-psychology-grade-10	PRE-AP-PSYCHOLOGY-GRADE-10	Pre-AP Psychology	Psychology	Pre-AP Psychology for Grade 10 students. Regular track.	{G10}	AP	Prior coursework or department approval recommended.	2026-04-02 08:15:11.871	2026-04-02 08:15:11.871
\.


--
-- Data for Name: CourseRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CourseRequest" (id, "requesterId", "requesterName", "requesterEmail", name, subject, system, "gradeLevels", notes, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Favorite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Favorite" (id, "userId", "targetType", "teacherProfileId", "courseId", "targetKey", "createdAt", "guestKey") FROM stdin;
cmnhhh2pe0001x3zwvrhk7zcm	\N	TEACHER	cmnh7edb30001x3prkrbmx5n1	\N	TEACHER:cmnh7edb30001x3prkrbmx5n1	2026-04-02 13:01:18.962	64e5c53a-5060-4170-bb5f-5f3453ac0a3c
cmnhip7130001x3yky98mp371	\N	COURSE	\N	cmnh794hs0021x3ovth93wre3	COURSE:cmnh794hs0021x3ovth93wre3	2026-04-02 13:35:37.431	64e5c53a-5060-4170-bb5f-5f3453ac0a3c
\.


--
-- Data for Name: ModerationLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ModerationLog" (id, "moderatorId", action, "targetType", "targetId", details, "createdAt") FROM stdin;
cmnh7945n0018x3obmwe7s1rt	user-admin-1	WARN	COMMENT	comment-2	Community privacy reminder added to thread.	2026-04-02 08:15:11.436
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", title, body, href, "isRead", "createdAt") FROM stdin;
cmnh7945m0014x3oblxyeop8y	user-student-1	Your question received a new answer	Dr. Sofia Reyes replied on AP Physics 1.	/courses/ap-physics-1	f	2026-04-02 08:15:11.435
cmnh7945m0015x3ob7zunuvvo	user-student-1	Comment moderation reminder	Community guidelines now appear before posting.	/me/comments	t	2026-04-02 08:15:11.435
\.


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Question" (id, "authorId", "targetType", "teacherProfileId", "courseId", title, body, "isAnswered", "isAnonymous", "createdAt", "updatedAt", "guestKey", "guestName") FROM stdin;
\.


--
-- Data for Name: QuestionLike; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."QuestionLike" (id, "userId", "questionId", "createdAt") FROM stdin;
\.


--
-- Data for Name: QuestionReply; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."QuestionReply" (id, "questionId", "authorId", body, "isAccepted", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: QuestionReplyLike; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."QuestionReplyLike" (id, "userId", "questionReplyId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Rating; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Rating" (id, "authorId", "targetType", "teacherProfileId", "courseId", "commentId", "targetKey", dimension, score, "isTeacherSelf", "createdAt", "guestKey") FROM stdin;
\.


--
-- Data for Name: StudentCourseRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StudentCourseRecord" (id, "profileId", "courseId", "gradeLevel") FROM stdin;
\.


--
-- Data for Name: StudentProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StudentProfile" (id, "userId", "accountName", "privacyNoticeAt", "gradeLevel", "courseSystem", bio, "avatarUrl") FROM stdin;
student-profile-1	user-student-1	quietlibrary	2026-04-02 08:15:11.397	G11	AP	Interested in physics, economics, and writing-intensive courses.	https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80
student-profile-2	user-student-2	graphpaper	2026-04-02 08:15:11.403	G12	AL	Prefers organized classes with clear grading and strong feedback loops.	https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80
cmnhj1if10005x3ykuikjboxj	cmnhj1if10004x3yk5zsiyzu5	yunzhe1234	2026-04-02 13:45:12.06	G11	AP		\N
\.


--
-- Data for Name: TeacherCourse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TeacherCourse" (id, "teacherId", "courseId", "canEdit") FROM stdin;
cmnh7edb30003x3pr10n8z441	cmnh7edb30001x3prkrbmx5n1	cmnh794hs001rx3ov4zkdsyt7	t
\.


--
-- Data for Name: TeacherProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TeacherProfile" (id, "userId", "displayName", department, "subjectArea", "shortBio", "teachingStyle", "avatarUrl", "officeHours", "courseHighlights") FROM stdin;
cmnh7edb30001x3prkrbmx5n1	cmnh7edb30000x3prkab49zb5	Oliver Jin	Unassigned	Unassigned	上劳金的课你摸鱼了吗？		\N	\N	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, "passwordHash", role, language, "isTeacherVerified", "createdAt", "updatedAt") FROM stdin;
user-student-1	maya@wlselect.edu	$2a$12$XShQcpo1VNAAZHcq9hna/u8C2Z/dwGtdGCyuVHsYhqLZ1utqsCNbq	STUDENT	en	f	2026-04-02 08:15:11.399	2026-04-02 08:15:11.399
user-student-2	liam@wlselect.edu	$2a$12$XShQcpo1VNAAZHcq9hna/u8C2Z/dwGtdGCyuVHsYhqLZ1utqsCNbq	STUDENT	zh	f	2026-04-02 08:15:11.403	2026-04-02 08:15:11.403
user-admin-1	admin@wlselect.edu	$2a$12$XShQcpo1VNAAZHcq9hna/u8C2Z/dwGtdGCyuVHsYhqLZ1utqsCNbq	ADMIN	en	f	2026-04-02 08:15:11.409	2026-04-02 08:15:11.409
cmnh7edb30000x3prkab49zb5	oliver.jin.bf9a5265-8996-41b2-a018-5db2415b5da3@wlselect.local	__teacher_name_login__	TEACHER	zh	f	2026-04-02 08:19:16.576	2026-04-02 08:19:16.576
cmnhj1if10004x3yk5zsiyzu5	m18396870715@gmail.com	$2a$12$jO3K.uVSoVHMHIWyrXeRkuvBVwEhnccI6ox8NkaDIdSDjR8DnFcn6	STUDENT	zh	f	2026-04-02 13:45:12.061	2026-04-02 13:45:12.061
\.


--
-- Name: CommentLike CommentLike_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommentLike"
    ADD CONSTRAINT "CommentLike_pkey" PRIMARY KEY (id);


--
-- Name: CommentReplyLike CommentReplyLike_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommentReplyLike"
    ADD CONSTRAINT "CommentReplyLike_pkey" PRIMARY KEY (id);


--
-- Name: CommentReply CommentReply_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommentReply"
    ADD CONSTRAINT "CommentReply_pkey" PRIMARY KEY (id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: CourseRequest CourseRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseRequest"
    ADD CONSTRAINT "CourseRequest_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: Favorite Favorite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY (id);


--
-- Name: ModerationLog ModerationLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModerationLog"
    ADD CONSTRAINT "ModerationLog_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: QuestionLike QuestionLike_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionLike"
    ADD CONSTRAINT "QuestionLike_pkey" PRIMARY KEY (id);


--
-- Name: QuestionReplyLike QuestionReplyLike_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionReplyLike"
    ADD CONSTRAINT "QuestionReplyLike_pkey" PRIMARY KEY (id);


--
-- Name: QuestionReply QuestionReply_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionReply"
    ADD CONSTRAINT "QuestionReply_pkey" PRIMARY KEY (id);


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- Name: Rating Rating_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_pkey" PRIMARY KEY (id);


--
-- Name: StudentCourseRecord StudentCourseRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentCourseRecord"
    ADD CONSTRAINT "StudentCourseRecord_pkey" PRIMARY KEY (id);


--
-- Name: StudentProfile StudentProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentProfile"
    ADD CONSTRAINT "StudentProfile_pkey" PRIMARY KEY (id);


--
-- Name: TeacherCourse TeacherCourse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TeacherCourse"
    ADD CONSTRAINT "TeacherCourse_pkey" PRIMARY KEY (id);


--
-- Name: TeacherProfile TeacherProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TeacherProfile"
    ADD CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: CommentLike_guestKey_commentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CommentLike_guestKey_commentId_key" ON public."CommentLike" USING btree ("guestKey", "commentId");


--
-- Name: CommentLike_userId_commentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CommentLike_userId_commentId_key" ON public."CommentLike" USING btree ("userId", "commentId");


--
-- Name: CommentReplyLike_userId_commentReplyId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CommentReplyLike_userId_commentReplyId_key" ON public."CommentReplyLike" USING btree ("userId", "commentReplyId");


--
-- Name: Course_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Course_code_key" ON public."Course" USING btree (code);


--
-- Name: Course_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Course_slug_key" ON public."Course" USING btree (slug);


--
-- Name: Favorite_guestKey_targetKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Favorite_guestKey_targetKey_key" ON public."Favorite" USING btree ("guestKey", "targetKey");


--
-- Name: Favorite_guestKey_targetType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Favorite_guestKey_targetType_idx" ON public."Favorite" USING btree ("guestKey", "targetType");


--
-- Name: Favorite_userId_targetKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Favorite_userId_targetKey_key" ON public."Favorite" USING btree ("userId", "targetKey");


--
-- Name: Favorite_userId_targetType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Favorite_userId_targetType_idx" ON public."Favorite" USING btree ("userId", "targetType");


--
-- Name: QuestionLike_userId_questionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "QuestionLike_userId_questionId_key" ON public."QuestionLike" USING btree ("userId", "questionId");


--
-- Name: QuestionReplyLike_userId_questionReplyId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "QuestionReplyLike_userId_questionReplyId_key" ON public."QuestionReplyLike" USING btree ("userId", "questionReplyId");


--
-- Name: Rating_authorId_targetKey_dimension_isTeacherSelf_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Rating_authorId_targetKey_dimension_isTeacherSelf_key" ON public."Rating" USING btree ("authorId", "targetKey", dimension, "isTeacherSelf");


--
-- Name: Rating_guestKey_targetKey_dimension_isTeacherSelf_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Rating_guestKey_targetKey_dimension_isTeacherSelf_key" ON public."Rating" USING btree ("guestKey", "targetKey", dimension, "isTeacherSelf");


--
-- Name: Rating_targetType_dimension_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Rating_targetType_dimension_idx" ON public."Rating" USING btree ("targetType", dimension);


--
-- Name: StudentCourseRecord_profileId_courseId_gradeLevel_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StudentCourseRecord_profileId_courseId_gradeLevel_key" ON public."StudentCourseRecord" USING btree ("profileId", "courseId", "gradeLevel");


--
-- Name: StudentProfile_accountName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StudentProfile_accountName_key" ON public."StudentProfile" USING btree ("accountName");


--
-- Name: StudentProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StudentProfile_userId_key" ON public."StudentProfile" USING btree ("userId");


--
-- Name: TeacherCourse_teacherId_courseId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TeacherCourse_teacherId_courseId_key" ON public."TeacherCourse" USING btree ("teacherId", "courseId");


--
-- Name: TeacherProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON public."TeacherProfile" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: CommentLike CommentLike_commentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommentLike"
    ADD CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES public."Comment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommentLike CommentLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommentLike"
    ADD CONSTRAINT "CommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommentReplyLike CommentReplyLike_commentReplyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommentReplyLike"
    ADD CONSTRAINT "CommentReplyLike_commentReplyId_fkey" FOREIGN KEY ("commentReplyId") REFERENCES public."CommentReply"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommentReplyLike CommentReplyLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommentReplyLike"
    ADD CONSTRAINT "CommentReplyLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommentReply CommentReply_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommentReply"
    ADD CONSTRAINT "CommentReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CommentReply CommentReply_commentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CommentReply"
    ADD CONSTRAINT "CommentReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES public."Comment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_teacherProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES public."TeacherProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CourseRequest CourseRequest_requesterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseRequest"
    ADD CONSTRAINT "CourseRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Favorite Favorite_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Favorite Favorite_teacherProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES public."TeacherProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Favorite Favorite_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ModerationLog ModerationLog_moderatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ModerationLog"
    ADD CONSTRAINT "ModerationLog_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuestionLike QuestionLike_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionLike"
    ADD CONSTRAINT "QuestionLike_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuestionLike QuestionLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionLike"
    ADD CONSTRAINT "QuestionLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuestionReplyLike QuestionReplyLike_questionReplyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionReplyLike"
    ADD CONSTRAINT "QuestionReplyLike_questionReplyId_fkey" FOREIGN KEY ("questionReplyId") REFERENCES public."QuestionReply"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuestionReplyLike QuestionReplyLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionReplyLike"
    ADD CONSTRAINT "QuestionReplyLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuestionReply QuestionReply_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionReply"
    ADD CONSTRAINT "QuestionReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuestionReply QuestionReply_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QuestionReply"
    ADD CONSTRAINT "QuestionReply_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Question Question_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Question Question_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Question Question_teacherProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES public."TeacherProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Rating Rating_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Rating Rating_commentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES public."Comment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Rating Rating_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Rating Rating_teacherProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES public."TeacherProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentCourseRecord StudentCourseRecord_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentCourseRecord"
    ADD CONSTRAINT "StudentCourseRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentCourseRecord StudentCourseRecord_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentCourseRecord"
    ADD CONSTRAINT "StudentCourseRecord_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."StudentProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudentProfile StudentProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentProfile"
    ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeacherCourse TeacherCourse_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TeacherCourse"
    ADD CONSTRAINT "TeacherCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeacherCourse TeacherCourse_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TeacherCourse"
    ADD CONSTRAINT "TeacherCourse_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."TeacherProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TeacherProfile TeacherProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TeacherProfile"
    ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict cvYivb1fTk1IKtNgiUiXuN8TRdocwJdGomgsICjIQQwRecVHnW1PO5u8ARqS7Cn

