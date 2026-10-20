import type { Story } from '../engine/types';
import type { Repo } from '../storage/repo';
import { contentHash } from '../util/hash';
import { fetchStory, type Catalog } from './catalog';

/** A story a child is allowed to open: packaged with the app, or approved on this device. */
export interface Playable {
  id: string;
  title: string;
  version: number;
  /** Content hash (canonical JSON), the same identity saves use. */
  hash: string;
  source: 'app' | 'device';
  load: () => Promise<Story>;
}

export async function childLibrary(repo: Repo, catalog: Catalog): Promise<Playable[]> {
  const out = new Map<string, Playable>();
  for (const e of catalog.published) {
    // Saves refer to stories by content hash, so packaged stories are loaded
    // (and byte-checked against the catalog) up front. They are small.
    const story = await fetchStory(e);
    out.set(e.id, { id: e.id, title: e.title, version: e.version, hash: contentHash(story), source: 'app', load: async () => story });
  }
  // A parent-approved device version takes precedence over the packaged one.
  for (const entry of await repo.library()) {
    const approved = entry.approved;
    if (!approved) continue;
    out.set(entry.storyId, {
      id: entry.storyId,
      title: entry.title,
      version: approved.version,
      hash: approved.hash,
      source: 'device',
      load: async () => {
        const story = await repo.snapshot(entry.storyId, approved.hash);
        if (!story) throw new Error(`"${entry.title}" is missing from this device.`);
        return story;
      },
    });
  }
  return [...out.values()].sort((a, b) => a.title.localeCompare(b.title));
}
