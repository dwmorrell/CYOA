// Core story data model. The JSON Schema in schemas/story.schema.json is the
// contract; these types mirror it and must be kept in sync (tests enforce that
// the sample story satisfies both).

export type ReviewStatus = 'pending' | 'passed' | 'changes-requested';

export interface Condition {
  items?: string[];
  clues?: string[];
  flags?: string[];
  notFlags?: string[];
}

export interface Effects {
  addItems?: string[];
  removeItems?: string[];
  addClues?: string[];
  setFlags?: string[];
}

/** Master spec section 3: the comprehension-first learning objectives. */
export type LearningTarget = 'comprehension' | 'inference' | 'sequencing' | 'vocabulary' | 'detail' | 'engagement';
export const LEARNING_TARGETS: LearningTarget[] = ['comprehension', 'inference', 'sequencing', 'vocabulary', 'detail', 'engagement'];

export interface Choice {
  id: string;
  label: string;
  target: string;
  requires?: Condition;
  effects?: Effects;
  /** Shown instead of hiding the choice when requirements are not met. */
  lockedHint?: string;
  learningTargets?: LearningTarget[];
}

export type EndingKind = 'triumph' | 'bittersweet' | 'setback';

export interface Ending {
  id: string;
  kind: EndingKind;
  title: string;
}

export interface Passage {
  id: string;
  title?: string;
  paragraphs: string[];
  effects?: Effects;
  choices: Choice[];
  ending?: Ending;
  learningTargets?: LearningTarget[];
}

export interface Collectible {
  id: string;
  name: string;
  description: string;
}

export interface WordSet {
  id: string;
  label: string;
  /** Program-neutral concept id from src/literacy/taxonomy.ts */
  concept?: string;
  words: string[];
  /** Minimum total occurrences across the story. */
  minOccurrences: number;
}

export interface GlossaryEntry {
  syllables: string[];
  hint?: string;
  /** Plain-language meaning shown by optional word help. */
  definition?: string;
}

export interface LiteracyReviewRecord {
  status: ReviewStatus;
  reviewer?: string;
  reviewerKind?: 'human' | 'ai-agent';
  date?: string;
  notes?: string;
}

export interface Story {
  schemaVersion: '1.0';
  id: string;
  title: string;
  version: number;
  series?: {
    id: string;
    title: string;
    order: number;
    previousStoryId?: string;
  };
  metadata: {
    genre: string;
    theme: string;
    premise: string;
    estimatedMinutes: number;
    authorship: {
      narrative: string;
      origin: 'human' | 'ai-assisted' | 'ai-generated';
    };
    createdAt: string;
  };
  literacy: {
    targetConcepts: string[];
    wordSets: WordSet[];
    review: LiteracyReviewRecord;
  };
  start: string;
  items: Collectible[];
  clues: Collectible[];
  passages: Passage[];
  glossary?: Record<string, GlossaryEntry>;
}

export interface GameState {
  storyId: string;
  storyVersion: number;
  current: string;
  items: string[];
  clues: string[];
  flags: string[];
  history: string[];
  endingsSeen: string[];
  updatedAt: string;
}
