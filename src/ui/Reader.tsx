import { useEffect, useRef, useState } from 'react';
import { choicesFor, choose, passageById, restart } from '../engine/story-engine';
import type { GameState, Story } from '../engine/types';
import { Icon } from './common';
import { useApp } from './context';
import { canSpeak, pageSpeech, speak, stopSpeaking } from './speech';

const ENDING_WORDS: Record<string, string> = { triumph: 'A bright ending', bittersweet: 'A quiet ending', setback: 'Not the end yet' };

export interface ReaderProps {
  story: Story;
  state: GameState;
  onState: (state: GameState, extra?: { wordLookedUp?: string }) => void | Promise<void>;
  onExit: () => void;
  exitLabel?: string;
  banner?: string;
}

/** Glossary words become buttons that reveal syllables and a short meaning (optional word help). */
function Paragraph({ text, story, wordHelp, focused, onFocus, onLookUp }: { text: string; story: Story; wordHelp: boolean; focused: boolean; onFocus: () => void; onLookUp: (w: string) => void }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const glossary = story.glossary ?? {};
  const parts = text.split(/(\b[A-Za-z]+\b)/);
  return (
    <p className={`para${focused ? ' focused' : ''}`} aria-current={focused ? 'true' : undefined} onClick={onFocus}>
      {parts.map((part, i) => {
        const entry = wordHelp ? glossary[part.toLowerCase()] : undefined;
        if (!entry) return part;
        const isOpen = open.has(i);
        return (
          <span key={i} className="word-wrap">
            <button
              type="button"
              className="word"
              aria-expanded={isOpen}
              onClick={(e) => {
                e.stopPropagation();
                const next = new Set(open);
                if (isOpen) next.delete(i);
                else {
                  next.add(i);
                  onLookUp(part.toLowerCase());
                }
                setOpen(next);
              }}
            >
              {part}
            </button>
            {isOpen && (
              <span className="syllables">
                {entry.syllables.join(' · ')}
                {entry.definition && <span className="definition">: {entry.definition}</span>}
                {entry.hint && <span className="hint"> ({entry.hint})</span>}
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
}

export function Reader({ story, state, onState, onExit, exitLabel = 'Library', banner }: ReaderProps) {
  const { prefs } = useApp();
  const passage = passageById(story, state.current);
  const [focusIndex, setFocusIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const paraRefs = useRef<(HTMLDivElement | null)[]>([]);

  // A new page: stop speech, reset paragraph focus, move focus to the heading.
  const pageKey = `${state.current}:${state.history.length}`;
  useEffect(() => {
    stopSpeaking();
    setSpeaking(false);
    setFocusIndex(0);
    heading.current?.focus();
  }, [pageKey]);
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    if (prefs.lineFocus) paraRefs.current[focusIndex]?.scrollIntoView?.({ block: 'nearest' });
  }, [focusIndex, prefs.lineFocus]);

  const ending = passage.ending;
  const totalEndings = story.passages.filter((p) => p.ending).length;
  const nameOf = (list: Story['items'], id: string) => list.find((x) => x.id === id);
  const go = (s: GameState) => void onState(s);
  const toggleSpeech = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speak(pageSpeech(passage.title, passage.paragraphs), () => setSpeaking(false), { voiceURI: prefs.voiceURI, rate: prefs.readRate });
    }
  };
  // "Story so far" supports sequencing: the places visited, in order.
  const journey = state.history
    .filter((id, i, a) => a[i - 1] !== id)
    .map((id) => story.passages.find((p) => p.id === id)?.title ?? id);

  return (
    <main id="main" className="reader" tabIndex={-1}>
      {banner && (
        <p className="banner" role="note">
          {banner}
        </p>
      )}
      <nav className="reader-bar" aria-label="Story controls">
        <button type="button" className="btn small" onClick={onExit}>
          <Icon>← </Icon>
          {exitLabel}
        </button>
        <span className="story-name">{story.title}</span>
        {prefs.readAloud && canSpeak() && (
          <button type="button" className="btn small" aria-pressed={speaking} onClick={toggleSpeech}>
            <Icon>🔊 </Icon>Read to me
          </button>
        )}
      </nav>
      <article className="page" aria-labelledby="passage-title">
        <h1 id="passage-title" ref={heading} tabIndex={-1}>
          {ending ? ending.title : (passage.title ?? story.title)}
        </h1>
        {passage.paragraphs.map((text, i) => (
          <div key={`${state.current}-${i}`} ref={(el) => void (paraRefs.current[i] = el)}>
            <Paragraph
              text={text}
              story={story}
              wordHelp={prefs.wordHelp}
              focused={prefs.lineFocus && i === focusIndex}
              onFocus={() => setFocusIndex(i)}
              onLookUp={(w) => void onState(state, { wordLookedUp: w })}
            />
          </div>
        ))}
        {prefs.lineFocus && passage.paragraphs.length > 1 && (
          <div className="focus-nav">
            <button type="button" className="btn small" onClick={() => setFocusIndex(Math.max(0, focusIndex - 1))}>
              <Icon>↑ </Icon>Back
            </button>
            <span className="muted" role="status">
              Paragraph {focusIndex + 1} of {passage.paragraphs.length}
            </span>
            <button type="button" className="btn small" onClick={() => setFocusIndex(Math.min(passage.paragraphs.length - 1, focusIndex + 1))}>
              <Icon>↓ </Icon>Next
            </button>
          </div>
        )}
      </article>
      {ending ? (
        <section className="ending" aria-label="Ending">
          <p className={`ending-kind ${ending.kind}`}>{ENDING_WORDS[ending.kind] ?? 'The end'}</p>
          <p>
            You have found {state.endingsSeen.length} of {totalEndings} endings.
          </p>
          <button type="button" className="btn primary" onClick={() => go(restart(story, state))}>
            Play again
          </button>
        </section>
      ) : (
        <section className="choices" aria-labelledby="choices-title">
          <h2 id="choices-title" className="visually-hidden">
            What will you do?
          </h2>
          <ul>
            {choicesFor(story, state).map(({ choice, available }) => (
              <li key={choice.id}>
                <button
                  type="button"
                  className={`btn choice${available ? '' : ' locked'}`}
                  aria-disabled={available ? undefined : true}
                  aria-describedby={available ? undefined : `hint-${choice.id}`}
                  onClick={() => available && go(choose(story, state, choice.id))}
                >
                  {choice.label}
                </button>
                {!available && (
                  <p className="locked-hint" id={`hint-${choice.id}`}>
                    {choice.lockedHint ?? 'You need something else first.'}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {!ending && (
        <aside className="packs" aria-label="Your things">
          <details className="pack">
            <summary>Backpack ({state.items.length})</summary>
            {state.items.length ? (
              <ul>
                {state.items.map((id) => (
                  <li key={id}>
                    <strong>{nameOf(story.items, id)?.name ?? id}</strong> {nameOf(story.items, id)?.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nothing yet.</p>
            )}
          </details>
          <details className="pack">
            <summary>Clue notebook ({state.clues.length})</summary>
            {state.clues.length ? (
              <ul>
                {state.clues.map((id) => (
                  <li key={id}>
                    <strong>{nameOf(story.clues, id)?.name ?? id}</strong> {nameOf(story.clues, id)?.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No clues yet.</p>
            )}
          </details>
          <details className="pack">
            <summary>Story so far</summary>
            <ol>
              {journey.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ol>
          </details>
        </aside>
      )}
    </main>
  );
}
