"use client";

import { Card } from "@/components/card";
import { CourseCard } from "@/components/course-card";
import { TeacherCard } from "@/components/teacher-card";
import { useLocale } from "@/components/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { useViewer } from "@/components/viewer-provider";
import { useApiData } from "@/hooks/use-api-data";
import { Course, StudentProfile, TeacherProfile } from "@/lib/types";

export default function SavedPage() {
  const { copy } = useLocale();
  const viewer = useViewer();
  const { data, loading, error } = useApiData<{
    profile: StudentProfile | null;
    user: { id: string } | null;
    comments: [];
    questions: [];
  }>("/api/me", { enabled: Boolean(viewer) });
  const teacherData = useApiData<{ items: TeacherProfile[] }>("/api/teachers");
  const courseData = useApiData<{ items: Course[] }>("/api/courses");
  const profile = data?.profile;
  const teachers = teacherData.data?.items.filter((teacher) => profile?.savedTeacherIds.includes(teacher.id)) ?? [];
  const courses = courseData.data?.items.filter((course) => profile?.savedCourseIds.includes(course.id)) ?? [];
  const displayError = !viewer ? "请先登录" : error === "Unauthorized." ? "请先登录" : error;

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading title={copy.saved} description={copy.savedDescription} />
      </Card>
      {viewer && loading ? <Card>{copy.loadingSaved}</Card> : null}
      {displayError ? <Card>{displayError}</Card> : null}
      <div className="space-y-6">
        <section className="space-y-4">
          <SectionHeading title={copy.savedTeachers} />
          <div className="space-y-4">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <SectionHeading title={copy.savedCourses} />
          <div className="grid gap-5 2xl:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
