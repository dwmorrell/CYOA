import { describe, expect, it } from 'vitest';
import {
  accuracy,
  addScore,
  MAX_SCORES,
  scoreFor,
  carProgress,
  correctLength,
  formatLapTime,
  grossWpm,
  lapSeconds,
  lapTimeSeconds,
  netWpm,
  parseWordList,
  startLap,
  typeInto,
  type Lap,
} from '../../src/typing/engine';
import { startLine, TRACKS, trackPointAt } from '../../src/typing/tracks';

const WORDS = ['cat', 'dog'];
const TARGET = 'cat dog';

/** Types a series of input values, one per second, starting at 1000 ms. */
function typeSteps(lap: Lap, values: string[]): Lap {
  return values.reduce((current, value, i) => typeInto(current, value, (i + 1) * 1000), lap);
}

describe('parseWordList', () => {
  it('splits on spaces, commas, semicolons and new lines, lower-cases, and drops duplicates', () => {
    expect(parseWordList('Pebble, sea;boat\nSEA  cove')).toEqual({ words: ['pebble', 'sea', 'boat', 'cove'], skipped: [] });
  });

  it('keeps apostrophes and hyphens, and reports anything else', () => {
    expect(parseWordList("don't well-known 3d hi!")).toEqual({ words: ["don't", 'well-known'], skipped: ['3d', 'hi!'] });
  });

  it('holds at most forty words and reports the rest', () => {
    const text = Array.from({ length: 42 }, (_, i) => `w${String.fromCharCode(97 + (i % 26))}${'x'.repeat(Math.floor(i / 26))}`).join(' ');
    const { words, skipped } = parseWordList(text);
    expect(words).toHaveLength(40);
    expect(skipped).toHaveLength(2);
  });
});

describe('typing a lap', () => {
  it('starts with the target text from the list, joined by single spaces', () => {
    expect(startLap(WORDS).target).toBe(TARGET);
  });

  it('counts each added character as a keystroke and each wrong one as an error', () => {
    const lap = typeInto(startLap(WORDS), 'cax', 1000);
    expect(lap.keystrokes).toBe(3);
    expect(lap.errors).toBe(1);
    expect(lap.typed).toBe('cax');
  });

  it('does not count backspace as a keystroke, but keeps the errors already made', () => {
    let lap = typeInto(startLap(WORDS), 'cax', 1000);
    lap = typeInto(lap, 'ca', 2000);
    expect(lap.keystrokes).toBe(3);
    expect(lap.errors).toBe(1);
    expect(accuracy(lap)).toBeCloseTo(2 / 3);
  });

  it('finishes when the typed text matches the target, and ignores input after that', () => {
    let lap = typeInto(startLap(WORDS), 'cat dog', 4000);
    expect(lap.finishedAt).toBe(4000);
    lap = typeInto(lap, 'cat dogs', 5000);
    expect(lap.keystrokes).toBe(7);
    expect(lap.finishedAt).toBe(4000);
  });

  it('counts input past the end of the target as an error and does not keep it', () => {
    const lap = typeInto(typeInto(startLap(WORDS), 'cat dxg', 1000), 'cat dxgx', 2000);
    expect(lap.typed).toBe('cat dxg');
    expect(lap.keystrokes).toBe(8);
    expect(lap.errors).toBe(2);
    expect(lap.finishedAt).toBeUndefined();
  });

  it('ignores all input once the lap is finished', () => {
    const lap = typeInto(startLap(WORDS), 'cat dog', 4000);
    expect(typeInto(lap, 'cat dogs', 5000)).toBe(lap);
  });

  it('starts the clock at the first character, not when the lap was made', () => {
    const lap = typeInto(startLap(WORDS), '', 500);
    expect(lap.startedAt).toBeUndefined();
    expect(typeInto(lap, 'c', 9000).startedAt).toBe(9000);
  });
});

describe('speed and accuracy', () => {
  it('gross words a minute is keystrokes over five, per minute up to the latest key', () => {
    // Ten characters, one a second from 1 s to 10 s: nine seconds from the first key to the last.
    const word = 'abcdefghij';
    const values = Array.from({ length: 10 }, (_, i) => word.slice(0, i + 1));
    const lap = typeSteps(startLap([word]), values);
    expect(lap.keystrokes).toBe(10);
    expect(grossWpm(lap)).toBeCloseTo(10 / 5 / (9 / 60));
  });

  it('a mistake lowers net speed: speed is gross words a minute times accuracy', () => {
    const clean = typeInto(typeInto(startLap(WORDS), 'cat', 0), 'cat dog', 60_000);
    const messy = typeInto(typeInto(startLap(WORDS), 'cxt', 0), 'cat dog', 60_000);
    expect(netWpm(messy)).toBeLessThan(netWpm(clean));
    expect(netWpm(clean)).toBeCloseTo(grossWpm(clean));
    expect(netWpm(messy)).toBeCloseTo(grossWpm(messy) * accuracy(messy));
  });

  it('is zero before any key, and never divides by a zero span', () => {
    expect(grossWpm(startLap(WORDS))).toBe(0);
    expect(netWpm(startLap(WORDS))).toBe(0);
    expect(Number.isFinite(grossWpm(typeInto(startLap(WORDS), 'c', 1000)))).toBe(true);
  });
});

describe('lap time', () => {
  it('a faster speed gives a shorter lap, for the same words', () => {
    const slow = lapSeconds(TARGET, 10)!;
    const fast = lapSeconds(TARGET, 20)!;
    const faster = lapSeconds(TARGET, 40)!;
    expect(fast).toBeLessThan(slow);
    expect(faster).toBeLessThan(fast);
    expect(lapSeconds(TARGET, 0)).toBeUndefined();
  });

  it('the measured lap time is the time from the first key to the finish', () => {
    const lap = typeInto(typeInto(startLap(WORDS), 'cat', 2000), 'cat dog', 9000);
    expect(lapTimeSeconds(lap)).toBe(7);
    expect(lapTimeSeconds(typeInto(startLap(WORDS), 'cat', 2000))).toBeUndefined();
  });

  it('a faster typist finishes the same lap in less time', () => {
    const quick = typeInto(typeInto(startLap(WORDS), 'cat', 0), 'cat dog', 4000);
    const slow = typeInto(typeInto(startLap(WORDS), 'cat', 0), 'cat dog', 12_000);
    expect(lapTimeSeconds(quick)!).toBeLessThan(lapTimeSeconds(slow)!);
  });

  it('formats seconds as minutes and seconds', () => {
    expect(formatLapTime(42.4)).toBe('0:42');
    expect(formatLapTime(65)).toBe('1:05');
  });
});

describe('the car on the track', () => {
  it('moves with correctly typed letters, and a wrong letter holds it back', () => {
    const start = startLap(WORDS);
    expect(carProgress(start)).toBe(0);
    expect(carProgress(typeInto(start, 'cat', 0))).toBeCloseTo(3 / 7);
    expect(carProgress(typeInto(start, 'cxt', 0))).toBeCloseTo(1 / 7);
    expect(correctLength(typeInto(start, 'cxt', 0))).toBe(1);
  });

  it('is at the finish line when the lap is done', () => {
    expect(carProgress(typeInto(startLap(WORDS), TARGET, 0))).toBe(1);
  });

});

describe('race tracks', () => {
  const oval = TRACKS.find((t) => t.id === 'harbour-oval')!;

  it('every track has its own id, so each keeps its own high scores', () => {
    const ids = TRACKS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(TRACKS.length).toBeGreaterThan(1);
  });

  it('the car starts on the line at the top and runs clockwise on screen', () => {
    const top = trackPointAt(oval, 0);
    expect(top.x).toBeCloseTo(120);
    expect(top.y).toBeCloseTo(20);
    const right = trackPointAt(oval, 0.25);
    expect(right.x).toBeCloseTo(220);
    expect(right.y).toBeCloseTo(80);
  });

  it('a finished lap leaves the car back on the start line', () => {
    const finish = trackPointAt(oval, carProgress(typeInto(startLap(WORDS), TARGET, 0)));
    expect(finish.x).toBeCloseTo(trackPointAt(oval, 0).x);
    expect(finish.y).toBeCloseTo(trackPointAt(oval, 0).y);
  });

  it('the start and finish line crosses the course at its first point', () => {
    const [a, b] = startLine(oval);
    expect((a.x + b.x) / 2).toBeCloseTo(oval.points[0]!.x);
    expect((a.y + b.y) / 2).toBeCloseTo(oval.points[0]!.y);
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(18);
  });
});

describe('high scores per track', () => {
  const entry = (wpm: number, lapSeconds: number, name = 'Ada') => ({ name, wpm, accuracy: 1, lapSeconds, at: `t${wpm}-${lapSeconds}` });

  it('only a finished lap makes a score, with the reader, speed, accuracy and lap time', () => {
    expect(scoreFor(typeInto(startLap(WORDS), 'cat', 0), 'Ada', 'now')).toBeUndefined();
    const lap = typeInto(typeInto(startLap(WORDS), 'cat', 0), 'cat dog', 6000);
    expect(scoreFor(lap, 'Ada', 'now')).toEqual({ name: 'Ada', wpm: netWpm(lap), accuracy: 1, lapSeconds: 6, at: 'now' });
  });

  it('ranks faster net speed higher, and breaks a tie with the quicker lap', () => {
    const list = addScore(addScore([], entry(20, 30)), entry(30, 40));
    expect(list.map((s) => s.wpm)).toEqual([30, 20]);
    const tied = addScore([entry(20, 30)], entry(20, 25, 'Sam'));
    expect(tied.map((s) => s.name)).toEqual(['Sam', 'Ada']);
  });

  it('keeps only the top places', () => {
    let list: ReturnType<typeof entry>[] = [];
    for (let i = 1; i <= MAX_SCORES + 3; i++) list = addScore(list, entry(i, 10));
    expect(list).toHaveLength(MAX_SCORES);
    expect(list[0]!.wpm).toBe(MAX_SCORES + 3);
    expect(list.at(-1)!.wpm).toBe(4);
  });
});
