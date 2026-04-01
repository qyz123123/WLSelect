import { RatingValue } from "@/lib/types";
import { averageScore } from "@/lib/utils";

export function summarizeRatings(ratings: RatingValue[]) {
  const student = ratings.filter((item) => item.role === "student");
  const teacherSelf = ratings.filter((item) => item.role === "teacher-self");

  return {
    average: averageScore(ratings.map((item) => item.score)),
    count: ratings.length,
    studentAverage: averageScore(student.map((item) => item.score)),
    teacherSelfAverage: averageScore(teacherSelf.map((item) => item.score))
  };
}
