"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/card";
import { DiscussionComposer } from "@/components/discussion-composer";
import { useLocale } from "@/components/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { useViewer } from "@/components/viewer-provider";
import { useApiData } from "@/hooks/use-api-data";
import { TeacherProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type CourseSelectorItem = {
  id: string;
  slug: string;
  code: string;
  name: string;
  subject: string;
  system: string;
  gradeLevels: string[];
};

type TargetChoice = "course" | "teacher";

export default function DirectPostPage() {
  const { locale, copy } = useLocale();
  const viewer = useViewer();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [targetChoice, setTargetChoice] = useState<TargetChoice>("course");
  const [selectedCourse, setSelectedCourse] = useState<CourseSelectorItem | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null);

  const params = new URLSearchParams();
  if (query.trim()) {
    params.set("q", query.trim());
  }

  const courseData = useApiData<{ items: CourseSelectorItem[] }>(
    `/api/course-selector${params.toString() ? `?${params.toString()}` : ""}`
  );
  const teacherData = useApiData<{ items: TeacherProfile[] }>("/api/teachers");

  const courses = (courseData.data?.items ?? []).slice(0, query.trim() ? 12 : 6);
  const teachers = (teacherData.data?.items ?? [])
    .filter((teacher) => {
      const normalized = query.trim().toLowerCase();
      if (!normalized) {
        return true;
      }

      return [teacher.name, teacher.department, teacher.subjectArea, teacher.bio, teacher.teachingStyle, ...teacher.coursesTaught].some((value) =>
        value.toLowerCase().includes(normalized)
      );
    })
    .slice(0, query.trim() ? 12 : 6);

  const helperCopy = useMemo(
    () =>
      locale === "zh"
        ? {
            title: "直接发评论",
            description: "先选择一门课程或老师，再直接撰写你的评论。",
            searchCoursePlaceholder: "搜索课程名称、代码或学科",
            searchTeacherPlaceholder: "搜索老师姓名、学科或授课课程",
            chooseCourse: "选择课程",
            chooseTeacher: "选择老师",
            selectTarget: "先选择课程或老师",
            selectHint: "评论发布前必须先选择它所属的课程或老师。",
            selectedCourse: "已选择课程",
            selectedTeacher: "已选择老师",
            changeSelection: "重新选择",
            createTeacher: "创建老师",
            choosePrompt: "请选择一门课程或一位老师后再开始写评论。",
            noCourseResults: "没有找到匹配的课程。",
            noTeacherResults: "没有找到匹配的老师。",
            showingCourseCount: (count: number) => `当前显示 ${count} 门课程，请通过搜索继续缩小范围。`,
            showingTeacherCount: (count: number) => `当前显示 ${count} 位老师，请通过搜索继续缩小范围。`
          }
        : {
            title: "Post directly",
            description: "Choose a course or a teacher first, then write your comment directly.",
            searchCoursePlaceholder: "Search course name, code, or subject",
            searchTeacherPlaceholder: "Search teacher name, subject, or taught course",
            chooseCourse: "Choose course",
            chooseTeacher: "Choose teacher",
            selectTarget: "Choose a course or teacher first",
            selectHint: "A comment must belong to a course or a teacher before it can be posted.",
            selectedCourse: "Selected course",
            selectedTeacher: "Selected teacher",
            changeSelection: "Change selection",
            createTeacher: "Create teacher",
            choosePrompt: "Select a course or teacher before you start writing.",
            noCourseResults: "No courses matched your search.",
            noTeacherResults: "No teachers matched your search.",
            showingCourseCount: (count: number) => `Showing ${count} courses. Use search to narrow the list.`,
            showingTeacherCount: (count: number) => `Showing ${count} teachers. Use search to narrow the list.`
          },
    [locale]
  );

  const isSelectingCourse = targetChoice === "course";
  const selectedTarget = isSelectingCourse ? selectedCourse : selectedTeacher;

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading title={helperCopy.title} description={helperCopy.description} />
      </Card>

      {!selectedTarget ? (
        <Card>
          <SectionHeading title={helperCopy.selectTarget} description={helperCopy.selectHint} />
          <div className="mb-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setTargetChoice("course");
                setSelectedTeacher(null);
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                isSelectingCourse ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] bg-white"
              )}
            >
              {helperCopy.chooseCourse}
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetChoice("teacher");
                setSelectedCourse(null);
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                !isSelectingCourse ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] bg-white"
              )}
            >
              {helperCopy.chooseTeacher}
            </button>
            <Link href="/teacher/register" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
              {helperCopy.createTeacher}
            </Link>
          </div>
          <div className="mb-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isSelectingCourse ? helperCopy.searchCoursePlaceholder : helperCopy.searchTeacherPlaceholder}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>
          {isSelectingCourse && courseData.loading ? <div className="text-sm text-[var(--muted)]">{copy.loadingCourses}</div> : null}
          {isSelectingCourse && courseData.error ? <div className="text-sm text-[var(--danger)]">{courseData.error}</div> : null}
          {!isSelectingCourse && teacherData.loading ? <div className="text-sm text-[var(--muted)]">{copy.loadingTeachers}</div> : null}
          {!isSelectingCourse && teacherData.error ? <div className="text-sm text-[var(--danger)]">{teacherData.error}</div> : null}

          {isSelectingCourse && !courseData.loading && !courseData.error ? (
            courses.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-[var(--muted)]">{helperCopy.showingCourseCount(courses.length)}</div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => {
                        setSelectedCourse(course);
                        setSelectedTeacher(null);
                      }}
                      className="rounded-3xl border border-[var(--border)] bg-white p-4 text-left transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
                    >
                      <div className="text-sm font-semibold text-[var(--foreground)]">{course.name}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">
                        {course.code} • {course.subject}
                      </div>
                      <div className="mt-3 inline-flex rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs text-[var(--muted)]">
                        {course.system} • {course.gradeLevels.join(", ")}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-[var(--muted)]">{query.trim() ? helperCopy.noCourseResults : helperCopy.choosePrompt}</div>
                <Link href="/teacher/register" className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
                  {helperCopy.createTeacher}
                </Link>
              </div>
            )
          ) : null}

          {!isSelectingCourse && !teacherData.loading && !teacherData.error ? (
            teachers.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-[var(--muted)]">{helperCopy.showingTeacherCount(teachers.length)}</div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {teachers.map((teacher) => (
                    <button
                      key={teacher.id}
                      type="button"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setSelectedCourse(null);
                      }}
                      className="rounded-3xl border border-[var(--border)] bg-white p-4 text-left transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
                    >
                      <div className="text-sm font-semibold text-[var(--foreground)]">{teacher.name}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">
                        {teacher.department} • {teacher.subjectArea}
                      </div>
                      <div className="mt-3 inline-flex rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs text-[var(--muted)]">
                        {teacher.coursesTaught[0] ?? teacher.subjectArea}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-[var(--muted)]">{query.trim() ? helperCopy.noTeacherResults : helperCopy.choosePrompt}</div>
                <Link href="/teacher/register" className="inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
                  {helperCopy.createTeacher}
                </Link>
              </div>
            )
          ) : null}
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-[var(--foreground)]">
                  {isSelectingCourse ? helperCopy.selectedCourse : helperCopy.selectedTeacher}
                </div>
                <div className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                  {isSelectingCourse ? selectedCourse?.name : selectedTeacher?.name}
                </div>
                <div className="mt-1 text-sm text-[var(--muted)]">
                  {isSelectingCourse
                    ? `${selectedCourse?.code} • ${selectedCourse?.subject} • ${selectedCourse?.system} • ${selectedCourse?.gradeLevels.join(", ")}`
                    : `${selectedTeacher?.department} • ${selectedTeacher?.subjectArea}`}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourse(null);
                    setSelectedTeacher(null);
                  }}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                >
                  {helperCopy.changeSelection}
                </button>
                <Link
                  href={isSelectingCourse ? `/courses/${selectedCourse!.slug}` : `/teachers/${selectedTeacher!.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                >
                  {isSelectingCourse ? copy.exploreCourse : copy.viewProfile}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>
          <DiscussionComposer
            targetType={isSelectingCourse ? "course" : "teacher"}
            targetId={isSelectingCourse ? selectedCourse!.id : selectedTeacher!.id}
            viewer={viewer}
            onPosted={() => {
              router.push(
                isSelectingCourse
                  ? `/courses/${selectedCourse!.slug}#comments-section`
                  : `/teachers/${selectedTeacher!.id}#comments-section`
              );
              router.refresh();
            }}
          />
        </>
      )}
    </div>
  );
}
