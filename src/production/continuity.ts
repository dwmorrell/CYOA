import type { Story } from '../engine/types';
import { conceptById } from '../literacy/taxonomy';
import type { NormalizedBrief } from './request';

export interface ContinuityAssessment {
  isSequel: boolean;
  previous?: { id: string; title: string; version: number; seriesId?: string; seriesOrder?: number };
  series: { id: string; title: string; order: number; previousStoryId?: string } | null;
  carriedItems: string[];
  carriedClues: string[];
  establishedConcepts: string[];
  /** Concepts the previous story taught that this brief does not revisit. */
  droppedConcepts: string[];
  /** New target concepts that are earlier in the teaching order than ones already taught. */
  progressionWarnings: string[];
  issues: string[];
  ok: boolean;
}

/**
 * Deterministic series check. It can verify ids, carried objects and concept
 * progression; it cannot judge whether prose contradicts earlier events, so
 * the narrative and QA reviews still have to read for that.
 */
export function assessContinuity(brief: NormalizedBrief, library: Story[]): ContinuityAssessment {
  const issues: string[] = [];
  if (!brief.sequelTo) {
    return {
      isSequel: false,
      series: null,
      carriedItems: [],
      carriedClues: [],
      establishedConcepts: [],
      droppedConcepts: [],
      progressionWarnings: [],
      issues,
      ok: true,
    };
  }
  const candidates = library.filter((s) => s.id === brief.sequelTo).sort((a, b) => b.version - a.version);
  const prev = candidates[0];
  if (!prev) {
    issues.push(`sequelTo "${brief.sequelTo}" is not in the story library`);
    return { isSequel: true, series: null, carriedItems: [], carriedClues: [], establishedConcepts: [], droppedConcepts: [], progressionWarnings: [], issues, ok: false };
  }
  const established = prev.literacy.targetConcepts;
  const revisiting = new Set([...brief.targetConcepts, ...brief.reviewConcepts]);
  const dropped = established.filter((c) => !revisiting.has(c));
  const maxEstablished = Math.max(0, ...established.map((c) => conceptById.get(c)?.stage ?? 0));
  const progressionWarnings = brief.targetConcepts
    .filter((c) => !established.includes(c) && (conceptById.get(c)?.stage ?? 99) < maxEstablished)
    .map((c) => `"${c}" is earlier in the teaching order than concepts already taught in "${prev.id}"`);
  const series = prev.series
    ? { id: prev.series.id, title: prev.series.title, order: prev.series.order + 1, previousStoryId: prev.id }
    : { id: prev.id, title: prev.title, order: 2, previousStoryId: prev.id };
  return {
    isSequel: true,
    previous: { id: prev.id, title: prev.title, version: prev.version, seriesId: prev.series?.id, seriesOrder: prev.series?.order },
    series,
    carriedItems: prev.items.map((i) => i.id),
    carriedClues: prev.clues.map((c) => c.id),
    establishedConcepts: established,
    droppedConcepts: dropped,
    progressionWarnings,
    issues,
    ok: issues.length === 0,
  };
}
