import { cpSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathsFor, type Paths } from '../scripts/lib/repo';
import type { Story } from '../src/engine/types';
import type { StoryRequest } from '../src/production/request';
import { clone, fixture, ROOT } from './helpers';

/** A throwaway repository root with the config and prompt the pipeline reads. */
export function sandbox(): Paths {
  const dir = mkdtempSync(join(tmpdir(), 'cyoa-test-'));
  cpSync(join(ROOT, 'config'), join(dir, 'config'), { recursive: true });
  cpSync(join(ROOT, 'prompts'), join(dir, 'prompts'), { recursive: true });
  return pathsFor(dir);
}

export function request(overrides: Partial<StoryRequest> = {}): StoryRequest {
  return {
    genre: 'Hill adventure',
    theme: 'Looking carefully',
    premise: 'The Lost Kite. Max has lost a red kite on a windy hill.',
    targetMinutes: 5,
    literacy: { targetConcepts: ['digraph-sh', 'closed-syllable'] },
    wordSettings: { sets: [{ label: 'sh words', concept: 'digraph-sh', words: ['shed', 'fish', 'shut'], minOccurrences: 4 }] },
    requestedBy: 'Test Parent',
    ...overrides,
  };
}

/** The fixture story adjusted to match the job's story id. */
export function draftFor(storyId: string, edit: (s: Story) => void = () => undefined): Story {
  const s = clone(fixture());
  s.id = storyId;
  edit(s);
  return s;
}

export function writeDraft(paths: Paths, name: string, story: Story | string): string {
  const file = join(paths.root, name);
  writeFileSync(file, typeof story === 'string' ? story : JSON.stringify(story, null, 2));
  return file;
}
