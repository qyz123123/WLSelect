"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";

export function GuestNameDialog({
  open,
  loading,
  initialValue,
  onClose,
  onConfirm
}: {
  open: boolean;
  loading?: boolean;
  initialValue?: string;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
}) {
  const { locale } = useLocale();
  const [name, setName] = useState(initialValue ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(initialValue ?? "");
    setError(null);
  }, [initialValue, open]);

  if (!open) {
    return null;
  }

  async function submit() {
    if (!name.trim()) {
      setError(locale === "zh" ? "请输入发言名称。" : "Please choose a display name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onConfirm(name.trim());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : locale === "zh" ? "无法保存游客身份。" : "Unable to save guest identity.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <Card className="w-full max-w-lg p-6">
        <div className="text-sm font-semibold text-[var(--primary)]">{locale === "zh" ? "你想以什么身份发言" : "How do you want to appear when posting?"}</div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">{locale === "zh" ? "先设置一个游客显示名称" : "Choose a guest display name first"}</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {locale === "zh"
            ? "系统会记住这个游客名称。为防止冒充，游客名称不能与任何已注册账号相同。"
            : "We will remember this guest identity in your browser. To prevent impersonation, guest names cannot match registered account names."}
        </p>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={locale === "zh" ? "例如：游客4821" : "For example: Guest4821"}
          className="mt-5 w-full rounded-2xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
        />
        {loading ? <div className="mt-3 text-sm text-[var(--muted)]">{locale === "zh" ? "生成建议中..." : "Preparing a suggestion..."}</div> : null}
        {error ? <div className="mt-3 text-sm text-[var(--danger)]">{error}</div> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
            {locale === "zh" ? "取消" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting || loading}
            className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? (locale === "zh" ? "保存中..." : "Saving...") : locale === "zh" ? "继续" : "Continue"}
          </button>
        </div>
      </Card>
    </div>
  );
}
