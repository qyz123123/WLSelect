"use client";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";
import { QuestionThread } from "@/components/question-thread";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { Question } from "@/lib/types";

export default function MyQuestionsPage() {
  const { copy, locale } = useLocale();
  const { data, loading, error } = useApiData<{ questions: Question[] }>("/api/me");
  const questions = data?.questions ?? [];
  const displayError = error === "Unauthorized." ? "请先登录" : error;

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading title={copy.myQuestions} description={locale === "zh" ? "学生可以管理自己的问题，并追踪已回答与未回答状态。" : "Students can manage their own questions and track answered versus unanswered status."} />
      </Card>
      {loading ? <Card>{copy.loadingQuestions}</Card> : null}
      {displayError ? <Card>{displayError}</Card> : null}
      <QuestionThread questions={questions} canReply />
    </div>
  );
}
