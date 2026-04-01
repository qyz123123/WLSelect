"use client";

import { useSearchParams } from "next/navigation";

import { Card } from "@/components/card";
import { CommentThread } from "@/components/comment-thread";
import { CourseCard } from "@/components/course-card";
import { useLocale } from "@/components/locale-provider";
import { QuestionThread } from "@/components/question-thread";
import { SectionHeading } from "@/components/section-heading";
import { TeacherCard } from "@/components/teacher-card";
import { useApiData } from "@/hooks/use-api-data";
import { Comment, Course, Question, TeacherProfile } from "@/lib/types";

export default function SearchPage() {
  const { copy } = useLocale();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { data, loading, error } = useApiData<{
    teachers: TeacherProfile[];
    courses: Course[];
    comments: Comment[];
    questions: Question[];
  }>(`/api/search?q=${encodeURIComponent(query)}`);

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading
          title={`Search: ${query || copy.searchPlaceholder}`}
          description="Search across teacher names, course names, comments, and questions."
        />
      </Card>
      {loading ? <Card>Searching...</Card> : null}
      {error ? <Card>{error}</Card> : null}
      {data ? (
        <>
          <section className="space-y-4">
            <SectionHeading title={copy.teachers} />
            <div className="space-y-4">
              {data.teachers.length > 0 ? data.teachers.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />) : <Card>No teachers matched.</Card>}
            </div>
          </section>
          <section className="space-y-4">
            <SectionHeading title={copy.courses} />
            <div className="grid gap-5 xl:grid-cols-2">
              {data.courses.length > 0 ? data.courses.map((course) => <CourseCard key={course.id} course={course} />) : <Card>No courses matched.</Card>}
            </div>
          </section>
          <section className="space-y-4">
            <SectionHeading title={copy.comments} />
            {data.comments.length > 0 ? <CommentThread comments={data.comments} /> : <Card>No comments matched.</Card>}
          </section>
          <section className="space-y-4">
            <SectionHeading title={copy.questions} />
            {data.questions.length > 0 ? <QuestionThread questions={data.questions} /> : <Card>No questions matched.</Card>}
          </section>
        </>
      ) : null}
    </div>
  );
}
