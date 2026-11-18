// Built-in typing curriculum: always available, independent of anything a
// grown-up has written. Lessons are graduated using the same structured-
// literacy stages as the stories (src/literacy/taxonomy.ts), so practising
// to type reinforces the same phonics patterns a reader is learning. A
// grown-up's own word lists (src/storage/repo.ts) sit alongside these, not
// in place of them.

import type { TypingList } from './engine';

export interface TypingLesson extends TypingList {
  /** Teaching order; lower comes first. Matches the taxonomy concept's stage, or follows it for general practice. */
  stage: number;
  /** The taxonomy concept this lesson practises, if any (src/literacy/taxonomy.ts). General-practice lessons have none. */
  concept?: string;
}

export const LESSONS: TypingLesson[] = [
  { id: 'lesson-closed-syllable', name: 'Short vowels', concept: 'closed-syllable', stage: 1, words: ['cat', 'dog', 'sun', 'map', 'net', 'fog', 'hat', 'pig', 'bus', 'lap', 'ten', 'hot', 'big', 'run'] },
  { id: 'lesson-digraph-sh', name: 'sh words', concept: 'digraph-sh', stage: 2, words: ['shop', 'fish', 'shed', 'wish', 'shut', 'dish', 'ship', 'wash', 'rush', 'hush', 'shark', 'cash', 'brush', 'flash'] },
  { id: 'lesson-digraph-ch', name: 'ch words', concept: 'digraph-ch', stage: 2, words: ['chip', 'chat', 'chin', 'chop', 'lunch', 'rich', 'teach', 'beach', 'much', 'such', 'bench', 'peach'] },
  { id: 'lesson-digraph-th', name: 'th words', concept: 'digraph-th', stage: 2, words: ['this', 'that', 'thin', 'bath', 'with', 'path', 'thud', 'moth', 'cloth', 'think', 'thump', 'teeth', 'both', 'math'] },
  { id: 'lesson-digraph-wh', name: 'wh words', concept: 'digraph-wh', stage: 2, words: ['when', 'what', 'white', 'wheel', 'whale', 'whisk', 'whip', 'which', 'while', 'whistle'] },
  { id: 'lesson-digraph-ck', name: 'ck words', concept: 'digraph-ck', stage: 2, words: ['back', 'pack', 'duck', 'rock', 'sock', 'kick', 'lock', 'neck', 'deck', 'pick', 'tick', 'luck', 'stick', 'clock', 'truck'] },
  { id: 'lesson-floss', name: 'Doubled endings', concept: 'floss', stage: 3, words: ['bell', 'fall', 'mess', 'hill', 'doll', 'pass', 'well', 'tell', 'grass', 'class', 'fizz', 'jazz', 'spill', 'small'] },
  { id: 'lesson-initial-blend', name: 'Starting blends', concept: 'initial-blend', stage: 3, words: ['blue', 'clap', 'flag', 'glad', 'play', 'slip', 'brown', 'crab', 'drop', 'frog', 'green', 'trap', 'skip', 'swim'] },
  { id: 'lesson-glued-ng-nk', name: 'ng and nk words', concept: 'glued-ng-nk', stage: 3, words: ['sing', 'ring', 'long', 'sung', 'rang', 'pink', 'sink', 'bank', 'honk', 'junk', 'hung', 'king', 'wing', 'tank'] },
  { id: 'lesson-trigraph-tch', name: 'tch words', concept: 'trigraph-tch', stage: 4, words: ['catch', 'match', 'patch', 'witch', 'fetch', 'pitch', 'watch', 'stitch', 'batch', 'hutch', 'notch'] },
  { id: 'lesson-silent-e', name: 'Magic e', concept: 'silent-e', stage: 4, words: ['cake', 'bike', 'hope', 'cute', 'mine', 'note', 'lake', 'tape', 'hole', 'cube', 'ride', 'home', 'time', 'nose'] },
  { id: 'lesson-vowel-team', name: 'Vowel teams', concept: 'vowel-team', stage: 5, words: ['rain', 'play', 'tree', 'seat', 'boat', 'toe', 'pie', 'light', 'blue', 'team', 'coat', 'sail', 'green', 'road'] },
  { id: 'lesson-r-controlled', name: 'r-controlled vowels', concept: 'r-controlled', stage: 5, words: ['car', 'her', 'bird', 'for', 'fur', 'star', 'term', 'girl', 'corn', 'turn', 'dark', 'germ', 'stir', 'hard'] },
  { id: 'lesson-suffix-ing', name: '-ing endings', concept: 'suffix-ing', stage: 6, words: ['jumping', 'running', 'singing', 'talking', 'walking', 'reading', 'playing', 'looking', 'helping', 'sitting'] },
  { id: 'lesson-suffix-ed', name: '-ed endings', concept: 'suffix-ed', stage: 6, words: ['jumped', 'walked', 'talked', 'looked', 'helped', 'played', 'wanted', 'landed', 'painted', 'rested'] },
  {
    id: 'lesson-mixed-review',
    name: 'Mixed review',
    stage: 7,
    words: ['adventure', 'mystery', 'discover', 'important', 'favorite', 'beautiful', 'different', 'remember', 'together', 'wonderful'],
  },
];
