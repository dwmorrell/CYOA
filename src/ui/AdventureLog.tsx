import { useEffect, useState } from 'react';
import type { Progress } from '../storage/repo';
import { BackBar, Page } from './common';
import { useApp } from './context';

// Progression framed as an adventurer's record, not as scores or levels of
// reading ability (master spec section 4: support without feeling remedial).
const BADGES: { id: string; name: string; earned: (p: Progress) => boolean; how: string }[] = [
  { id: 'first-ending', name: 'First Ending', earned: (p) => Object.values(p.endings).some((e) => e.length > 0), how: 'Reach any ending' },
  { id: 'explorer', name: 'Path Explorer', earned: (p) => Object.values(p.endings).some((e) => e.length >= 2), how: 'Find two endings in one adventure' },
  { id: 'sharp-eyes', name: 'Sharp Eyes', earned: (p) => p.clues.length >= 3, how: 'Find three clues' },
  { id: 'codebreaker', name: 'Codebreaker', earned: (p) => p.puzzles.length >= 1, how: 'Solve a typed puzzle' },
  { id: 'word-collector', name: 'Word Collector', earned: (p) => p.words.length >= 5, how: 'Look up five words' },
  { id: 'page-turner', name: 'Page Turner', earned: (p) => p.pagesRead >= 50, how: 'Read fifty pages' },
];

export function AdventureLog() {
  const { repo, child } = useApp();
  const [p, setP] = useState<Progress | null>(null);
  useEffect(() => {
    void repo.progress(child.id).then(setP);
  }, [repo, child]);
  return (
    <Page title={`${child.name}’s adventure log`} nav={<BackBar />}>
      {!p ? (
        <p role="status">Loading…</p>
      ) : (
        <>
          <ul className="stats">
            <li>Pages read: {p.pagesRead}</li>
            <li>Endings found: {Object.values(p.endings).reduce((n, e) => n + e.length, 0)}</li>
            <li>Clues found: {p.clues.length}</li>
            <li>Puzzles solved: {p.puzzles.length}</li>
            <li>Words looked up: {p.words.length}</li>
          </ul>
          <h2>Badges</h2>
          <ul className="cards badges">
            {BADGES.map((b) => {
              const got = b.earned(p);
              return (
                <li key={b.id} className={`card badge${got ? ' earned' : ''}`}>
                  <strong>{b.name}</strong> <span className="muted">{got ? 'Earned' : b.how}</span>
                </li>
              );
            })}
          </ul>
          {p.words.length > 0 && (
            <>
              <h2>Words collected</h2>
              <p>{p.words.join(', ')}</p>
            </>
          )}
        </>
      )}
    </Page>
  );
}
