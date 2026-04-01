"use client";

import { Card } from "@/components/card";
import { useLocale } from "@/components/locale-provider";
import { QuestionThread } from "@/components/question-thread";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { Question } from "@/lib/types";

export default function MyQuestionsPage() {
  const { copy } = useLocale();
  const { data, loading, error } = useApiData<{ questions: Question[] }>("/api/me");
  const questions = data?.questions ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading title={copy.myQuestions} description="Students can manage their own questions and track answered versus unanswered status." />
      </Card>
      {loading ? <Card>Loading your questions...</Card> : null}
      {error ? <Card>{error}</Card> : null}
      <QuestionThread questions={questions} canReply />
    </div>
  );
}
