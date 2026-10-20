# Literacy model

## Program-flexible terminology

Concepts have neutral ids (`src/literacy/taxonomy.ts`). Families and tutors
use different words for the same idea, so display labels come from
terminology profiles in `config/literacy-profiles.json`. Add a profile for a
child's program without changing code.

| Concept id | Neutral description | Stage |
| --- | --- | --- |
| `closed-syllable` | Closed syllable, short vowel | 1 |
| `digraph-sh`, `digraph-ch`, `digraph-th`, `digraph-wh`, `digraph-ck` | Consonant digraphs | 2 |
| `floss`, `initial-blend`, `glued-ng-nk` | FLOSS rule, initial blends, ng/nk units | 3 |
| `trigraph-tch`, `silent-e` | tch spelling, vowel-consonant-e | 4 |
| `vowel-team`, `r-controlled` | Vowel teams, r-controlled vowels | 5 |
| `suffix-ing`, `suffix-ed` | Common suffixes | 6 |

Stages are a suggested teaching order used for series progression warnings.
Programs differ; a tutor's order wins. **(pending: the family's programme is not named in the master specification; needs tutor input)**

## Word sets and the Word Weave Plan

A word set is a small list of recurring words tied to a concept, with a
minimum number of uses. The story production job writes a Word Weave Plan
(`word-weave-plan.json`) that spreads each set across the outline's beats.
After drafting, `reports/weave-comparison.r<N>.json` compares plan and
actual counts.

## The literacy report

`src/literacy/analyzer.ts` produces a deterministic report per draft:
word-set totals, words missing, number of passages with each set, uses along
the shortest route to every ending, spelling-pattern matches for every
concept, readability (sentence length, long words), and pass/fail checks.

**Verifiable:** the report includes the SHA-256 of the story's canonical JSON.
Anyone can re-run `npm run validate:stories` or the parent studio and get the
same numbers for the same story.

**Limits (stated in every report):** detectors match spelling, not sound;
syllable counts are estimates; nothing here judges decodability or story
quality. That is why the publication policy requires a human literacy review.

## Series progression

`src/production/continuity.ts` compares a sequel's brief with its prequel:
it carries the series id and order, lists items and clues that may return,
lists concepts the prequel taught that the sequel no longer revisits, and
warns when a new target concept is earlier in the teaching order than ones
already taught.
