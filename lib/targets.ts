import { TargetType } from "@prisma/client";

export function buildTargetKey(targetType: TargetType, targetId: string) {
  return `${targetType}:${targetId}`;
}

export function buildTargetKeyFromUi(targetType: "teacher" | "course", targetId: string) {
  return `${targetType.toUpperCase()}:${targetId}`;
}
