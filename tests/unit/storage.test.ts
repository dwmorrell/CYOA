import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { clampPrefs, DEFAULT_PREFS, isGameState } from '../../src/engine/persistence';
import { choose } from '../../src/engine/story-engine';
import { indexedDbKv, memoryKv, type KvStore } from '../../src/storage/kv';
import { Repo } from '../../src/storage/repo';
import { blankStory, EXPORT_FORMAT, exportStory, parseImport } from '../../src/storage/transfer';
import { validateDraft } from '../../src/production/validate-draft';
import { contentHash } from '../../src/util/hash';
import { clone, fixture } from '../helpers';

const story = fixture();
let dbCount = 0;
const stores: [string, () => Promise<KvStore>][] = [
  ['memory', async () => memoryKv()],
  ['IndexedDB', async () => indexedDbKv(indexedDB, `test-${++dbCount}`)],
];

describe.each(stores)('KV store (%s)', (_name, make) => {
  it('round-trips values and lists keys by prefix', async () => {
    const kv = await make();
    await kv.set('save:a:x', { n: 1 });
    await kv.set('save:a:y', { n: 2 });
    await kv.set('save:b:x', { n: 3 });
    expect(await kv.get('save:a:x')).toEqual({ n: 1 });
    expect(await kv.keys('save:a:')).toEqual(['save:a:x', 'save:a:y']);
    await kv.delete('save:a:x');
    expect(await kv.get('save:a:x')).toBeUndefined();
  });

  it('returns copies, not shared references', async () => {
    const kv = await make();
    const v = { list: [1] };
    await kv.set('k', v);
    v.list.push(2);
    expect(await kv.get('k')).toEqual({ list: [1] });
  });
});

it('IndexedDB data survives reopening the database', async () => {
  const kv = await indexedDbKv(indexedDB, 'reopen-test');
  await new Repo(kv).setup('Sam', '1234', 'Ada');
  const again = new Repo(await indexedDbKv(indexedDB, 'reopen-test'));
  expect((await again.profiles()).map((p) => p.kind)).toEqual(['parent', 'child']);
  expect(again.kv.persistent).toBe(true);
});

const setUp = async () => {
  const repo = new Repo(memoryKv());
  const [parent, child] = await repo.setup('Sam', '2468', 'Ada');
  return { repo, parent: parent!, child: child! };
};

describe('profiles and the parent PIN', () => {
  it('creates one parent and one child, and checks the PIN', async () => {
    const { repo, parent } = await setUp();
    expect(parent.pin?.hash).not.toContain('2468');
    expect(await repo.verifyPin('2468')).toBe(true);
    expect(await repo.verifyPin('1111')).toBe(false);
    await expect(repo.setup('X', '1234', 'Y')).rejects.toThrow(/already exist/);
  });

  it('rejects weak PINs and requires the old PIN to change it', async () => {
    await expect(new Repo(memoryKv()).setup('P', '12', 'C')).rejects.toThrow(/4 to 8 digits/);
    const { repo } = await setUp();
    await expect(repo.changePin('0000', '9999')).rejects.toThrow(/not right/);
    await repo.changePin('2468', '9999');
    expect(await repo.verifyPin('9999')).toBe(true);
    expect(await repo.verifyPin('2468')).toBe(false);
  });

  it('keeps each child’s preferences separate and clamped', async () => {
    const { repo, child } = await setUp();
    const second = await repo.addChild('Ben');
    await repo.setPrefs(child.id, { ...DEFAULT_PREFS, fontScale: 9, font: 'dyslexic' });
    expect((await repo.prefs(child.id)).fontScale).toBe(2.2);
    expect((await repo.prefs(child.id)).font).toBe('dyslexic');
    expect(await repo.prefs(second.id)).toEqual(DEFAULT_PREFS);
  });

  it('merges older saved preferences onto new defaults', async () => {
    const { repo, child } = await setUp();
    const { wordHelp: _drop, ...old } = DEFAULT_PREFS;
    await repo.kv.set(`prefs:${child.id}`, { ...old, theme: 'dark' });
    const p = await repo.prefs(child.id);
    expect(p.theme).toBe('dark');
    expect(p.wordHelp).toBe(true);
  });

  it('clamps reading preferences to safe ranges', () => {
    const p = clampPrefs({ ...DEFAULT_PREFS, fontScale: 9, lineHeight: 0.5, letterSpacing: -1 });
    expect(p.fontScale).toBe(2.2);
    expect(p.lineHeight).toBe(1.4);
    expect(p.letterSpacing).toBe(0);
  });
});

describe('saves are tied to the story version they started with', () => {
  it('resumes in the original snapshot after the story changes', async () => {
    const { repo, child } = await setUp();
    const { save } = await repo.startGame(child.id, story);
    await repo.writeSave(save, choose(story, save.state, 'go-pond'));

    const v2 = clone(story);
    v2.version = 2;
    v2.passages = v2.passages.filter((p) => p.id !== 'pond');
    v2.passages.find((p) => p.id === 'hill')!.choices = v2.passages.find((p) => p.id === 'hill')!.choices.filter((c) => c.id !== 'go-pond');
    await repo.archive(v2);

    const loaded = await repo.loadSave(child.id, story.id);
    expect(loaded?.save.storyVersion).toBe(1);
    expect(loaded?.save.storyHash).toBe(contentHash(story));
    expect(loaded?.story).toEqual(story);
    expect(loaded?.save.state.current).toBe('pond');
  });

  it('starting the new version keeps endings already found', async () => {
    const { repo, child } = await setUp();
    const { save } = await repo.startGame(child.id, story);
    await repo.writeSave(save, { ...save.state, endingsSeen: ['win'] });
    const { save: fresh } = await repo.startGame(child.id, { ...story, version: 2 });
    expect(fresh.storyVersion).toBe(2);
    expect(fresh.state.current).toBe(story.start);
    expect(fresh.state.endingsSeen).toEqual(['win']);
  });

  it('ignores corrupt saves instead of crashing', async () => {
    const { repo, child } = await setUp();
    await repo.kv.set(`save:${child.id}:${story.id}`, { state: { nope: true } });
    expect(await repo.loadSave(child.id, story.id)).toBeUndefined();
    const { save } = await repo.startGame(child.id, story);
    await repo.kv.set(`save:${child.id}:${story.id}`, { ...save, storyHash: 'missing' });
    expect(await repo.loadSave(child.id, story.id)).toBeUndefined();
  });

  it('keeps saves per child', async () => {
    const { repo, child } = await setUp();
    const other = await repo.addChild('Ben');
    await repo.startGame(child.id, story);
    expect(await repo.saves(child.id)).toHaveLength(1);
    expect(await repo.saves(other.id)).toHaveLength(0);
  });

  it('requires puzzlesSolved in a saved state', () => {
    const { puzzlesSolved: _p, ...old } = { storyId: 'a', storyVersion: 1, current: 'x', items: [], clues: [], flags: [], history: [], endingsSeen: [], puzzlesSolved: [], startedAt: '', updatedAt: '' };
    expect(isGameState(old)).toBe(false);
  });
});

describe('device library: drafts and parent approval', () => {
  it('a draft is not approved until the parent approves it', async () => {
    const { repo } = await setUp();
    const entry = await repo.saveDraft(story, 'Sam', 'import');
    expect(entry.approved).toBeUndefined();
    const approved = await repo.approve(story.id, { by: 'Sam', at: 'now', literacyReviewStatus: 'pending', acknowledgedPendingLiteracyReview: true });
    expect(approved.approved?.version).toBe(1);
    expect(approved.draftHash).toBeUndefined();
    await expect(repo.approve(story.id, { by: 'Sam', at: 'now', literacyReviewStatus: 'pending', acknowledgedPendingLiteracyReview: true })).rejects.toThrow(/no draft/);
  });

  it('never overwrites an approved version; edits need a higher version', async () => {
    const { repo } = await setUp();
    await repo.saveDraft(story, 'Sam', 'editor');
    await repo.approve(story.id, { by: 'Sam', at: 'now', literacyReviewStatus: 'pending', acknowledgedPendingLiteracyReview: true });
    await expect(repo.saveDraft({ ...story, title: 'Changed' }, 'Sam', 'editor')).rejects.toThrow(/already approved/);
    const entry = await repo.saveDraft({ ...story, title: 'Changed', version: 2 }, 'Sam', 'editor');
    expect(entry.approved?.version).toBe(1);
    expect((await repo.snapshot(story.id, entry.approved!.hash))?.title).toBe(story.title);
    expect((await repo.draft(story.id))?.title).toBe('Changed');
    expect(entry.versions.map((v) => v.version)).toEqual([1, 2]);
  });

  it('withdraw removes a story from the child library but keeps it as a draft', async () => {
    const { repo } = await setUp();
    await repo.saveDraft(story, 'Sam', 'editor');
    await repo.approve(story.id, { by: 'Sam', at: 'now', literacyReviewStatus: 'pending', acknowledgedPendingLiteracyReview: true });
    await repo.withdraw(story.id);
    const [entry] = await repo.library();
    expect(entry?.approved).toBeUndefined();
    expect((await repo.draft(story.id))?.id).toBe(story.id);
  });
});

describe('progression', () => {
  it('records endings, clues, puzzles, words and pages', async () => {
    const { repo, child } = await setUp();
    await repo.recordProgress(child.id, story.id, { ...(await repo.startGame(child.id, story)).save.state, endingsSeen: ['win'], clues: ['red-thread'], puzzlesSolved: ['p1'] });
    const p = await repo.recordProgress(child.id, story.id, (await repo.loadSave(child.id, story.id))!.save.state, { wordLookedUp: 'pond' });
    expect(p.endings[story.id]).toEqual(['win']);
    expect(p.clues).toEqual([`${story.id}:red-thread`]);
    expect(p.puzzles).toEqual([`${story.id}:p1`]);
    expect(p.words).toEqual(['pond']);
    expect(p.pagesRead).toBe(1);
  });
});

describe('story import and export', () => {
  it('round-trips through an export bundle; approval does not carry over', () => {
    const bundle = exportStory(story, { hash: 'h', version: 1, by: 'Sam', at: 'now', literacyReviewStatus: 'pending', acknowledgedPendingLiteracyReview: true });
    expect(bundle.format).toBe(EXPORT_FORMAT);
    const result = parseImport(JSON.stringify(bundle));
    expect(result.ok && result.story).toEqual(story);
    expect(result.ok && result.note).toMatch(/does not carry over/);
  });

  it('accepts a plain story file and rejects invalid ones', () => {
    expect(parseImport(JSON.stringify(story)).ok).toBe(true);
    expect(parseImport('{oops').ok).toBe(false);
    const bad = parseImport(JSON.stringify({ ...story, passages: 'nope' }));
    expect(bad.ok).toBe(false);
  });

  it('a blank editor story is valid structurally', () => {
    const v = validateDraft(blankStory('new-one', 'New one', '2026-10-20'));
    expect(v.schema.ok).toBe(true);
    expect(v.graph?.ok).toBe(true);
  });
});
