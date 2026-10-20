import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Story } from '../../src/engine/types';
import type { TerminologyProfile } from '../../src/literacy/taxonomy';
import type { Job } from '../../src/production/job';
import { DEFAULT_POLICY, type PublicationPolicy } from '../../src/production/gates';
import { isStory } from '../../src/validation/schema';
import { sha256 } from '../../src/util/hash';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export interface Paths {
  root: string;
  jobs: string;
  publicStories: string;
  catalog: string;
}

export function pathsFor(root = ROOT): Paths {
  return {
    root,
    jobs: join(root, 'stories', 'jobs'),
    publicStories: join(root, 'public', 'stories'),
    catalog: join(root, 'public', 'stories', 'catalog.json'),
  };
}

export const rel = (paths: Paths, abs: string) => relative(paths.root, abs).split('\\').join('/');

export function readText(path: string): string {
  return readFileSync(path, 'utf8');
}

export function readJsonFile<T = unknown>(path: string): T {
  return JSON.parse(readText(path)) as T;
}

/** Writes pretty JSON with a trailing newline; returns the file's sha256. */
export function writeJsonFile(path: string, value: unknown): string {
  return writeTextFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function writeTextFile(path: string, text: string): string {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
  return sha256(text);
}

export const fileSha = (path: string) => sha256(readText(path));

export const jobDir = (paths: Paths, id: string) => join(paths.jobs, id);

export function loadJob(paths: Paths, id: string): Job {
  const file = join(jobDir(paths, id), 'job.json');
  if (!existsSync(file)) throw new Error(`No job "${id}" in ${rel(paths, paths.jobs)}`);
  return readJsonFile<Job>(file);
}

export function saveJob(paths: Paths, job: Job): void {
  writeJsonFile(join(jobDir(paths, job.id), 'job.json'), job);
}

export function listJobs(paths: Paths): Job[] {
  if (!existsSync(paths.jobs)) return [];
  return readdirSync(paths.jobs, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(paths.jobs, d.name, 'job.json')))
    .map((d) => loadJob(paths, d.name));
}

export interface CatalogEntry {
  id: string;
  title: string;
  version: number;
  path: string;
  sha256: string;
  jobId: string;
  series?: Story['series'];
}

export interface Catalog {
  catalogVersion: 1;
  published: (CatalogEntry & { publishedAt: string; reviews?: { role: string; reviewer: string; kind: string }[] })[];
  previews: (CatalogEntry & { jobState: string; gates: { id: string; ok: boolean; detail: string }[]; updatedAt: string })[];
}

export function loadCatalog(paths: Paths): Catalog {
  if (!existsSync(paths.catalog)) return { catalogVersion: 1, published: [], previews: [] };
  return readJsonFile<Catalog>(paths.catalog);
}

export function saveCatalog(paths: Paths, catalog: Catalog): void {
  writeJsonFile(paths.catalog, catalog);
}

/** Every story the series checker may refer back to: published, previews and job drafts. */
export function loadLibrary(paths: Paths): Story[] {
  const catalog = loadCatalog(paths);
  const stories: Story[] = [];
  for (const e of [...catalog.published, ...catalog.previews]) {
    const file = join(paths.publicStories, e.path);
    if (existsSync(file)) {
      const data = readJsonFile(file);
      if (isStory(data)) stories.push(data);
    }
  }
  for (const job of listJobs(paths)) {
    const draft = job.revisions.at(-1)?.draft;
    if (!draft) continue;
    const data = readJsonFile(join(paths.root, draft.path));
    if (isStory(data)) stories.push(data);
  }
  return stories;
}

export function loadPolicy(paths: Paths): PublicationPolicy {
  const file = join(paths.root, 'config', 'publication-policy.json');
  if (!existsSync(file)) return DEFAULT_POLICY;
  const p = readJsonFile<Partial<PublicationPolicy>>(file);
  return { requiredReviews: p.requiredReviews ?? DEFAULT_POLICY.requiredReviews, requireHumanReviewFor: p.requireHumanReviewFor ?? DEFAULT_POLICY.requireHumanReviewFor };
}

export function loadProfile(paths: Paths, id?: string): TerminologyProfile | undefined {
  const file = join(paths.root, 'config', 'literacy-profiles.json');
  if (!existsSync(file)) return undefined;
  const cfg = readJsonFile<{ default: string; profiles: TerminologyProfile[] }>(file);
  return cfg.profiles.find((p) => p.id === (id ?? cfg.default));
}

/**
 * Cross-process lock for one job folder, so two agents recording reviews at
 * the same moment cannot overwrite each other's job.json update.
 */
export function withJobLock<T>(paths: Paths, id: string, fn: () => T, timeoutMs = 15_000): T {
  const lock = join(paths.jobs, `.${id}.lock`);
  mkdirSync(paths.jobs, { recursive: true });
  const started = Date.now();
  for (;;) {
    try {
      mkdirSync(lock);
      break;
    } catch {
      if (Date.now() - started > timeoutMs) throw new Error(`Job ${id} is locked by another process (${lock}). Remove the folder if no other process is running.`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    }
  }
  try {
    return fn();
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}
