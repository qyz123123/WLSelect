import { RatingDimension } from "@/lib/types";

export const courseRatingDimensions: RatingDimension[] = [
  { key: "difficulty", label: { en: "Difficulty", zh: "课程难度" } },
  { key: "grading", label: { en: "Grading ease", zh: "给分友好度" } },
  { key: "assessment", label: { en: "Assessment ease", zh: "考试轻松度" } },
  { key: "recommendation", label: { en: "Overall recommendation", zh: "整体推荐度" } }
];

export const teacherRatingDimensions: RatingDimension[] = [
  { key: "strictness", label: { en: "Grading ease", zh: "给分轻松度" } },
  { key: "friendliness", label: { en: "Friendliness", zh: "和蔼可亲度" } },
  { key: "workload", label: { en: "Workload ease", zh: "作业轻松度" } },
  { key: "teaching-quality", label: { en: "Teaching quality", zh: "教课质量" } }
];
