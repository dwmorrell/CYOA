import { useEffect, useState } from 'react';
import type { Save } from '../storage/repo';
import { Page } from './common';
import { useApp } from './context';
import { childLibrary, type Playable } from './sources';

interface Row {
  story: Playable;
  save?: Save;
}

export function Library() {
  const { repo, catalog, child, profiles, setChild, go, keyboard } = useApp();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    (async () => {
      const stories = await childLibrary(repo, catalog);
      const saves = await repo.saves(child.id);
      if (live) setRows(stories.map((story) => ({ story, save: saves.find((s) => s.storyId === story.id) })));
    })().catch((e: unknown) => live && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      live = false;
    };
  }, [repo, catalog, child]);

  const startNewVersion = async (row: Row) => {
    await repo.startGame(child.id, await row.story.load());
    go(`#/read/${encodeURIComponent(row.story.id)}`);
  };

  const children = profiles.filter((p) => p.kind === 'child');
  return (
    <Page title="Story Quest" focusKey={child.id}>
      {children.length > 1 && (
        <div className="row">
          <label htmlFor="reader-select">Reading as</label>
          <select id="reader-select" className="input" value={child.id} onChange={(e) => setChild(e.target.value)}>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <p>Hi {child.name}. Pick an adventure. You choose what happens next.</p>
      {error && (
        <p className="status bad" role="alert">
          The stories could not be loaded. {error}
        </p>
      )}
      {rows === null && !error && <p role="status">Loading…</p>}
      {rows?.length === 0 && (
        <div className="empty">
          <h2>No adventures yet</h2>
          <p>A grown-up adds adventures in the grown-up area.</p>
        </div>
      )}
      {rows && rows.length > 0 && (
        <ul className="cards">
          {rows.map((row) => {
            const { story, save } = row;
            const olderVersion = save && save.storyHash !== story.hash;
            return (
              <li key={story.id} className="card">
                <h2>{story.title}</h2>
                {olderVersion && (
                  <p className="muted">
                    Your adventure is saved in version {save.storyVersion}. A new version ({story.version}) is ready; your place stays in the version you started.
                  </p>
                )}
                <div className="row">
                  <button type="button" className="btn primary" aria-label={`${save ? 'Continue' : 'Start'} ${story.title}`} onClick={() => go(`#/read/${encodeURIComponent(story.id)}`)}>
                    {save ? 'Continue' : 'Start'}
                  </button>
                  {olderVersion && (
                    <button type="button" className="btn" onClick={() => void startNewVersion(row)}>
                      Start the new version
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="row footer-row">
        <button type="button" className="btn" onClick={() => go('#/log')}>
          Adventure log
        </button>
        <button type="button" className="btn" onClick={() => go('#/settings')}>
          Reading settings
        </button>
        {keyboard && (
          <button type="button" className="btn" onClick={() => go('#/typing')}>
            Typing practice
          </button>
        )}
        <button type="button" className="btn" onClick={() => go('#/parent')}>
          Grown-ups
        </button>
      </div>
    </Page>
  );
}
