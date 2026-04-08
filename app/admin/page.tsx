"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";
import { RoleBadge } from "@/components/role-badge";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { formatCourseSystem } from "@/lib/i18n";
import { TeacherProfile } from "@/lib/types";

type AdminCommentItem = {
  id: string;
  body: string;
  authorName: string;
  targetLabel: string;
  createdAt: string;
  targetType: "teacher" | "course";
};

export default function AdminPage() {
  const { copy, locale } = useLocale();
  const router = useRouter();
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showAllTeachers, setShowAllTeachers] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [courseForm, setCourseForm] = useState({
    slug: "",
    code: "",
    name: "",
    subject: "",
    description: "",
    prerequisites: "",
    system: "AP",
    gradeLevels: "G11,G12"
  });
  const [teacherQuery, setTeacherQuery] = useState("");
  const [teacherSubject, setTeacherSubject] = useState("");
  const [teacherDepartment, setTeacherDepartment] = useState("");
  const [courseQuery, setCourseQuery] = useState("");
  const [courseSystemFilter, setCourseSystemFilter] = useState("");
  const [courseSubjectFilter, setCourseSubjectFilter] = useState("");
  const [commentQuery, setCommentQuery] = useState("");
  const [commentTargetType, setCommentTargetType] = useState<"all" | "teacher" | "course">("all");
  const [commentTargetLabel, setCommentTargetLabel] = useState("");
  const [teacherMergeSourceId, setTeacherMergeSourceId] = useState("");
  const [teacherMergeTargetId, setTeacherMergeTargetId] = useState("");
  const [courseMergeSourceId, setCourseMergeSourceId] = useState("");
  const [courseMergeTargetId, setCourseMergeTargetId] = useState("");
  const { data, loading, error, setData } = useApiData<{
    viewer: { role: "admin" };
    dashboard: {
      users: number;
      pendingTeachers: number;
      courseCount: number;
      teacherCount: number;
      totalComments: number;
      commentsToday: number;
      totalViewers: number;
      viewersToday: number;
      recentLogs: Array<{ id: string; details: string; action: string }>;
    };
    teachers: TeacherProfile[];
    courses: Array<{ id: string; name: string; subject: string; system: "AP" | "AL" | "GENERAL" }>;
    comments: AdminCommentItem[];
  }>(`/api/admin/dashboard?r=${refreshNonce}`);

  const teacherSubjectOptions = useMemo(
    () => Array.from(new Set((data?.teachers ?? []).map((teacher) => teacher.subjectArea).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [data?.teachers]
  );
  const teacherDepartmentOptions = useMemo(
    () => Array.from(new Set((data?.teachers ?? []).map((teacher) => teacher.department).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [data?.teachers]
  );
  const courseSubjectOptions = useMemo(
    () => Array.from(new Set((data?.courses ?? []).map((course) => course.subject).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [data?.courses]
  );
  const commentTargetOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (data?.comments ?? [])
            .filter((comment) => commentTargetType === "all" || comment.targetType === commentTargetType)
            .map((comment) => comment.targetLabel)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [commentTargetType, data?.comments]
  );

  const filteredTeachers = useMemo(() => {
    const normalizedQuery = teacherQuery.trim().toLowerCase();

    return (data?.teachers ?? []).filter((teacher) => {
      const matchesQuery = normalizedQuery
        ? [
            teacher.name,
            teacher.subjectArea,
            teacher.department,
            teacher.bio,
            teacher.teachingStyle,
            ...teacher.coursesTaught
          ].some((value) => value.toLowerCase().includes(normalizedQuery))
        : true;

      return matchesQuery && (teacherSubject ? teacher.subjectArea === teacherSubject : true) && (teacherDepartment ? teacher.department === teacherDepartment : true);
    });
  }, [data?.teachers, teacherDepartment, teacherQuery, teacherSubject]);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = courseQuery.trim().toLowerCase();

    return (data?.courses ?? []).filter((course) => {
      const matchesQuery = normalizedQuery
        ? [course.name, course.subject, formatCourseSystem(locale, course.system)].some((value) => value.toLowerCase().includes(normalizedQuery))
        : true;

      return matchesQuery && (courseSystemFilter ? course.system === courseSystemFilter : true) && (courseSubjectFilter ? course.subject === courseSubjectFilter : true);
    });
  }, [courseQuery, courseSubjectFilter, courseSystemFilter, data?.courses, locale]);

  const filteredComments = useMemo(() => {
    const normalizedQuery = commentQuery.trim().toLowerCase();

    return (data?.comments ?? []).filter((comment) => {
      const matchesQuery = normalizedQuery
        ? [comment.body, comment.authorName, comment.targetLabel].some((value) => value.toLowerCase().includes(normalizedQuery))
        : true;

      return matchesQuery && (commentTargetType === "all" ? true : comment.targetType === commentTargetType) && (commentTargetLabel ? comment.targetLabel === commentTargetLabel : true);
    });
  }, [commentQuery, commentTargetLabel, commentTargetType, data?.comments]);
  const visibleTeachers = showAllTeachers ? filteredTeachers : filteredTeachers.slice(0, 8);
  const visibleCourses = showAllCourses ? filteredCourses : filteredCourses.slice(0, 8);

  useEffect(() => {
    setShowAllTeachers(false);
  }, [teacherQuery, teacherSubject, teacherDepartment, refreshNonce]);

  useEffect(() => {
    setShowAllCourses(false);
  }, [courseQuery, courseSubjectFilter, courseSystemFilter, refreshNonce]);

  function formatLogAction(action: string) {
    if (locale !== "zh") {
      return action;
    }

    if (action === "WARN") {
      return "警告";
    }

    if (action === "REMOVE") {
      return "删除";
    }

    return action;
  }

  function formatLogDetails(details: string) {
    if (locale !== "zh") {
      return details;
    }

    if (details === "Community privacy reminder added to thread.") {
      return "已在线程中加入社区隐私提醒。";
    }

    return details;
  }

  async function verifyTeacher(id: string) {
    await fetch(`/api/admin/teachers/${id}/verify`, { method: "POST" });

    if (data) {
      setData({
        ...data,
        dashboard: {
          ...data.dashboard,
          pendingTeachers: Math.max(0, data.dashboard.pendingTeachers - 1)
        }
      });
    }
  }

  async function createCourse() {
    await fetch("/api/admin/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...courseForm,
        gradeLevels: courseForm.gradeLevels.split(",").map((item) => item.trim())
      })
    });
  }

  async function deleteTeacher(id: string, name: string) {
    if (!window.confirm(locale === "zh" ? `确认删除老师“${name}”吗？` : `Delete teacher "${name}"?`)) {
      return;
    }

    const response = await fetch(`/api/admin/teachers/${id}`, { method: "DELETE" });

    if (!response.ok || !data) {
      const payload = await response.json().catch(() => null);
      setActionError(payload?.error ?? (locale === "zh" ? "删除老师失败。" : "Unable to delete teacher."));
      return;
    }

    setActionError(null);

    setData({
      ...data,
      teachers: data.teachers.filter((teacher) => teacher.id !== id),
      comments: data.comments.filter((comment) => !(comment.targetType === "teacher" && comment.targetLabel === name))
    });
    setRefreshNonce((current) => current + 1);
    router.refresh();
  }

  async function deleteCourse(id: string, name: string) {
    if (!window.confirm(locale === "zh" ? `确认删除课程“${name}”吗？` : `Delete course "${name}"?`)) {
      return;
    }

    const response = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });

    if (!response.ok || !data) {
      const payload = await response.json().catch(() => null);
      setActionError(payload?.error ?? (locale === "zh" ? "删除课程失败。" : "Unable to delete course."));
      return;
    }

    setActionError(null);

    setData({
      ...data,
      dashboard: {
        ...data.dashboard,
        courseCount: Math.max(0, data.dashboard.courseCount - 1)
      },
      courses: data.courses.filter((course) => course.id !== id),
      comments: data.comments.filter((comment) => !(comment.targetType === "course" && comment.targetLabel === name))
    });
    setRefreshNonce((current) => current + 1);
    router.refresh();
  }

  async function deleteComment(id: string) {
    if (!window.confirm(locale === "zh" ? "确认删除这条评论吗？" : "Delete this comment?")) {
      return;
    }

    const response = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });

    if (!response.ok || !data) {
      const payload = await response.json().catch(() => null);
      setActionError(payload?.error ?? (locale === "zh" ? "删除评论失败。" : "Unable to delete comment."));
      return;
    }

    setActionError(null);

    setData({
      ...data,
      comments: data.comments.filter((comment) => comment.id !== id)
    });
    setRefreshNonce((current) => current + 1);
    router.refresh();
  }

  async function mergeTeacherRecords() {
    if (!teacherMergeSourceId || !teacherMergeTargetId || teacherMergeSourceId === teacherMergeTargetId) {
      return;
    }

    const sourceTeacher = data?.teachers.find((teacher) => teacher.id === teacherMergeSourceId);
    const targetTeacher = data?.teachers.find((teacher) => teacher.id === teacherMergeTargetId);

    if (!sourceTeacher || !targetTeacher) {
      return;
    }

    if (
      !window.confirm(
        locale === "zh"
          ? `确认将老师“${sourceTeacher.name}”合并到“${targetTeacher.name}”吗？`
          : `Merge teacher "${sourceTeacher.name}" into "${targetTeacher.name}"?`
      )
    ) {
      return;
    }

    const response = await fetch("/api/admin/teachers/merge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sourceId: teacherMergeSourceId,
        targetId: teacherMergeTargetId
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setActionError(payload?.error ?? (locale === "zh" ? "合并老师失败。" : "Unable to merge teachers."));
      return;
    }

    setActionError(null);
    setTeacherMergeSourceId("");
    setTeacherMergeTargetId("");
    setRefreshNonce((current) => current + 1);
    router.refresh();
  }

  async function mergeCourseRecords() {
    if (!courseMergeSourceId || !courseMergeTargetId || courseMergeSourceId === courseMergeTargetId) {
      return;
    }

    const sourceCourse = data?.courses.find((course) => course.id === courseMergeSourceId);
    const targetCourse = data?.courses.find((course) => course.id === courseMergeTargetId);

    if (!sourceCourse || !targetCourse) {
      return;
    }

    if (
      !window.confirm(
        locale === "zh"
          ? `确认将课程“${sourceCourse.name}”合并到“${targetCourse.name}”吗？`
          : `Merge course "${sourceCourse.name}" into "${targetCourse.name}"?`
      )
    ) {
      return;
    }

    const response = await fetch("/api/admin/courses/merge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sourceId: courseMergeSourceId,
        targetId: courseMergeTargetId
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setActionError(payload?.error ?? (locale === "zh" ? "合并课程失败。" : "Unable to merge courses."));
      return;
    }

    setActionError(null);
    setCourseMergeSourceId("");
    setCourseMergeTargetId("");
    setRefreshNonce((current) => current + 1);
    router.refresh();
  }

  if (loading) {
    return <Card>{locale === "zh" ? "正在加载管理面板..." : "Loading admin dashboard..."}</Card>;
  }

  if (error || !data) {
    return <Card>{error ?? (locale === "zh" ? "需要管理员权限。" : "Admin access required.")}</Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <SectionHeading
            title={copy.management}
            description={locale === "zh" ? "管理员可在这里处理教师、课程和评论内容。" : "Manage teachers, courses, and student comments here."}
          />
          <RoleBadge role="admin" />
        </div>
        {actionError ? <div className="mt-4 rounded-[var(--radius)] border border-[var(--danger)]/30 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">{actionError}</div> : null}
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[var(--card-radius)] border border-[var(--border)] bg-white p-4">
            <div className="text-base font-semibold">{copy.dashboard}</div>
            <div className="mt-3 grid gap-2 text-sm text-[var(--muted)] md:grid-cols-2">
              <div>{copy.users}: {data.dashboard.users}</div>
              <div>{copy.pendingTeacherVerification}: {data.dashboard.pendingTeachers}</div>
              <div>{locale === "zh" ? "老师总数" : "Total teachers"}: {data.dashboard.teacherCount}</div>
              <div>{copy.officialCourseListSize}: {data.dashboard.courseCount}</div>
              <div>{locale === "zh" ? "今日评论数" : "Comments today"}: {data.dashboard.commentsToday}</div>
              <div>{locale === "zh" ? "评论总数" : "Total comments"}: {data.dashboard.totalComments}</div>
              <div>{locale === "zh" ? "今日访客数" : "Viewers today"}: {data.dashboard.viewersToday}</div>
              <div>{locale === "zh" ? "总访客数" : "Total viewers"}: {data.dashboard.totalViewers}</div>
            </div>
          </div>
          <div className="rounded-[var(--card-radius)] border border-[var(--border)] bg-white p-4">
            <div className="text-base font-semibold">{copy.recentModeration}</div>
            <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              {data.dashboard.recentLogs.map((log) => (
                <div key={log.id}>
                  {formatLogAction(log.action)}: {formatLogDetails(log.details)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeading
          title={locale === "zh" ? "老师管理" : "Teacher management"}
          description={locale === "zh" ? "搜索、筛选、认证或删除老师。" : "Search, filter, verify, or delete teachers."}
        />
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <input
            value={teacherQuery}
            onChange={(event) => setTeacherQuery(event.target.value)}
            placeholder={locale === "zh" ? "搜索老师姓名、学科、部门或简介" : "Search teacher name, subject, department, or bio"}
            className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 text-sm outline-none"
          />
          <select value={teacherSubject} onChange={(event) => setTeacherSubject(event.target.value)} className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 text-sm outline-none">
            <option value="">{locale === "zh" ? "全部学科" : "All subjects"}</option>
            {teacherSubjectOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={teacherDepartment} onChange={(event) => setTeacherDepartment(event.target.value)} className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 text-sm outline-none">
            <option value="">{locale === "zh" ? "全部部门" : "All departments"}</option>
            {teacherDepartmentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
          <div className="text-sm font-semibold text-[var(--foreground)]">{locale === "zh" ? "合并老师" : "Merge teachers"}</div>
          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <select value={teacherMergeSourceId} onChange={(event) => setTeacherMergeSourceId(event.target.value)} className="rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none">
              <option value="">{locale === "zh" ? "选择要合并的老师" : "Choose source teacher"}</option>
              {data.teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            <select value={teacherMergeTargetId} onChange={(event) => setTeacherMergeTargetId(event.target.value)} className="rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none">
              <option value="">{locale === "zh" ? "选择保留的老师" : "Choose target teacher"}</option>
              {data.teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => void mergeTeacherRecords()} className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
              {locale === "zh" ? "合并老师" : "Merge"}
            </button>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {visibleTeachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center justify-between gap-3 rounded-[var(--card-radius)] border border-[var(--border)] px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-semibold">{teacher.name}</div>
                <div className="text-sm text-[var(--muted)]">
                  {teacher.subjectArea} • {teacher.department}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void verifyTeacher(teacher.id)} className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                  {copy.verify}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteTeacher(teacher.id, teacher.name)}
                  className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--danger)]"
                >
                  {locale === "zh" ? "删除" : "Delete"}
                </button>
              </div>
            </div>
          ))}
          {!showAllTeachers && filteredTeachers.length > 8 ? (
            <button
              type="button"
              onClick={() => setShowAllTeachers(true)}
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-alt)]"
            >
              {locale === "zh" ? "显示更多老师" : "Show more teachers"}
            </button>
          ) : null}
          {filteredTeachers.length === 0 ? <div className="text-sm text-[var(--muted)]">{locale === "zh" ? "没有符合条件的老师。" : "No teachers matched."}</div> : null}
        </div>
      </Card>

      <Card>
        <SectionHeading
          title={locale === "zh" ? "课程管理" : "Course management"}
          description={locale === "zh" ? "搜索、筛选、创建或删除课程。" : "Search, filter, create, or delete courses."}
        />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <input
                value={courseQuery}
                onChange={(event) => setCourseQuery(event.target.value)}
                placeholder={locale === "zh" ? "搜索课程名称或学科" : "Search course name or subject"}
                className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 text-sm outline-none"
              />
              <select value={courseSubjectFilter} onChange={(event) => setCourseSubjectFilter(event.target.value)} className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 text-sm outline-none">
                <option value="">{locale === "zh" ? "全部学科" : "All subjects"}</option>
                {courseSubjectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select value={courseSystemFilter} onChange={(event) => setCourseSystemFilter(event.target.value)} className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 text-sm outline-none">
                <option value="">{locale === "zh" ? "全部体系" : "All systems"}</option>
                <option value="AP">AP</option>
                <option value="AL">AL</option>
                <option value="GENERAL">{locale === "zh" ? "普通课程" : "General"}</option>
              </select>
            </div>
            <div className="rounded-[var(--card-radius)] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
              <div className="text-sm font-semibold text-[var(--foreground)]">{locale === "zh" ? "合并课程" : "Merge courses"}</div>
              <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <select value={courseMergeSourceId} onChange={(event) => setCourseMergeSourceId(event.target.value)} className="rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none">
                  <option value="">{locale === "zh" ? "选择要合并的课程" : "Choose source course"}</option>
                  {data.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                <select value={courseMergeTargetId} onChange={(event) => setCourseMergeTargetId(event.target.value)} className="rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none">
                  <option value="">{locale === "zh" ? "选择保留的课程" : "Choose target course"}</option>
                  {data.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => void mergeCourseRecords()} className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                  {locale === "zh" ? "合并课程" : "Merge"}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {visibleCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between gap-3 rounded-[var(--card-radius)] border border-[var(--border)] px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{course.name}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {course.subject} • {formatCourseSystem(locale, course.system)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteCourse(course.id, course.name)}
                    className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--danger)]"
                  >
                    {locale === "zh" ? "删除" : "Delete"}
                  </button>
                </div>
              ))}
              {!showAllCourses && filteredCourses.length > 8 ? (
                <button
                  type="button"
                  onClick={() => setShowAllCourses(true)}
                  className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-alt)]"
                >
                  {locale === "zh" ? "显示更多课程" : "Show more courses"}
                </button>
              ) : null}
              {filteredCourses.length === 0 ? <div className="text-sm text-[var(--muted)]">{locale === "zh" ? "没有符合条件的课程。" : "No courses matched."}</div> : null}
            </div>
          </div>
          <div className="rounded-[var(--card-radius)] border border-[var(--border)] bg-white p-4">
            <div className="text-base font-semibold">{copy.createOfficialCourse}</div>
            <div className="mt-4 grid gap-3">
              <input value={courseForm.slug} onChange={(event) => setCourseForm((current) => ({ ...current, slug: event.target.value }))} placeholder={locale === "zh" ? "路径标识" : "slug"} className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.code} onChange={(event) => setCourseForm((current) => ({ ...current, code: event.target.value }))} placeholder={locale === "zh" ? "课程代码" : "code"} className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.name} onChange={(event) => setCourseForm((current) => ({ ...current, name: event.target.value }))} placeholder={locale === "zh" ? "课程名称" : "name"} className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.subject} onChange={(event) => setCourseForm((current) => ({ ...current, subject: event.target.value }))} placeholder={locale === "zh" ? "学科" : "subject"} className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 outline-none" />
              <textarea value={courseForm.description} onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))} placeholder={locale === "zh" ? "课程描述" : "description"} className="rounded-[var(--card-radius)] border border-[var(--border)] px-4 py-3 outline-none" />
              <input value={courseForm.prerequisites} onChange={(event) => setCourseForm((current) => ({ ...current, prerequisites: event.target.value }))} placeholder={locale === "zh" ? "先修要求" : "prerequisites"} className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 outline-none" />
              <button type="button" onClick={() => void createCourse()} className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                {copy.createCourse}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeading
          title={locale === "zh" ? "评论管理" : "Comment management"}
          description={locale === "zh" ? "按老师或课程筛选学生/游客评论，并执行删除。" : "Filter student or guest comments by teacher or course, then delete them."}
        />
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_180px_minmax(0,1fr)]">
          <input
            value={commentQuery}
            onChange={(event) => setCommentQuery(event.target.value)}
            placeholder={locale === "zh" ? "搜索评论内容、作者或目标" : "Search comment text, author, or target"}
            className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 text-sm outline-none"
          />
          <select
            value={commentTargetType}
            onChange={(event) => {
              const nextValue = event.target.value as "all" | "teacher" | "course";
              setCommentTargetType(nextValue);
              setCommentTargetLabel("");
            }}
            className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 text-sm outline-none"
          >
            <option value="all">{locale === "zh" ? "全部目标" : "All targets"}</option>
            <option value="teacher">{locale === "zh" ? "老师" : "Teachers"}</option>
            <option value="course">{locale === "zh" ? "课程" : "Courses"}</option>
          </select>
          <select value={commentTargetLabel} onChange={(event) => setCommentTargetLabel(event.target.value)} className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-3 text-sm outline-none">
            <option value="">{locale === "zh" ? "全部课程/老师" : "All courses/teachers"}</option>
            {commentTargetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 space-y-3">
          {filteredComments.map((comment) => (
            <div key={comment.id} className="flex items-start justify-between gap-3 rounded-[var(--card-radius)] border border-[var(--border)] px-4 py-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{comment.authorName}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {comment.targetType === "teacher" ? (locale === "zh" ? "老师" : "Teacher") : locale === "zh" ? "课程" : "Course"}: {comment.targetLabel}
                </div>
                <div className="mt-2 line-clamp-2 text-sm text-[var(--foreground)]">{comment.body}</div>
              </div>
              <button
                type="button"
                onClick={() => void deleteComment(comment.id)}
                className="shrink-0 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--danger)]"
              >
                {locale === "zh" ? "删除" : "Delete"}
              </button>
            </div>
          ))}
          {filteredComments.length === 0 ? <div className="text-sm text-[var(--muted)]">{locale === "zh" ? "没有符合条件的评论。" : "No comments matched."}</div> : null}
        </div>
      </Card>
    </div>
  );
}
