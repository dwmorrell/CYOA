import type { LearningTarget } from '../../engine/types';
import type { ShelfSummary } from '../../literacy/shelf-summary';

const SKILL_LABELS: Record<LearningTarget, string> = {
  comprehension: 'Comprehension',
  inference: 'Inference',
  sequencing: 'Sequencing',
  vocabulary: 'Vocabulary from context',
  detail: 'Attention to detail',
  engagement: 'Reading stamina',
};

/** The literacy reviewer's at-a-glance note on a shelf story, for a parent or tutor. */
export function LiteracySummary({ summary }: { summary?: ShelfSummary }) {
  if (!summary) return <p className="muted">The literacy summary for this story has not been written yet.</p>;
  return (
    <div className="literacy-summary">
      <p>{summary.blurb}</p>
      <dl>
        <dt>Reading skills</dt>
        <dd>{summary.skills.map((s) => SKILL_LABELS[s] ?? s).join(', ')}</dd>
        <dt>Word types</dt>
        <dd>
          <ul>
            {summary.wordTypes.map((wt) => (
              <li key={wt.concept}>
                {wt.label ?? wt.concept}: {wt.examples.join(', ')}
              </li>
            ))}
          </ul>
        </dd>
        <dt>OG areas</dt>
        <dd>{summary.ogCategories.join(', ')}</dd>
      </dl>
      <p className="muted">Written by the AI literacy specialist. Word types are matched by spelling, so a tutor should confirm they fit the reader’s stage.</p>
    </div>
  );
}

export interface FocusOption {
  value: string;
  label: string;
}

/** Word types and OG areas found in the summaries, for the shelf filter. */
export function focusOptions(summaries: (ShelfSummary | undefined)[]): FocusOption[] {
  const words = new Map<string, string>();
  const areas = new Set<string>();
  for (const s of summaries) {
    if (!s) continue;
    for (const wt of s.wordTypes) words.set(wt.concept, wt.label ?? wt.concept);
    for (const c of s.ogCategories) areas.add(c);
  }
  return [
    ...[...words].sort((a, b) => a[1].localeCompare(b[1])).map(([concept, label]) => ({ value: `word:${concept}`, label: `Word type: ${label}` })),
    ...[...areas].sort().map((c) => ({ value: `og:${c}`, label: `OG area: ${c}` })),
  ];
}

/** True when the story's summary covers the chosen word type or OG area. An empty focus matches every story. */
export function matchesFocus(summary: ShelfSummary | undefined, focus: string): boolean {
  if (!focus) return true;
  if (!summary) return false;
  const [kind, value] = [focus.slice(0, focus.indexOf(':')), focus.slice(focus.indexOf(':') + 1)];
  if (kind === 'word') return summary.wordTypes.some((wt) => wt.concept === value);
  if (kind === 'og') return (summary.ogCategories as string[]).includes(value);
  return true;
}
