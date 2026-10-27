import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Story } from '../../engine/types';
import { AI_REVIEWS_NOT_CONFIRMED, type LibraryEntry, type Repo } from '../../storage/repo';
import { blankStory, downloadJson, exportStory, parseImport } from '../../storage/transfer';
import { slugify } from '../../production/request';
import { validateDraft, validationIssues } from '../../production/validate-draft';
import { fetchStory, readyForParentReview, type CatalogEntry, type PreviewEntry } from '../catalog';
import { Page } from '../common';
import { useApp } from '../context';
import { focusOptions, LiteracySummary, matchesFocus } from './LiteracySummary';
import { TypingLists } from './TypingLists';

/** The checkbox, checks summary and approve button shared by the device library and the workshop shelf. */
function ApprovalPanel({ story, confirmed, setConfirmed, onApprove, error }: { story: Story | null; confirmed: boolean; setConfirmed: (v: boolean) => void; onApprove: () => void; error: string }) {
  const validation = useMemo(() => (story ? validateDraft(story) : null), [story]);
  const { errors } = validation ? validationIssues(validation) : { errors: [] };

  return (
    <div className="form approve-inline">
      {validation === null ? (
        <p role="status">Checking…</p>
      ) : !validation.ok ? (
        <p className="status bad">
          {errors.length} problem(s) to fix in the editor before version {story!.version} can be approved.
        </p>
      ) : (
        <>
          <label className="toggle">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            <span>The AI literacy review and the AI QA review for this version have passed.</span>
          </label>
          <button type="button" className="btn primary" disabled={!confirmed} onClick={onApprove}>
            Approve version {story!.version}
          </button>
          {!confirmed && <p className="muted">{AI_REVIEWS_NOT_CONFIRMED}</p>}
        </>
      )}
      {error && (
        <p role="status" className="status bad">
          {error}
        </p>
      )}
    </div>
  );
}

/** Inline approve control for a draft already on this device, so a parent does not have to open the full editor just to approve it. */
function DraftApproval({ entry, repo, parentName, onApproved }: { entry: LibraryEntry; repo: Repo; parentName: string; onApproved: (e: LibraryEntry) => void }) {
  const [story, setStory] = useState<Story | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setStory(null);
    void repo.draft(entry.storyId).then((s) => setStory(s ?? null));
  }, [repo, entry.storyId, entry.draftHash]);

  if (!entry.draftHash) return null;

  const approve = async () => {
    try {
      const updated = await repo.approve(entry.storyId, { by: parentName, at: new Date().toISOString(), aiReviewsPassed: confirmed });
      setConfirmed(false);
      setError('');
      onApproved(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return <ApprovalPanel story={story} confirmed={confirmed} setConfirmed={setConfirmed} onApprove={() => void approve()} error={error} />;
}

/** Inline approve control for a story still on the workshop shelf: copies it to this device, then approves it in one step. */
function WorkshopApproval({
  entry,
  kind,
  repo,
  parentName,
  addDraft,
  onApproved,
}: {
  entry: CatalogEntry;
  kind: 'packaged' | 'workshop';
  repo: Repo;
  parentName: string;
  addDraft: (incoming: Story, source: Parameters<typeof repo.saveDraft>[2]) => Promise<Story>;
  onApproved: (updated: LibraryEntry, title: string) => void;
}) {
  const [story, setStory] = useState<Story | null>(null);
  const [checking, setChecking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const check = () => {
    setChecking(true);
    setError('');
    void fetchStory(entry)
      .then(setStory)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setChecking(false));
  };

  const approve = async () => {
    if (!story) return;
    try {
      const saved = await addDraft(story, kind === 'packaged' ? 'bundled-copy' : 'workshop-draft');
      const updated = await repo.approve(saved.id, { by: parentName, at: new Date().toISOString(), aiReviewsPassed: confirmed });
      setConfirmed(false);
      setError('');
      onApproved(updated, saved.title);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (!story)
    return (
      <div className="form approve-inline">
        <button type="button" className="btn" onClick={check} disabled={checking}>
          {checking ? 'Checking…' : 'Check and approve'}
        </button>
        {error && (
          <p role="status" className="status bad">
            {error}
          </p>
        )}
      </div>
    );
  return <ApprovalPanel story={story} confirmed={confirmed} setConfirmed={setConfirmed} onApprove={() => void approve()} error={error} />;
}

/** One card in "Stories on this device": edit/approve controls plus archive and permanent delete. */
function LibraryCard({
  entry,
  repo,
  parentName,
  go,
  onExport,
  refresh,
  report,
  confirmDelete,
  setConfirmDelete,
  onApproved,
}: {
  entry: LibraryEntry;
  repo: Repo;
  parentName: string;
  go: (hash: string) => void;
  onExport: (entry: LibraryEntry) => void;
  refresh: () => Promise<void>;
  report: (text: string) => void;
  confirmDelete: string | null;
  setConfirmDelete: (id: string | null) => void;
  onApproved: (updated: LibraryEntry) => void;
}) {
  const draftVersion = entry.draftHash ? entry.versions.find((v) => v.hash === entry.draftHash)?.version : undefined;
  const confirming = confirmDelete === entry.storyId;
  return (
    <li className="card">
      <h3>{entry.title}</h3>
      {entry.draftHash && <p className="ready-tag">{entry.approved ? 'Updated — ready for review' : 'Ready for review'}</p>}
      <p>
        {entry.approved ? `In the reader’s library: version ${entry.approved.version} (approved by ${entry.approved.by})` : 'Not in the reader’s library'}
        {draftVersion !== undefined && ` · Draft: version ${draftVersion}`}
        {entry.archived && ' · Archived'}
      </p>
      <div className="row">
        <button type="button" className="btn primary" aria-label={`Edit ${entry.title}`} onClick={() => go(`#/parent/edit/${encodeURIComponent(entry.storyId)}`)}>
          Edit and approve
        </button>
        <button type="button" className="btn" aria-label={`Preview ${entry.title}`} onClick={() => go(`#/preview/device/${encodeURIComponent(entry.storyId)}`)}>
          Preview
        </button>
        <button type="button" className="btn" aria-label={`Export ${entry.title}`} onClick={() => onExport(entry)}>
          Export
        </button>
        {entry.approved && (
          <button type="button" className="btn" aria-label={`Remove ${entry.title} from the reader’s library`} onClick={() => void repo.withdraw(entry.storyId).then(refresh)}>
            Remove from reader’s library
          </button>
        )}
        <button
          type="button"
          className="btn"
          aria-label={entry.archived ? `Restore ${entry.title} to the main list` : `Archive ${entry.title}`}
          onClick={() => void repo.setArchived(entry.storyId, !entry.archived).then(refresh)}
        >
          {entry.archived ? 'Restore' : 'Archive'}
        </button>
        <button type="button" className="btn danger" aria-label={`Delete ${entry.title}`} onClick={() => setConfirmDelete(entry.storyId)}>
          Delete
        </button>
      </div>
      {confirming && (
        <div className="form">
          <p className="status bad">
            {entry.approved
              ? `Delete "${entry.title}" permanently? It will also disappear from the reader’s library, and every saved version on this device will be gone. This cannot be undone.`
              : `Delete "${entry.title}" permanently? Every saved version on this device will be gone. This cannot be undone.`}
          </p>
          <div className="row">
            <button
              type="button"
              className="btn danger"
              onClick={() =>
                void repo
                  .remove(entry.storyId)
                  .then(refresh)
                  .then(() => {
                    setConfirmDelete(null);
                    report(`Deleted "${entry.title}".`);
                  })
              }
            >
              Yes, delete permanently
            </button>
            <button type="button" className="btn" onClick={() => setConfirmDelete(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <DraftApproval entry={entry} repo={repo} parentName={parentName} onApproved={onApproved} />
    </li>
  );
}

export default function ParentHome() {
  const { repo, profiles, catalog, go, lockParent, reloadProfiles } = useApp();
  const [library, setLibrary] = useState<LibraryEntry[] | null>(null);
  const [message, setMessage] = useState('');
  const [newChild, setNewChild] = useState('');
  const [pins, setPins] = useState({ old: '', next: '' });
  const [focus, setFocus] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const refresh = useCallback(async () => setLibrary(await repo.library()), [repo]);
  useEffect(() => void refresh(), [refresh]);

  const report = (text: string) => setMessage(text);
  const fail = (e: unknown) => report(e instanceof Error ? e.message : String(e));
  const parentName = profiles.find((p) => p.kind === 'parent')?.name ?? 'Parent';
  const workshop = [...catalog.published.map((e) => ({ e, kind: 'packaged' as const })), ...catalog.previews.map((e) => ({ e, kind: 'workshop' as const }))];
  const focusChoices = focusOptions(workshop.map(({ e }) => e.literacySummary));
  const shown = workshop.filter(({ e }) => matchesFocus(e.literacySummary, focus));

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
        (() => {
          const active = library.filter((e) => !e.archived);
          const archived = library.filter((e) => e.archived);
          const onApprovedIn = (updated: LibraryEntry) => {
            setLibrary((lib) => lib?.map((e) => (e.storyId === updated.storyId ? updated : e)) ?? lib);
            report(`Version ${updated.approved?.version} is now in the reader’s library.`);
          };
          return (
            <>
              {active.length === 0 ? (
                <p>No stories on the main list. Import one, copy a packaged story, start a new one, or restore an archived one below.</p>
              ) : (
                <ul className="cards">
                  {active.map((entry) => (
                    <LibraryCard key={entry.storyId} entry={entry} repo={repo} parentName={parentName} go={go} onExport={onExport} refresh={refresh} report={report} confirmDelete={confirmDelete} setConfirmDelete={setConfirmDelete} onApproved={onApprovedIn} />
                  ))}
                </ul>
              )}
              {archived.length > 0 && (
                <details className="pack" open={showArchived} onToggle={(e) => setShowArchived(e.currentTarget.open)}>
                  <summary>Archived stories ({archived.length})</summary>
                  <ul className="cards">
                    {archived.map((entry) => (
                      <LibraryCard key={entry.storyId} entry={entry} repo={repo} parentName={parentName} go={go} onExport={onExport} refresh={refresh} report={report} confirmDelete={confirmDelete} setConfirmDelete={setConfirmDelete} onApproved={onApprovedIn} />
                    ))}
                  </ul>
                </details>
              )}
            </>
          );
        })()
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

      {workshop.length > 0 && (
        <>
          <h2>From the story workshop</h2>
          <p className="muted">Stories packaged with the app. Workshop drafts have not finished their reviews.</p>
          {focusChoices.length > 0 && (
            <div className="row">
              <label htmlFor="shelf-focus">Show stories that practise</label>
              <select id="shelf-focus" className="input" value={focus} onChange={(e) => setFocus(e.target.value)}>
                <option value="">Every story</option>
                {focusChoices.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {shown.length === 0 && <p className="empty">No story on the shelf practises that yet.</p>}
          <ul className="cards">
            {shown.map(({ e, kind }) => (
              <li key={`${kind}:${e.id}`} className="card">
                <h3>{e.title}</h3>
                {kind === 'workshop' && readyForParentReview(e as PreviewEntry) && <p className="ready-tag">Ready for review</p>}
                <p>
                  {kind === 'packaged' ? 'Packaged and approved' : `Workshop draft, status: ${'jobState' in e ? e.jobState : ''}`} · version {e.version}
                </p>
                <LiteracySummary summary={e.literacySummary} />
                {kind === 'workshop' && (
                  <div className="row">
                    <button type="button" className="btn" aria-label={`Preview ${e.title}`} onClick={() => go(`#/preview/workshop/${encodeURIComponent(e.id)}`)}>
                      Preview
                    </button>
                  </div>
                )}
                <WorkshopApproval
                  entry={e}
                  kind={kind}
                  repo={repo}
                  parentName={parentName}
                  addDraft={addDraft}
                  onApproved={(updated, title) => report(`Version ${updated.approved?.version} of "${title}" is now in the reader’s library.`)}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <TypingLists />

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
