import { RatingDimension } from "@/lib/types";

export const courseRatingDimensions: RatingDimension[] = [
  { key: "difficulty", label: { en: "Difficulty", zh: "课程难度" } },
  { key: "grading", label: { en: "Fairness of grading", zh: "评分公平性" } },
  { key: "assessment", label: { en: "Assessment difficulty", zh: "考试难度" } },
  { key: "recommendation", label: { en: "Overall recommendation", zh: "整体推荐度" } }
];

export const teacherRatingDimensions: RatingDimension[] = [
  { key: "strictness", label: { en: "Grading strictness", zh: "评分严格度" } },
  { key: "friendliness", label: { en: "Friendliness", zh: "和蔼可亲度" } },
  { key: "workload", label: { en: "Workload", zh: "作业量" } },
  { key: "teaching-quality", label: { en: "Teaching quality", zh: "教课质量" } }
];
