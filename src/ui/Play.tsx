import { useEffect, useState } from 'react';
import { newGame } from '../engine/story-engine';
import type { GameState, Story } from '../engine/types';
import type { Save } from '../storage/repo';
import { fetchStory } from './catalog';
import { BackBar, Page } from './common';
import { useApp } from './context';
import { Reader } from './Reader';
import { childLibrary } from './sources';

function Problem({ message, back = '#/' }: { message: string; back?: string }) {
  return (
    <Page title="Something went wrong" nav={<BackBar to={back} label="Back" />}>
      <p>{message}</p>
    </Page>
  );
}

/**
 * A child's playthrough. Resumes the saved game in the exact story version it
 * started with; only starts the current version when there is no save.
 */
export function PlayChild({ storyId }: { storyId: string }) {
  const { repo, catalog, child, go } = useApp();
  const [game, setGame] = useState<{ save: Save; story: Story } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      const existing = await repo.loadSave(child.id, storyId);
      if (existing) return existing;
      const playable = (await childLibrary(repo, catalog)).find((s) => s.id === storyId);
      if (!playable) throw new Error('That adventure is not in the library.');
      return repo.startGame(child.id, await playable.load());
    })()
      .then((g) => live && setGame(g))
      .catch((e: unknown) => live && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      live = false;
    };
  }, [repo, catalog, child, storyId]);

  if (error) return <Problem message={error} />;
  if (!game) return <p role="status">Loading…</p>;
  const onState = async (state: GameState, extra?: { wordLookedUp?: string }) => {
    if (state !== game.save.state) {
      const save = await repo.writeSave(game.save, state);
      setGame({ ...game, save });
    }
    await repo.recordProgress(child.id, storyId, state, extra);
  };
  return <Reader story={game.story} state={game.save.state} onState={onState} onExit={() => go('#/')} />;
}

/** Parent preview of a draft. Kept in memory only, so it never touches a child's save or progress. */
export function PlayPreview({ storyId, source }: { storyId: string; source: 'device' | 'workshop' }) {
  const { repo, catalog, go } = useApp();
  const [story, setStory] = useState<Story | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    (async () => {
      if (source === 'workshop') {
        const entry = catalog.previews.find((p) => p.id === storyId);
        if (!entry) throw new Error('That workshop draft is not available.');
        return fetchStory(entry);
      }
      const s = await repo.draft(storyId);
      if (!s) throw new Error('That story is not on this device.');
      return s;
    })()
      .then((s) => {
        if (!live) return;
        setStory(s);
        setState(newGame(s));
      })
      .catch((e: unknown) => live && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      live = false;
    };
  }, [repo, catalog, storyId, source]);
  if (error) return <Problem message={error} back="#/parent" />;
  if (!story || !state) return <p role="status">Loading…</p>;
  return (
    <Reader
      story={story}
      state={state}
      onState={(s) => setState(s)}
      onExit={() => go('#/parent')}
      exitLabel="Grown-up area"
      banner={`Grown-up preview of version ${story.version}. Nothing here is saved. Literacy review: ${story.literacy.review.status}.`}
    />
  );
}
