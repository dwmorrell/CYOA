import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { LibraryEntry } from '../../storage/repo';
import { blankStory, downloadJson, exportStory, parseImport } from '../../storage/transfer';
import { slugify } from '../../production/request';
import { fetchStory } from '../catalog';
import { Page } from '../common';
import { useApp } from '../context';

export default function ParentHome() {
  const { repo, profiles, catalog, go, lockParent, reloadProfiles } = useApp();
  const [library, setLibrary] = useState<LibraryEntry[] | null>(null);
  const [message, setMessage] = useState('');
  const [newChild, setNewChild] = useState('');
  const [pins, setPins] = useState({ old: '', next: '' });

  const refresh = useCallback(async () => setLibrary(await repo.library()), [repo]);
  useEffect(() => void refresh(), [refresh]);

  const report = (text: string) => setMessage(text);
  const fail = (e: unknown) => report(e instanceof Error ? e.message : String(e));
  const parentName = profiles.find((p) => p.kind === 'parent')?.name ?? 'Parent';

  /** Saves an incoming story as a draft, raising its version if an approved one exists. */
  const addDraft = async (incoming: Parameters<typeof repo.saveDraft>[0], source: Parameters<typeof repo.saveDraft>[2]) => {
    const existing = (await repo.library()).find((e) => e.storyId === incoming.id);
    const floor = Math.max(0, ...(existing?.versions.map((v) => v.version) ?? []));
    const bumped = existing && incoming.version <= floor ? { ...incoming, version: floor + 1 } : incoming;
    await repo.saveDraft(bumped, parentName, source);
    await refresh();
    return bumped;
  };

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const result = parseImport(await file.text());
    if (!result.ok) return report(`Could not import ${file.name}: ${result.errors.slice(0, 5).join('; ')}`);
    try {
      const saved = await addDraft(result.story, 'import');
      report(`Imported "${saved.title}" as a draft (version ${saved.version}). ${result.note ?? ''}`);
    } catch (err) {
      fail(err);
    }
  };

  const onNew = async () => {
    const title = `New adventure ${new Date().toISOString().slice(0, 10)}`;
    let id = slugify(title);
    const taken = new Set((await repo.library()).map((e) => e.storyId));
    for (let n = 2; taken.has(id); n++) id = `${slugify(title)}-${n}`;
    await repo.saveDraft(blankStory(id, title, new Date().toISOString().slice(0, 10)), parentName, 'editor');
    go(`#/parent/edit/${encodeURIComponent(id)}`);
  };

  const onExport = async (entry: LibraryEntry) => {
    const story = await repo.draft(entry.storyId);
    if (story) downloadJson(`${entry.storyId}.v${story.version}.json`, exportStory(story, entry.approved));
  };

  const onAddChild = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await repo.addChild(newChild);
      setNewChild('');
      await reloadProfiles();
      report('Reader added.');
    } catch (err) {
      fail(err);
    }
  };

  const onChangePin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await repo.changePin(pins.old, pins.next);
      setPins({ old: '', next: '' });
      report('PIN changed.');
    } catch (err) {
      fail(err);
    }
  };

  return (
    <Page
      title="Grown-up area"
      className="studio"
      nav={
        <nav className="reader-bar" aria-label="Grown-up controls">
          <button
            type="button"
            className="btn small"
            onClick={() => {
              lockParent();
              go('#/');
            }}
          >
            Lock and return to play
          </button>
        </nav>
      }
    >
      <p role="status" className="muted">
        {message}
      </p>

      <h2>Stories on this device</h2>
      <p className="muted">Readers only see a story after you approve it. Editing an approved story makes a new draft; the approved version stays in the reader’s library until you approve the new one, and anyone mid-way through keeps playing the version they started.</p>
      {library === null ? (
        <p role="status">Loading…</p>
      ) : library.length === 0 ? (
        <p>No stories yet. Import one, copy a packaged story, or start a new one.</p>
      ) : (
        <ul className="cards">
          {library.map((entry) => {
            const draftVersion = entry.draftHash ? entry.versions.find((v) => v.hash === entry.draftHash)?.version : undefined;
            return (
              <li key={entry.storyId} className="card">
                <h3>{entry.title}</h3>
                <p>
                  {entry.approved ? `In the reader’s library: version ${entry.approved.version} (approved by ${entry.approved.by})` : 'Not in the reader’s library'}
                  {draftVersion !== undefined && ` · Draft: version ${draftVersion}`}
                </p>
                <div className="row">
                  <button type="button" className="btn primary" aria-label={`Edit ${entry.title}`} onClick={() => go(`#/parent/edit/${encodeURIComponent(entry.storyId)}`)}>
                    Edit and approve
                  </button>
                  <button type="button" className="btn" aria-label={`Preview ${entry.title}`} onClick={() => go(`#/preview/device/${encodeURIComponent(entry.storyId)}`)}>
                    Preview
                  </button>
                  <button type="button" className="btn" aria-label={`Export ${entry.title}`} onClick={() => void onExport(entry)}>
                    Export
                  </button>
                  {entry.approved && (
                    <button type="button" className="btn" aria-label={`Remove ${entry.title} from the reader’s library`} onClick={() => void repo.withdraw(entry.storyId).then(refresh)}>
                      Remove from reader’s library
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="row">
        <label className="btn file-btn">
          Import a story file…
          <input type="file" accept="application/json,.json" className="visually-hidden" onChange={(e) => void onImport(e)} />
        </label>
        <button type="button" className="btn" onClick={() => void onNew()}>
          Write a new story
        </button>
      </div>

      {(catalog.published.length > 0 || catalog.previews.length > 0) && (
        <>
          <h2>From the story workshop</h2>
          <p className="muted">Stories packaged with the app. Workshop drafts have not finished their reviews.</p>
          <ul className="cards">
            {[...catalog.published.map((e) => ({ e, kind: 'packaged' as const })), ...catalog.previews.map((e) => ({ e, kind: 'workshop' as const }))].map(({ e, kind }) => (
              <li key={`${kind}:${e.id}`} className="card">
                <h3>{e.title}</h3>
                <p>
                  {kind === 'packaged' ? 'Packaged and approved' : `Workshop draft, status: ${'jobState' in e ? e.jobState : ''}`} · version {e.version}
                </p>
                <div className="row">
                  {kind === 'workshop' && (
                    <button type="button" className="btn" aria-label={`Preview ${e.title}`} onClick={() => go(`#/preview/workshop/${encodeURIComponent(e.id)}`)}>
                      Preview
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn"
                    aria-label={`Copy ${e.title} to edit on this device`}
                    onClick={() =>
                      void fetchStory(e)
                        .then((s) => addDraft(s, kind === 'packaged' ? 'bundled-copy' : 'workshop-draft'))
                        .then((s) => report(`Copied "${s.title}" to this device as a draft (version ${s.version}).`))
                        .catch(fail)
                    }
                  >
                    Copy to edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Readers</h2>
      <ul>
        {profiles
          .filter((p) => p.kind === 'child')
          .map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
      </ul>
      <form className="row" onSubmit={onAddChild}>
        <label htmlFor="new-child">Add a reader</label>
        <input id="new-child" className="input" value={newChild} onChange={(e) => setNewChild(e.target.value)} autoComplete="off" />
        <button type="submit" className="btn">
          Add
        </button>
      </form>

      <h2>Grown-up PIN</h2>
      <form className="form" onSubmit={onChangePin}>
        <label htmlFor="old-pin">Current PIN</label>
        <input id="old-pin" className="input" type="password" inputMode="numeric" value={pins.old} onChange={(e) => setPins({ ...pins, old: e.target.value })} autoComplete="current-password" />
        <label htmlFor="new-pin">New PIN (4 to 8 digits)</label>
        <input id="new-pin" className="input" type="password" inputMode="numeric" value={pins.next} onChange={(e) => setPins({ ...pins, next: e.target.value })} autoComplete="new-password" />
        <button type="submit" className="btn">
          Change PIN
        </button>
      </form>
    </Page>
  );
}
