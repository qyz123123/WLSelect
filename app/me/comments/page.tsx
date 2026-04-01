"use client";

import { Card } from "@/components/card";
import { CommentThread } from "@/components/comment-thread";
import { useLocale } from "@/components/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { Comment } from "@/lib/types";

export default function MyCommentsPage() {
  const { copy } = useLocale();
  const { data, loading, error } = useApiData<{ comments: Comment[] }>("/api/me");
  const comments = data?.comments ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading title={copy.myComments} description="Students can edit their own comments and review privacy settings per post." />
      </Card>
      {loading ? <Card>Loading your comments...</Card> : null}
      {error ? <Card>{error}</Card> : null}
      <CommentThread comments={comments} canReply />
    </div>
  );
}
