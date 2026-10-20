import { useEffect, useState } from 'react';
import { parseWordList, type TypingList } from '../../typing/engine';
import { useApp } from '../context';

interface Draft {
  id: string;
  name: string;
  /** The words as the grown-up typed them; parsed only on save. */
  text: string;
}

// Word lists for the typing practice add-on. A grown-up, or a tutor using this
// device, writes them here. They are kept apart from every story.
export function TypingLists() {
  const { repo } = useApp();
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let live = true;
    void repo.typingLists().then((lists) => {
      if (live) setDrafts(lists.map((l) => ({ id: l.id, name: l.name, text: l.words.join(', ') })));
    });
    return () => {
      live = false;
    };
  }, [repo]);

  const update = (id: string, patch: Partial<Draft>) => setDrafts((all) => all?.map((d) => (d.id === id ? { ...d, ...patch } : d)) ?? null);
  const add = () => setDrafts((all) => [...(all ?? []), { id: `list-${Date.now().toString(36)}`, name: `Word list ${(all?.length ?? 0) + 1}`, text: '' }]);
  const remove = (id: string) => setDrafts((all) => all?.filter((d) => d.id !== id) ?? null);

  const save = async () => {
    if (!drafts) return;
    const skipped: string[] = [];
    const lists: TypingList[] = drafts.map((d) => {
      const parsed = parseWordList(d.text);
      skipped.push(...parsed.skipped);
      return { id: d.id, name: d.name, words: parsed.words };
    });
    try {
      await repo.saveTypingLists(lists);
      setMessage(skipped.length ? `Saved. Left out: ${skipped.join(', ')}. Words may use letters, apostrophes and hyphens, up to 40 a list.` : 'Word lists saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <section aria-labelledby="typing-lists-title">
      <h2 id="typing-lists-title">Typing practice word lists</h2>
      <p className="muted">Typing practice is an optional add-on for when a keyboard is connected. It uses these words, not the story. Separate words with spaces or commas.</p>
      {drafts?.map((d, i) => (
        <fieldset key={d.id} className="form">
          <legend>Word list {i + 1}</legend>
          <label htmlFor={`${d.id}-name`}>Name</label>
          <input id={`${d.id}-name`} className="input" value={d.name} onChange={(e) => update(d.id, { name: e.target.value })} autoComplete="off" />
          <label htmlFor={`${d.id}-words`}>Words</label>
          <textarea id={`${d.id}-words`} className="input" rows={4} value={d.text} onChange={(e) => update(d.id, { text: e.target.value })} autoComplete="off" autoCapitalize="none" spellCheck={false} />
          <button type="button" className="btn small" aria-label={`Remove ${d.name || `word list ${i + 1}`}`} onClick={() => remove(d.id)}>
            Remove this list
          </button>
        </fieldset>
      ))}
      <div className="row">
        <button type="button" className="btn" onClick={add}>
          Add a word list
        </button>
        <button type="button" className="btn primary" onClick={() => void save()}>
          Save word lists
        </button>
      </div>
      <p role="status">{message}</p>
    </section>
  );
}
