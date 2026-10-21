import type { Story } from '../engine/types';
import type { ShelfSummary } from '../literacy/shelf-summary';
import { sha256 } from '../util/hash';

export interface CatalogEntry {
  id: string;
  title: string;
  version: number;
  path: string;
  sha256: string;
  jobId: string;
  series?: Story['series'];
  /** The literacy reviewer's at-a-glance summary for parents and tutors. */
  literacySummary?: ShelfSummary;
}

export interface PreviewEntry extends CatalogEntry {
  jobState: string;
  gates: { id: string; ok: boolean; detail: string }[];
  updatedAt: string;
}

export interface Catalog {
  catalogVersion: 1;
  published: (CatalogEntry & { publishedAt: string })[];
  previews: PreviewEntry[];
}

const BASE = './stories/';

export async function fetchCatalog(fetcher: typeof fetch = fetch): Promise<Catalog> {
  const res = await fetcher(`${BASE}catalog.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load the story list (${res.status})`);
  return (await res.json()) as Catalog;
}

/**
 * Loads a story and checks its bytes against the catalog hash, so a story
 * that was edited after approval is never shown as the approved version.
 */
export async function fetchStory(entry: CatalogEntry, fetcher: typeof fetch = fetch): Promise<Story> {
  const res = await fetcher(BASE + entry.path);
  if (!res.ok) throw new Error(`Could not load "${entry.title}" (${res.status})`);
  const text = await res.text();
  if (sha256(text) !== entry.sha256) throw new Error(`"${entry.title}" does not match its approved copy and was not opened.`);
  return JSON.parse(text) as Story;
}
