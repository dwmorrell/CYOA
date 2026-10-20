import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { LEARNING_TARGETS, type Choice, type Collectible, type EndingKind, type LearningTarget, type Passage, type Story } from '../../engine/types';
import { validateDraft } from '../../production/validate-draft';
import type { LibraryEntry } from '../../storage/repo';
import { downloadJson, exportStory } from '../../storage/transfer';
import { contentHash } from '../../util/hash';
import { Page } from '../common';
import { useApp } from '../context';

// In-app story editor (master spec section 6). Structured forms cover the
// common fields; the JSON tab covers everything else (requirements, effects).
// Approval here puts a story in this device's child library only; it never
// touches the repository's story workflow, which keeps its own human gates.

type Tab = 'details' | 'pages' | 'things' | 'words' | 'json';
const TABS: [Tab, string][] = [
  ['details', 'Details'],
  ['pages', 'Pages'],
  ['things', 'Items and clues'],
  ['words', 'Word help'],
  ['json', 'JSON'],
];

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'x';

function uniqueId(base: string, taken: string[]): string {
  let id = slug(base);
  for (let n = 2; taken.includes(id); n++) id = `${slug(base)}-${n}`;
  return id;
}

function Field({ id, label, children }: { id: string; label: string; children: (id: string) => React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children(id)}
    </div>
  );
}

function TargetPicker({ legend, value, onChange }: { legend: string; value?: LearningTarget[]; onChange: (v: LearningTarget[] | undefined) => void }) {
  const set = new Set(value ?? []);
  return (
    <fieldset className="targets">
      <legend>{legend}</legend>
      {LEARNING_TARGETS.map((t) => (
        <label key={t} className="check">
          <input
            type="checkbox"
            checked={set.has(t)}
            onChange={(e) => {
              if (e.target.checked) set.add(t);
              else set.delete(t);
              onChange(set.size ? LEARNING_TARGETS.filter((x) => set.has(x)) : undefined);
            }}
          />
          {t}
        </label>
      ))}
    </fieldset>
  );
}

function CollectibleList({ title, kind, list, onChange }: { title: string; kind: string; list: Collectible[]; onChange: (l: Collectible[]) => void }) {
  const update = (i: number, patch: Partial<Collectible>) => onChange(list.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  return (
    <section>
      <h2>{title}</h2>
      {list.length === 0 && <p className="muted">None yet.</p>}
      {list.map((c, i) => (
        <fieldset key={i} className="form">
          <legend>
            {kind} id: <code>{c.id}</code>
          </legend>
          <Field id={`${kind}-${i}-name`} label="Name">
            {(id) => <input id={id} className="input" value={c.name} onChange={(e) => update(i, { name: e.target.value })} />}
          </Field>
          <Field id={`${kind}-${i}-desc`} label="Description">
            {(id) => <input id={id} className="input" value={c.description} onChange={(e) => update(i, { description: e.target.value })} />}
          </Field>
          <button type="button" className="btn small" onClick={() => onChange(list.filter((_, j) => j !== i))}>
            Remove {c.name || c.id}
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="btn"
        onClick={() => onChange([...list, { id: uniqueId(`${kind}-${list.length + 1}`, list.map((x) => x.id)), name: `New ${kind}`, description: 'Describe it.' }])}
      >
        Add {kind}
      </button>
    </section>
  );
}

function PassageEditor({ story, passage, onChange, onDelete }: { story: Story; passage: Passage; onChange: (p: Passage) => void; onDelete: () => void }) {
  const ids = story.passages.map((p) => p.id);
  const updateChoice = (i: number, patch: Partial<Choice>) => onChange({ ...passage, choices: passage.choices.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const pid = `pg-${passage.id}`;
  return (
    <div className="form">
      <p className="muted">
        Page id: <code>{passage.id}</code>
        {story.start === passage.id && ' (the first page)'}
      </p>
      <Field id={`${pid}-title`} label="Page title">
        {(id) => <input id={id} className="input" value={passage.title ?? ''} onChange={(e) => onChange({ ...passage, title: e.target.value || undefined })} />}
      </Field>
      <Field id={`${pid}-text`} label="Text (leave a blank line between paragraphs)">
        {(id) => (
          <textarea
            id={id}
            className="input"
            rows={8}
            value={passage.paragraphs.join('\n\n')}
            onChange={(e) =>
              onChange({
                ...passage,
                paragraphs: e.target.value
                  .split(/\n\s*\n/)
                  .map((s) => s.replace(/\s+/g, ' ').trim())
                  .filter(Boolean),
              })
            }
          />
        )}
      </Field>
      <TargetPicker legend="What this page practises" value={passage.learningTargets} onChange={(learningTargets) => onChange({ ...passage, learningTargets })} />

      <label className="check">
        <input
          type="checkbox"
          checked={Boolean(passage.ending)}
          onChange={(e) =>
            onChange(e.target.checked ? { ...passage, choices: [], puzzle: undefined, ending: { id: passage.id, kind: 'triumph', title: passage.title ?? 'The end' } } : { ...passage, ending: undefined })
          }
        />
        This page is an ending
      </label>

      {passage.ending ? (
        <fieldset className="form">
          <legend>Ending</legend>
          <Field id={`${pid}-end-title`} label="Ending title">
            {(id) => <input id={id} className="input" value={passage.ending!.title} onChange={(e) => onChange({ ...passage, ending: { ...passage.ending!, title: e.target.value } })} />}
          </Field>
          <Field id={`${pid}-end-kind`} label="Kind of ending">
            {(id) => (
              <select id={id} className="input" value={passage.ending!.kind} onChange={(e) => onChange({ ...passage, ending: { ...passage.ending!, kind: e.target.value as EndingKind } })}>
                <option value="triumph">Bright (triumph)</option>
                <option value="bittersweet">Quiet (bittersweet)</option>
                <option value="setback">Not the end yet (setback)</option>
              </select>
            )}
          </Field>
        </fieldset>
      ) : (
        <>
          <h3>Choices</h3>
          {passage.choices.map((c, i) => (
            <fieldset key={i} className="form">
              <legend>Choice {i + 1}</legend>
              <Field id={`${pid}-c${i}-label`} label="What the reader taps">
                {(id) => <input id={id} className="input" value={c.label} onChange={(e) => updateChoice(i, { label: e.target.value })} />}
              </Field>
              <Field id={`${pid}-c${i}-target`} label="Goes to page">
                {(id) => (
                  <select id={id} className="input" value={c.target} onChange={(e) => updateChoice(i, { target: e.target.value })}>
                    {ids.map((x) => (
                      <option key={x} value={x}>
                        {story.passages.find((p) => p.id === x)?.title ?? x} ({x})
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              {c.requires && (
                <Field id={`${pid}-c${i}-hint`} label="Hint when locked">
                  {(id) => <input id={id} className="input" value={c.lockedHint ?? ''} onChange={(e) => updateChoice(i, { lockedHint: e.target.value || undefined })} />}
                </Field>
              )}
              <p className="muted">Needs and effects are edited on the JSON tab.</p>
              <button type="button" className="btn small" onClick={() => onChange({ ...passage, choices: passage.choices.filter((_, j) => j !== i) })}>
                Remove choice {i + 1}
              </button>
            </fieldset>
          ))}
          <button
            type="button"
            className="btn"
            onClick={() =>
              onChange({
                ...passage,
                choices: [...passage.choices, { id: uniqueId(`${passage.id}-choice`, story.passages.flatMap((p) => p.choices.map((c) => c.id))), label: 'New choice', target: story.start }],
              })
            }
          >
            Add a choice
          </button>

          <h3>Typing puzzle (optional)</h3>
          <p className="muted">Never timed. Readers can always carry on without solving it, so no choice may depend on it.</p>
          {passage.puzzle ? (
            <fieldset className="form">
              <legend>Puzzle</legend>
              <Field id={`${pid}-pz-prompt`} label="Question">
                {(id) => <input id={id} className="input" value={passage.puzzle!.prompt} onChange={(e) => onChange({ ...passage, puzzle: { ...passage.puzzle!, prompt: e.target.value } })} />}
              </Field>
              <Field id={`${pid}-pz-answers`} label="Accepted answers (comma separated)">
                {(id) => (
                  <input
                    id={id}
                    className="input"
                    value={passage.puzzle!.answers.join(', ')}
                    onChange={(e) => onChange({ ...passage, puzzle: { ...passage.puzzle!, answers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } })}
                  />
                )}
              </Field>
              <Field id={`${pid}-pz-hint`} label="Hint">
                {(id) => <input id={id} className="input" value={passage.puzzle!.hint ?? ''} onChange={(e) => onChange({ ...passage, puzzle: { ...passage.puzzle!, hint: e.target.value || undefined } })} />}
              </Field>
              <Field id={`${pid}-pz-success`} label="Shown when solved">
                {(id) => <input id={id} className="input" value={passage.puzzle!.successText} onChange={(e) => onChange({ ...passage, puzzle: { ...passage.puzzle!, successText: e.target.value } })} />}
              </Field>
              <button type="button" className="btn small" onClick={() => onChange({ ...passage, puzzle: undefined })}>
                Remove puzzle
              </button>
            </fieldset>
          ) : (
            <button
              type="button"
              className="btn"
              onClick={() =>
                onChange({
                  ...passage,
                  puzzle: { id: uniqueId(`${passage.id}-puzzle`, story.passages.flatMap((p) => (p.puzzle ? [p.puzzle.id] : []))), prompt: 'Type the missing word.', answers: ['answer'], successText: 'You got it!' },
                })
              }
            >
              Add a puzzle
            </button>
          )}
        </>
      )}
      {story.start !== passage.id && (
        <button type="button" className="btn danger" onClick={onDelete}>
          Delete this page
        </button>
      )}
    </div>
  );
}

export default function StoryEditor({ storyId }: { storyId: string }) {
  const { repo, profiles, go } = useApp();
  const parentName = profiles.find((p) => p.kind === 'parent')?.name ?? 'Parent';
  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [saved, setSaved] = useState<Story | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [tab, setTab] = useState<Tab>('details');
  const [pageId, setPageId] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [message, setMessage] = useState('');
  const [ack, setAck] = useState(false);
  const [missing, setMissing] = useState(false);

  const load = useCallback(async () => {
    const e = (await repo.library()).find((x) => x.storyId === storyId);
    const s = await repo.draft(storyId);
    if (!e || !s) return setMissing(true);
    setEntry(e);
    setSaved(s);
    setStory(s);
    setPageId((current) => current || s.start);
  }, [repo, storyId]);
  useEffect(() => void load(), [load]);

  const deferred = useDeferredValue(story);
  const validation = useMemo(() => (deferred ? validateDraft(deferred) : null), [deferred]);

  if (missing)
    return (
      <Page title="Story not found">
        <button type="button" className="btn" onClick={() => go('#/parent')}>
          Back to the grown-up area
        </button>
      </Page>
    );
  if (!story || !saved || !entry) return <p role="status">Loading…</p>;

  const dirty = contentHash(story) !== contentHash(saved);
  const approvedVersion = entry.approved?.version ?? 0;
  const savedIsApproved = entry.approved?.hash === contentHash(saved) && !entry.draftHash;
  const review = story.literacy.review;
  const humanLiteracyPassed = review.status === 'passed' && review.reviewerKind === 'human';
  const edit = (next: Story) => {
    setStory(next);
    setMessage('');
  };

  const save = async () => {
    try {
      // Changing an approved story needs a new version number, so the approved one is kept.
      const next = contentHash(story) !== entry.approved?.hash && story.version <= approvedVersion ? { ...story, version: approvedVersion + 1 } : story;
      const updated = await repo.saveDraft(next, parentName, 'editor');
      setEntry(updated);
      setSaved(next);
      setStory(next);
      setMessage(`Draft saved as version ${next.version}.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    }
  };

  const approve = async () => {
    try {
      const updated = await repo.approve(storyId, {
        by: parentName,
        at: new Date().toISOString(),
        literacyReviewStatus: humanLiteracyPassed ? 'passed (human)' : review.status,
        acknowledgedPendingLiteracyReview: !humanLiteracyPassed,
      });
      setEntry(updated);
      setAck(false);
      setMessage(`Version ${saved.version} is now in the reader’s library.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    }
  };

  const passage = story.passages.find((p) => p.id === pageId) ?? story.passages[0]!;
  const setPassage = (p: Passage) => edit({ ...story, passages: story.passages.map((x) => (x.id === passage.id ? p : x)) });
  const addPage = () => {
    const id = uniqueId('page', story.passages.map((p) => p.id));
    edit({ ...story, passages: [...story.passages, { id, title: 'New page', paragraphs: ['Write this page.'], choices: [] }] });
    setPageId(id);
  };
  const deletePage = () => {
    edit({ ...story, passages: story.passages.filter((p) => p.id !== passage.id) });
    setPageId(story.start);
  };

  const openTab = (t: Tab) => {
    if (t === 'json') {
      setJsonText(JSON.stringify(story, null, 2));
      setJsonError('');
    }
    setTab(t);
  };
  const glossary = story.glossary ?? {};
  const setGlossary = (g: Story['glossary']) => edit({ ...story, glossary: g && Object.keys(g).length ? g : undefined });
  const errors = validation ? [...validation.schema.errors, ...(validation.graph?.errors ?? []).map((e) => e.message), ...(validation.literacy?.automatedChecks ?? []).filter((c) => !c.ok).map((c) => `${c.id}: ${c.detail}`)] : [];
  const warnings = validation ? [...(validation.graph?.warnings ?? []).map((w) => w.message), ...(validation.literacy?.learningDesign.advisories ?? []).filter((a) => !a.ok).map((a) => a.detail)] : [];

  return (
    <Page
      title={`Edit: ${story.title}`}
      className="studio"
      nav={
        <nav className="reader-bar" aria-label="Editor controls">
          <button type="button" className="btn small" onClick={() => go('#/parent')}>
            ← Grown-up area
          </button>
        </nav>
      }
    >
      <p className="muted">
        Version {story.version}. {entry.approved ? `Version ${approvedVersion} is in the reader’s library.` : 'Not in the reader’s library yet.'} {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
      </p>
      <div role="tablist" aria-label="Editor sections" className="row tabs">
        {TABS.map(([t, label]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={`btn small${tab === t ? ' primary' : ''}`} onClick={() => openTab(t)}>
            {label}
          </button>
        ))}
      </div>

      <section role="tabpanel" aria-label={TABS.find(([t]) => t === tab)![1]}>
        {tab === 'details' && (
          <div className="form">
            <Field id="ed-title" label="Title">
              {(id) => <input id={id} className="input" value={story.title} onChange={(e) => edit({ ...story, title: e.target.value })} />}
            </Field>
            <Field id="ed-version" label="Version">
              {(id) => <input id={id} className="input" type="number" min={1} value={story.version} onChange={(e) => edit({ ...story, version: Math.max(1, Math.floor(Number(e.target.value) || 1)) })} />}
            </Field>
            <Field id="ed-genre" label="Genre">
              {(id) => <input id={id} className="input" value={story.metadata.genre} onChange={(e) => edit({ ...story, metadata: { ...story.metadata, genre: e.target.value } })} />}
            </Field>
            <Field id="ed-theme" label="Theme">
              {(id) => <input id={id} className="input" value={story.metadata.theme} onChange={(e) => edit({ ...story, metadata: { ...story.metadata, theme: e.target.value } })} />}
            </Field>
            <Field id="ed-premise" label="Premise">
              {(id) => <textarea id={id} className="input" rows={3} value={story.metadata.premise} onChange={(e) => edit({ ...story, metadata: { ...story.metadata, premise: e.target.value } })} />}
            </Field>
            <Field id="ed-minutes" label="Estimated minutes">
              {(id) => (
                <input
                  id={id}
                  className="input"
                  type="number"
                  min={1}
                  value={story.metadata.estimatedMinutes}
                  onChange={(e) => edit({ ...story, metadata: { ...story.metadata, estimatedMinutes: Math.max(1, Math.floor(Number(e.target.value) || 1)) } })}
                />
              )}
            </Field>
            <p className="muted">
              Literacy review: {review.status}
              {review.reviewerKind ? ` (${review.reviewerKind === 'human' ? 'by a person' : 'AI pre-review only'})` : ''}.
            </p>
          </div>
        )}

        {tab === 'pages' && (
          <>
            <div className="row">
              <label htmlFor="ed-page">Page</label>
              <select id="ed-page" className="input" value={passage.id} onChange={(e) => setPageId(e.target.value)}>
                {story.passages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title ?? p.id}
                    {p.ending ? ' (ending)' : ''}
                  </option>
                ))}
              </select>
              <button type="button" className="btn" onClick={addPage}>
                Add a page
              </button>
            </div>
            <PassageEditor key={passage.id} story={story} passage={passage} onChange={setPassage} onDelete={deletePage} />
          </>
        )}

        {tab === 'things' && (
          <>
            <CollectibleList title="Items" kind="item" list={story.items} onChange={(items) => edit({ ...story, items })} />
            <CollectibleList title="Clues" kind="clue" list={story.clues} onChange={(clues) => edit({ ...story, clues })} />
          </>
        )}

        {tab === 'words' && (
          <section>
            <p className="muted">Words listed here can be tapped while reading to show their syllables and meaning.</p>
            {Object.entries(glossary).map(([word, g]) => (
              <fieldset key={word} className="form">
                <legend>{word}</legend>
                <Field id={`gl-${word}-syl`} label="Syllables (separate with a hyphen)">
                  {(id) => (
                    <input
                      id={id}
                      className="input"
                      value={g.syllables.join('-')}
                      onChange={(e) => setGlossary({ ...glossary, [word]: { ...g, syllables: e.target.value.split('-').map((s) => s.trim()).filter(Boolean) } })}
                    />
                  )}
                </Field>
                <Field id={`gl-${word}-def`} label="Meaning">
                  {(id) => <input id={id} className="input" maxLength={200} value={g.definition ?? ''} onChange={(e) => setGlossary({ ...glossary, [word]: { ...g, definition: e.target.value || undefined } })} />}
                </Field>
                <button
                  type="button"
                  className="btn small"
                  onClick={() => {
                    const next = { ...glossary };
                    delete next[word];
                    setGlossary(next);
                  }}
                >
                  Remove {word}
                </button>
              </fieldset>
            ))}
            <form
              className="row"
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem('new-word') as HTMLInputElement | null) ?? null;
                const word = input?.value.trim().toLowerCase() ?? '';
                if (!/^[a-z]+$/.test(word) || glossary[word]) return;
                setGlossary({ ...glossary, [word]: { syllables: [word] } });
                if (input) input.value = '';
              }}
            >
              <label htmlFor="new-word">Add a word</label>
              <input id="new-word" name="new-word" className="input" autoComplete="off" />
              <button type="submit" className="btn">
                Add
              </button>
            </form>
          </section>
        )}

        {tab === 'json' && (
          <div className="form">
            <label htmlFor="ed-json">Whole story as JSON (for needs, effects and anything else)</label>
            <textarea id="ed-json" className="input mono" rows={20} spellCheck={false} value={jsonText} onChange={(e) => setJsonText(e.target.value)} />
            <button
              type="button"
              className="btn"
              onClick={() => {
                try {
                  const parsed = JSON.parse(jsonText) as Story;
                  if (parsed.id !== storyId) throw new Error(`The story id must stay "${storyId}"`);
                  edit(parsed);
                  setJsonError('Applied.');
                } catch (e) {
                  setJsonError(e instanceof Error ? e.message : String(e));
                }
              }}
            >
              Apply JSON
            </button>
            <p role="status">{jsonError}</p>
          </div>
        )}
      </section>

      <section aria-labelledby="checks-title" className="checks">
        <h2 id="checks-title">Checks</h2>
        {validation === null ? (
          <p role="status">Checking…</p>
        ) : validation.ok ? (
          <p className="status good">All automated checks pass.</p>
        ) : (
          <>
            <p className="status bad">{errors.length} problem(s) to fix before approval:</p>
            <ul>
              {errors.slice(0, 20).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </>
        )}
        {warnings.length > 0 && (
          <details>
            <summary>{warnings.length} suggestion(s)</summary>
            <ul>
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <div className="row">
        <button type="button" className="btn primary" disabled={!dirty} onClick={() => void save()}>
          Save draft
        </button>
        <button type="button" className="btn" disabled={dirty} onClick={() => go(`#/preview/device/${encodeURIComponent(storyId)}`)}>
          Preview saved draft
        </button>
        <button type="button" className="btn" onClick={() => downloadJson(`${storyId}.v${story.version}.json`, exportStory(story, entry.approved))}>
          Export
        </button>
      </div>

      <h2>Approve for the reader’s library</h2>
      {savedIsApproved ? (
        <p>This version is already in the reader’s library.</p>
      ) : (
        <div className="form">
          {!humanLiteracyPassed && (
            <label className="check">
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
              I understand no reading specialist has reviewed this story, and I have read it myself.
            </label>
          )}
          <button type="button" className="btn primary" disabled={dirty || !validation?.ok || (!humanLiteracyPassed && !ack)} onClick={() => void approve()}>
            Approve version {saved.version}
          </button>
          <p className="muted">{dirty ? 'Save your changes first.' : !validation?.ok ? 'Fix the problems above first.' : ''}</p>
        </div>
      )}
      <p role="status">{message}</p>
    </Page>
  );
}
