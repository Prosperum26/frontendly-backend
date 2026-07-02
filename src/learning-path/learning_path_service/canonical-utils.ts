import { CanonicalMapData } from '../../entrance-test/entrance-test.types';

export function canonicalLessonIdToStageId(
  canonicalLessonId: string,
  canonicalData: CanonicalMapData,
): string {
  const index = canonicalData.order.indexOf(canonicalLessonId);
  return index >= 0 ? `s${index + 1}` : canonicalLessonId;
}

export function stageIdToCanonicalLessonId(
  stageId: string,
  canonicalData: CanonicalMapData,
): string | null {
  const regex = /^s(\d+)$/;
  const match = regex.exec(stageId);
  if (!match) return null;
  const index = Number(match[1]) - 1;
  return canonicalData.order[index] ?? null;
}

export function buildStageToCanonicalMap(
  canonicalData: CanonicalMapData,
): Record<string, string> {
  const map: Record<string, string> = {};
  canonicalData.order.forEach((canonicalLessonId, index) => {
    map[`s${index + 1}`] = canonicalLessonId;
  });
  return map;
}
