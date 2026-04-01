import { RatingDimension } from "@/lib/types";

export const courseRatingDimensions: RatingDimension[] = [
  { key: "difficulty", label: { en: "Difficulty", zh: "课程难度" } },
  { key: "workload", label: { en: "Workload", zh: "作业量" } },
  { key: "pace", label: { en: "Pace", zh: "课程节奏" } },
  { key: "structure", label: { en: "Clarity of structure", zh: "课程结构清晰度" } },
  { key: "feedback", label: { en: "Usefulness of feedback", zh: "反馈有效性" } },
  { key: "grading", label: { en: "Fairness of grading", zh: "评分公平性" } },
  { key: "assessment", label: { en: "Assessment difficulty", zh: "考试难度" } },
  { key: "prep", label: { en: "Exam preparation support", zh: "备考帮助" } },
  { key: "engagement", label: { en: "Interest level", zh: "课程趣味性" } },
  { key: "memorization", label: { en: "Memorization required", zh: "记忆量" } },
  { key: "independentStudy", label: { en: "Independent study required", zh: "自学要求" } },
  { key: "recommendation", label: { en: "Overall recommendation", zh: "整体推荐度" } }
];

export const teacherRatingDimensions: RatingDimension[] = [
  { key: "friendliness", label: { en: "Friendliness", zh: "友善度" } },
  { key: "clarity", label: { en: "Clarity of explanation", zh: "讲解清晰度" } },
  { key: "patience", label: { en: "Patience answering questions", zh: "答疑耐心" } },
  { key: "grading", label: { en: "Fairness in grading", zh: "评分公平性" } },
  { key: "responsiveness", label: { en: "Responsiveness", zh: "回复及时性" } },
  { key: "organization", label: { en: "Classroom organization", zh: "课堂组织" } },
  { key: "support", label: { en: "Support outside class", zh: "课外支持" } },
  { key: "feedback", label: { en: "Quality of feedback", zh: "反馈质量" } },
  { key: "effectiveness", label: { en: "Teaching effectiveness", zh: "教学效果" } },
  { key: "respect", label: { en: "Respect for students", zh: "尊重学生" } },
  { key: "participation", label: { en: "Encourages participation", zh: "鼓励参与" } },
  { key: "recommendation", label: { en: "Overall recommendation", zh: "整体推荐度" } }
];
