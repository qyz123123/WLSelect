"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";

import { useLocale } from "@/components/locale-provider";

interface CourseOption {
  id: string;
  name: string;
  code: string;
  subject: string;
}

export function CourseMultiSelect({
  items,
  value,
  onChange
}: {
  items: CourseOption[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");

  const selectedItems = useMemo(
    () => value.map((id) => items.find((item) => item.id === id)).filter(Boolean) as CourseOption[],
    [items, value]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return items.filter((item) => {
      if (value.includes(item.id)) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return (
        item.name.toLowerCase().includes(normalized) ||
        item.code.toLowerCase().includes(normalized) ||
        item.subject.toLowerCase().includes(normalized)
      );
    });
  }, [items, query, value]);

  function addCourse(courseId: string) {
    if (value.includes(courseId)) {
      return;
    }

    onChange([...value, courseId]);
    setQuery("");
  }

  function removeCourse(courseId: string) {
    onChange(value.filter((id) => id !== courseId));
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
        <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
          <Search className="h-4 w-4 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={locale === "zh" ? "搜索课程名称、代码或学科" : "Search course name, code, or subject"}
            className="min-w-0 flex-1 border-none bg-transparent text-sm outline-none"
          />
        </label>
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
          {filtered.length > 0 ? (
            filtered.slice(0, 12).map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => addCourse(course.id)}
                className="flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-left transition hover:border-[var(--primary)]"
              >
                <div>
                  <div className="text-sm font-semibold text-[var(--foreground)]">{course.name}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {course.code} • {course.subject}
                  </div>
                </div>
                <Plus className="h-4 w-4 text-[var(--primary)]" />
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--muted)]">
              {locale === "zh" ? "没有匹配课程。你可以提交新增课程申请。" : "No matching course found. You can submit a course-add request instead."}
            </div>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <div className="text-sm font-semibold text-[var(--foreground)]">{locale === "zh" ? "已选择课程" : "Selected courses"}</div>
        {selectedItems.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((course) => (
              <div key={course.id} className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-4 py-2 text-sm font-medium text-[var(--primary)]">
                <span>{course.name}</span>
                <button type="button" onClick={() => removeCourse(course.id)} aria-label={`Remove ${course.name}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-4 text-sm text-[var(--muted)]">
            {locale === "zh" ? "至少选择一门官方课程。" : "Choose at least one course from the official list."}
          </div>
        )}
      </div>
    </div>
  );
}
