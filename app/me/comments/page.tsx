"use client";

import { Card } from "@/components/card";
import { CommentThread } from "@/components/comment-thread";
import { useLocale } from "@/components/locale-provider";
import { SectionHeading } from "@/components/section-heading";
import { useApiData } from "@/hooks/use-api-data";
import { Comment } from "@/lib/types";

export default function MyCommentsPage() {
  const { copy, locale } = useLocale();
  const { data, loading, error } = useApiData<{ comments: Comment[] }>("/api/me");
  const comments = data?.comments ?? [];
  const displayError = error === "Unauthorized." ? "请先登录" : error;

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeading title={copy.myComments} description={locale === "zh" ? "学生可以管理自己的评论，并查看每条内容的隐私设置。" : "Students can edit their own comments and review privacy settings per post."} />
      </Card>
      {loading ? <Card>{copy.loadingComments}</Card> : null}
      {displayError ? <Card>{displayError}</Card> : null}
      <CommentThread comments={comments} canReply />
    </div>
  );
}
