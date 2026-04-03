"use client";

import { useState } from "react";
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
  const { copy, locale } = useLocale();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [refreshNonce, setRefreshNonce] = useState(0);
  const { data, loading, error } = useApiData<{
    teachers: TeacherProfile[];
    courses: Course[];
    comments: Comment[];
    questions: Question[];
  }>(`/api/search?q=${encodeURIComponent(query)}&r=${refreshNonce}`);

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading
          title={`${locale === "zh" ? "搜索：" : "Search: "}${query || copy.searchPlaceholder}`}
          description={copy.searchDescription}
        />
      </Card>
      {loading ? <Card>{copy.searching}</Card> : null}
      {error ? <Card>{error}</Card> : null}
      {data ? (
        <>
          <section className="space-y-4">
            <SectionHeading title={copy.teachers} />
            <div className="space-y-4">
              {data.teachers.length > 0 ? data.teachers.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />) : <Card>{copy.noTeachersMatched}</Card>}
            </div>
          </section>
          <section className="space-y-4">
            <SectionHeading title={copy.courses} />
            <div className="grid gap-5 2xl:grid-cols-2">
              {data.courses.length > 0 ? data.courses.map((course) => <CourseCard key={course.id} course={course} />) : <Card>{copy.noCoursesMatched}</Card>}
            </div>
          </section>
          <section className="space-y-4">
            <SectionHeading title={copy.comments} />
            {data.comments.length > 0 ? (
              <CommentThread comments={data.comments} onMutated={() => setRefreshNonce((current) => current + 1)} />
            ) : (
              <Card>{copy.noCommentsMatched}</Card>
            )}
          </section>
          <section className="space-y-4">
            <SectionHeading title={copy.questions} />
            {data.questions.length > 0 ? <QuestionThread questions={data.questions} /> : <Card>{copy.noQuestionsMatched}</Card>}
          </section>
        </>
      ) : null}
    </div>
  );
}
