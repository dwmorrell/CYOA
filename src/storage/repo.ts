import { clampPrefs, DEFAULT_PREFS, isGameState, isReadingPrefs, type ReadingPrefs } from '../engine/persistence';
import { newGame } from '../engine/story-engine';
import type { GameState, Story } from '../engine/types';
import { contentHash, sha256 } from '../util/hash';
import { addScore, MAX_WORDS, WORD_PATTERN, type ScoreEntry, type TypingList } from '../typing/engine';
import type { KvStore } from './kv';

// Everything the app keeps on the device, on top of the async KV store.
// Key layout:
//   profiles                      Profile[]
//   prefs:<profileId>             ReadingPrefs
//   story:<storyId>:<hash>        Story snapshot (immutable)
//   save:<profileId>:<storyId>    Save (points at a snapshot by hash)
//   library                       LibraryEntry[] (parent-managed stories)
//   progress:<profileId>          Progress
//   typing:lists                  TypingList[] (typing practice add-on, not story data)
//   typing:scores:<listId>        ScoreEntry[], the high scores for one word list
//   keyboard:seen                 true once a hardware key was pressed on this device

export interface Profile {
  id: string;
  kind: 'parent' | 'child';
  name: string;
  createdAt: string;
  /** Parent only: salted SHA-256 of the PIN. A convenience lock, not security. */
  pin?: { salt: string; hash: string };
}

export const PIN_PATTERN = /^\d{4,8}$/;
const SCORES_PREFIX = 'typing:scores:';

/** Shown until a grown-up writes their own lists. */
export const DEFAULT_TYPING_LISTS: TypingList[] = [
  { id: 'starter', name: 'Starter words', words: ['cat', 'dog', 'sun', 'map', 'net', 'fog', 'bell', 'ship', 'stone', 'river'] },
];

function randomId(prefix: string): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `${prefix}-${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

const pinHash = (salt: string, pin: string) => sha256(`${salt}:${pin}`);

export class Repo {
  constructor(readonly kv: KvStore) {}

  // ---------- profiles ----------
  async profiles(): Promise<Profile[]> {
    return (await this.kv.get<Profile[]>('profiles')) ?? [];
  }

  async setup(parentName: string, pin: string, childName: string, now = new Date()): Promise<Profile[]> {
    if ((await this.profiles()).length) throw new Error('Profiles already exist');
    if (!PIN_PATTERN.test(pin)) throw new Error('The PIN must be 4 to 8 digits');
    if (!childName.trim()) throw new Error('Please enter the reader’s name');
    const salt = randomId('s');
    const list: Profile[] = [
      { id: randomId('parent'), kind: 'parent', name: parentName.trim() || 'Parent', createdAt: now.toISOString(), pin: { salt, hash: pinHash(salt, pin) } },
      { id: randomId('child'), kind: 'child', name: childName.trim(), createdAt: now.toISOString() },
    ];
    await this.kv.set('profiles', list);
    return list;
  }

  async verifyPin(pin: string): Promise<boolean> {
    const parent = (await this.profiles()).find((p) => p.kind === 'parent');
    return Boolean(parent?.pin && pinHash(parent.pin.salt, pin) === parent.pin.hash);
  }

  async changePin(oldPin: string, newPin: string): Promise<void> {
    if (!(await this.verifyPin(oldPin))) throw new Error('The current PIN is not right');
    if (!PIN_PATTERN.test(newPin)) throw new Error('The PIN must be 4 to 8 digits');
    const salt = randomId('s');
    await this.kv.set(
      'profiles',
      (await this.profiles()).map((p) => (p.kind === 'parent' ? { ...p, pin: { salt, hash: pinHash(salt, newPin) } } : p)),
    );
  }

  async addChild(name: string, now = new Date()): Promise<Profile> {
    if (!name.trim()) throw new Error('Please enter a name');
    const child: Profile = { id: randomId('child'), kind: 'child', name: name.trim(), createdAt: now.toISOString() };
    await this.kv.set('profiles', [...(await this.profiles()), child]);
    return child;
  }

  async renameProfile(id: string, name: string): Promise<void> {
    if (!name.trim()) throw new Error('Please enter a name');
    await this.kv.set(
      'profiles',
      (await this.profiles()).map((p) => (p.id === id ? { ...p, name: name.trim() } : p)),
    );
  }

  // ---------- reading preferences (per profile) ----------
  async prefs(profileId: string): Promise<ReadingPrefs> {
    const raw = await this.kv.get<unknown>(`prefs:${profileId}`);
    // Older or partial settings are merged onto the defaults.
    const merged = typeof raw === 'object' && raw !== null ? { ...DEFAULT_PREFS, ...(raw as object) } : DEFAULT_PREFS;
    return clampPrefs(isReadingPrefs(merged) ? merged : DEFAULT_PREFS);
  }

  async setPrefs(profileId: string, prefs: ReadingPrefs): Promise<void> {
    await this.kv.set(`prefs:${profileId}`, clampPrefs(prefs));
  }

  // ---------- typing practice add-on (kept apart from stories and progress) ----------
  async typingLists(): Promise<TypingList[]> {
    return (await this.kv.get<TypingList[]>('typing:lists')) ?? DEFAULT_TYPING_LISTS;
  }

  /** Saves the grown-up's lists. Every list needs a name and at least one valid word. */
  async saveTypingLists(lists: TypingList[]): Promise<void> {
    const ids = new Set<string>();
    for (const list of lists) {
      if (!list.name.trim()) throw new Error('Each word list needs a name');
      if (ids.has(list.id)) throw new Error(`The word list "${list.name}" appears twice`);
      ids.add(list.id);
      if (list.words.length === 0) throw new Error(`"${list.name}" needs at least one word`);
      if (list.words.length > MAX_WORDS) throw new Error(`"${list.name}" can hold up to ${MAX_WORDS} words`);
      if (list.words.some((w) => !WORD_PATTERN.test(w))) throw new Error(`"${list.name}" has a word with characters other than letters, apostrophes or hyphens`);
    }
    // A removed list takes its high scores with it.
    for (const key of await this.kv.keys(SCORES_PREFIX)) {
      if (!ids.has(key.slice(SCORES_PREFIX.length))) await this.kv.delete(key);
    }
    await this.kv.set('typing:lists', lists.map((l) => ({ id: l.id, name: l.name.trim(), words: l.words })));
  }

  /** The best laps on one word list, best first. */
  async highScores(listId: string): Promise<ScoreEntry[]> {
    return (await this.kv.get<ScoreEntry[]>(`${SCORES_PREFIX}${listId}`)) ?? [];
  }

  /** Records a finished lap and returns the updated list. */
  async recordHighScore(listId: string, entry: ScoreEntry): Promise<ScoreEntry[]> {
    const next = addScore(await this.highScores(listId), entry);
    await this.kv.set(`${SCORES_PREFIX}${listId}`, next);
    return next;
  }

  /** True once a hardware key has been pressed on this device. Sticky: it is never cleared. */
  async keyboardSeen(): Promise<boolean> {
    return (await this.kv.get<boolean>('keyboard:seen')) === true;
  }

  async markKeyboardSeen(): Promise<void> {
    await this.kv.set('keyboard:seen', true);
  }

  // ---------- immutable story snapshots ----------
  /** Stores an exact copy of a story; returns its content hash. */
  async archive(story: Story): Promise<string> {
    const hash = contentHash(story);
    const key = `story:${story.id}:${hash}`;
    if (!(await this.kv.get(key))) await this.kv.set(key, story);
    return hash;
  }

  async snapshot(storyId: string, hash: string): Promise<Story | undefined> {
    return this.kv.get<Story>(`story:${storyId}:${hash}`);
  }

  // ---------- saves: tied to the exact story version they started with ----------
  async loadSave(profileId: string, storyId: string): Promise<{ save: Save; story: Story } | undefined> {
    const save = await this.kv.get<Save>(`save:${profileId}:${storyId}`);
    if (!save || !isGameState(save.state)) return undefined;
    const story = await this.snapshot(storyId, save.storyHash);
    if (!story || !story.passages.some((p) => p.id === save.state.current)) return undefined;
    return { save, story };
  }

  async startGame(profileId: string, story: Story, now = new Date()): Promise<{ save: Save; story: Story }> {
    const hash = await this.archive(story);
    const previous = await this.kv.get<Save>(`save:${profileId}:${story.id}`);
    const fresh = newGame(story, now);
    const state: GameState = { ...fresh, endingsSeen: [...new Set([...(previous?.state.endingsSeen ?? []), ...fresh.endingsSeen])] };
    const save: Save = { profileId, storyId: story.id, storyVersion: story.version, storyHash: hash, state, startedAt: now.toISOString(), updatedAt: now.toISOString() };
    await this.kv.set(`save:${profileId}:${story.id}`, save);
    return { save, story };
  }

  async writeSave(save: Save, state: GameState, now = new Date()): Promise<Save> {
    const next = { ...save, state, updatedAt: now.toISOString() };
    await this.kv.set(`save:${save.profileId}:${save.storyId}`, next);
    return next;
  }

  async saves(profileId: string): Promise<Save[]> {
    const keys = await this.kv.keys(`save:${profileId}:`);
    return (await Promise.all(keys.map((k) => this.kv.get<Save>(k)))).filter((s): s is Save => Boolean(s));
  }

  // ---------- parent-managed device library ----------
  async library(): Promise<LibraryEntry[]> {
    return (await this.kv.get<LibraryEntry[]>('library')) ?? [];
  }

  private async putEntry(entry: LibraryEntry): Promise<void> {
    await this.kv.set('library', [...(await this.library()).filter((e) => e.storyId !== entry.storyId), entry]);
  }

  /**
   * Saves a draft version. A changed story must carry a higher version than
   * anything approved before, so an approved version is never overwritten.
   */
  async saveDraft(story: Story, by: string, source: VersionRecord['source'], now = new Date()): Promise<LibraryEntry> {
    const entry = (await this.library()).find((e) => e.storyId === story.id);
    const hash = contentHash(story);
    if (entry?.versions.some((v) => v.hash === hash)) {
      const updated = { ...entry, draftHash: entry.approved?.hash === hash ? undefined : hash, title: story.title };
      await this.putEntry(updated);
      return updated;
    }
    const approvedVersion = entry?.approved?.version ?? 0;
    if (story.version <= approvedVersion) throw new Error(`Version ${approvedVersion} is already approved. Raise the version number to save changes.`);
    await this.archive(story);
    const updated: LibraryEntry = {
      storyId: story.id,
      title: story.title,
      draftHash: hash,
      approved: entry?.approved,
      versions: [...(entry?.versions ?? []), { version: story.version, hash, savedAt: now.toISOString(), savedBy: by, source }],
    };
    await this.putEntry(updated);
    return updated;
  }

  async draft(storyId: string): Promise<Story | undefined> {
    const entry = (await this.library()).find((e) => e.storyId === storyId);
    const hash = entry?.draftHash ?? entry?.approved?.hash;
    return hash ? this.snapshot(storyId, hash) : undefined;
  }

  /**
   * Parent approval puts the current draft in the child library. It requires a
   * human literacy review recorded in the story itself (status passed, reviewer
   * kind human). An AI pre-review never counts, and the app never records one.
   */
  async approve(storyId: string, decision: { by: string; at: string }): Promise<LibraryEntry> {
    const entry = (await this.library()).find((e) => e.storyId === storyId);
    if (!entry?.draftHash) throw new Error('There is no draft to approve');
    const story = await this.snapshot(storyId, entry.draftHash);
    if (!story) throw new Error('The draft could not be found');
    const review = humanLiteracyReview(story);
    if (!review) throw new Error(NO_HUMAN_REVIEW);
    const approved: Approval = { hash: entry.draftHash, version: story.version, by: decision.by, at: decision.at, literacyReview: review };
    const updated: LibraryEntry = { ...entry, draftHash: undefined, approved };
    await this.putEntry(updated);
    return updated;
  }

  async withdraw(storyId: string): Promise<void> {
    const entry = (await this.library()).find((e) => e.storyId === storyId);
    if (entry?.approved) await this.putEntry({ ...entry, draftHash: entry.draftHash ?? entry.approved.hash, approved: undefined });
  }

  async remove(storyId: string): Promise<void> {
    await this.kv.set('library', (await this.library()).filter((e) => e.storyId !== storyId));
  }

  // ---------- progression ----------
  async progress(profileId: string): Promise<Progress> {
    return { ...EMPTY_PROGRESS, ...((await this.kv.get<Progress>(`progress:${profileId}`)) ?? {}) };
  }

  async recordProgress(profileId: string, storyId: string, state: GameState, extra: { wordLookedUp?: string } = {}): Promise<Progress> {
    const p = await this.progress(profileId);
    const add = (list: string[], values: string[]) => [...new Set([...list, ...values])];
    const next: Progress = {
      endings: { ...p.endings, [storyId]: add(p.endings[storyId] ?? [], state.endingsSeen) },
      clues: add(p.clues, state.clues.map((c) => `${storyId}:${c}`)),
      puzzles: add(p.puzzles, state.puzzlesSolved.map((x) => `${storyId}:${x}`)),
      words: extra.wordLookedUp ? add(p.words, [extra.wordLookedUp]) : p.words,
      pagesRead: p.pagesRead + (extra.wordLookedUp ? 0 : 1),
    };
    await this.kv.set(`progress:${profileId}`, next);
    return next;
  }
}

export interface Save {
  profileId: string;
  storyId: string;
  storyVersion: number;
  /** Content hash of the exact story snapshot this playthrough uses. */
  storyHash: string;
  state: GameState;
  startedAt: string;
  updatedAt: string;
}

export interface VersionRecord {
  version: number;
  hash: string;
  savedAt: string;
  savedBy: string;
  source: 'import' | 'editor' | 'bundled-copy' | 'workshop-draft';
}

/** A human literacy review, as recorded in the story's own literacy.review record. */
export interface HumanLiteracyReview {
  reviewer: string;
  date: string;
}

export interface Approval {
  hash: string;
  version: number;
  by: string;
  at: string;
  /** Always present: approval is refused without a recorded human literacy review. */
  literacyReview: HumanLiteracyReview;
}

export const NO_HUMAN_REVIEW = 'A human literacy review must be recorded in the story before it can be approved. Ask the literacy reviewer to record it.';

/** The human literacy review recorded in the story, or undefined. AI pre-reviews never qualify. */
export function humanLiteracyReview(story: Story): HumanLiteracyReview | undefined {
  const r = story.literacy.review;
  if (r.status !== 'passed' || r.reviewerKind !== 'human' || !r.reviewer?.trim() || !r.date?.trim()) return undefined;
  return { reviewer: r.reviewer.trim(), date: r.date.trim() };
}

export interface LibraryEntry {
  storyId: string;
  title: string;
  /** Unapproved working version, if any. */
  draftHash?: string;
  approved?: Approval;
  versions: VersionRecord[];
}

export interface Progress {
  endings: Record<string, string[]>;
  clues: string[];
  puzzles: string[];
  words: string[];
  pagesRead: number;
}

export const EMPTY_PROGRESS: Progress = { endings: {}, clues: [], puzzles: [], words: [], pagesRead: 0 };
