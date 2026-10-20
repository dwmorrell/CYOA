import type { Story } from '../engine/types';
import { validateSchema } from '../validation/schema';
import type { Approval } from './repo';

// Story import and export (master spec section 6). An export is a small JSON
// bundle; a plain story file is also accepted on import.

export const EXPORT_FORMAT = 'story-quest/story-export';

export interface StoryExport {
  format: typeof EXPORT_FORMAT;
  formatVersion: 1;
  exportedAt: string;
  story: Story;
  /** Informational only: approval never transfers to another device. */
  approvedOnSourceDevice?: Pick<Approval, 'version' | 'by' | 'at'>;
}

export function exportStory(story: Story, approval?: Approval, now = new Date()): StoryExport {
  return {
    format: EXPORT_FORMAT,
    formatVersion: 1,
    exportedAt: now.toISOString(),
    story,
    approvedOnSourceDevice: approval && approval.hash ? { version: approval.version, by: approval.by, at: approval.at } : undefined,
  };
}

export type ImportResult = { ok: true; story: Story; note?: string } | { ok: false; errors: string[] };

export function parseImport(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { ok: false, errors: [`This is not a JSON file: ${(e as Error).message}`] };
  }
  const isBundle = typeof data === 'object' && data !== null && (data as { format?: unknown }).format === EXPORT_FORMAT;
  const story = isBundle ? (data as StoryExport).story : data;
  const schema = validateSchema(story);
  if (!schema.ok) return { ok: false, errors: schema.errors };
  return {
    ok: true,
    story: story as Story,
    note: isBundle && (data as StoryExport).approvedOnSourceDevice ? 'This story was approved on another device. Approval does not carry over; check and approve it here.' : undefined,
  };
}

export function downloadJson(filename: string, value: unknown): void {
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** A minimal valid starting point for a new story written in the editor. */
export function blankStory(id: string, title: string, today: string): Story {
  return {
    schemaVersion: '1.0',
    id,
    title,
    version: 1,
    metadata: {
      genre: 'Mystery',
      theme: 'Courage',
      premise: 'Describe the adventure in a sentence or two.',
      estimatedMinutes: 20,
      authorship: { narrative: 'Parent (in-app editor)', origin: 'human' },
      createdAt: today,
    },
    literacy: { targetConcepts: [], wordSets: [], review: { status: 'pending' } },
    start: 'start',
    items: [],
    clues: [],
    passages: [
      {
        id: 'start',
        title: 'The beginning',
        paragraphs: ['Write the opening here.'],
        choices: [
          { id: 'go-left', label: 'Go left', target: 'ending-one' },
          { id: 'go-right', label: 'Go right', target: 'ending-two' },
        ],
      },
      { id: 'ending-one', paragraphs: ['One ending.'], choices: [], ending: { id: 'ending-one', kind: 'triumph', title: 'The first ending' } },
      { id: 'ending-two', paragraphs: ['Another ending.'], choices: [], ending: { id: 'ending-two', kind: 'setback', title: 'Try again' } },
    ],
  };
}
