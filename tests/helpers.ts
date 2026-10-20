import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Story } from '../src/engine/types';

export const ROOT = join(import.meta.dirname, '..');

export function fixture(): Story {
  return JSON.parse(readFileSync(join(ROOT, 'tests', 'fixtures', 'mini-story.json'), 'utf8')) as Story;
}

export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
