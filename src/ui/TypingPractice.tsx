import { useEffect, useState } from 'react';
import { accuracy, carProgress, correctLength, formatLapTime, lapSeconds, lapTimeSeconds, netWpm, scoreFor, startLap, typeInto, type Lap, type ScoreEntry, type TypingList } from '../typing/engine';
import { startLine, TRACKS, trackPointAt, type Track } from '../typing/tracks';
import { BackBar, Page } from './common';
import { useApp } from './context';

// Typing practice is a separate add-on. Words come from the grown-up's lists,
// there is no countdown, and a lap ends only when the words are typed.
// The gauge, the car and the high scores use words a minute after mistakes.
// Each race track has its own high score list.
const GAUGE_MAX_WPM = 60;

/** Speedometer: a half-circle dial with a needle at the current speed. */
function Gauge({ wpm }: { wpm: number }) {
  const fraction = Math.min(wpm / GAUGE_MAX_WPM, 1);
  const angle = Math.PI * (1 - fraction);
  const needleX = 100 + 70 * Math.cos(angle);
  const needleY = 100 - 70 * Math.sin(angle);
  return (
    <svg className="gauge" viewBox="0 0 200 110" aria-hidden="true" focusable="false">
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="currentColor" strokeWidth="4" />
      <line x1="100" y1="100" x2={needleX} y2={needleY} stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="6" fill="currentColor" />
      <text x="20" y="118" fontSize="12" textAnchor="middle">
        0
      </text>
      <text x="180" y="118" fontSize="12" textAnchor="middle">
        {GAUGE_MAX_WPM}
      </text>
    </svg>
  );
}

/** Race track: the course as a closed loop, with its start and finish line. The car moves round it as correct letters are typed. */
function TrackView({ track, progress }: { track: Track; progress: number }) {
  const [from, to] = startLine(track);
  const car = trackPointAt(track, progress);
  const course = `M ${track.points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')} Z`;
  return (
    <svg className="track" viewBox="0 0 240 160" aria-hidden="true" focusable="false">
      <path d={course} fill="none" stroke="currentColor" strokeWidth="14" strokeOpacity="0.25" />
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="currentColor" strokeWidth="3" />
      <circle cx={car.x} cy={car.y} r="7" fill="currentColor" />
    </svg>
  );
}

/** Words to type: the letters already typed correctly are underlined. */
function Target({ lap }: { lap: Lap }) {
  const done = correctLength(lap);
  return (
    <p className="typing-target" aria-label={`Words to type: ${lap.target}`}>
      <span className="typed">{lap.target.slice(0, done)}</span>
      {lap.target.slice(done)}
    </p>
  );
}

export function TypingPractice() {
  const { repo, child } = useApp();
  const [lists, setLists] = useState<TypingList[] | null>(null);
  const [listId, setListId] = useState('');
  const [trackId, setTrackId] = useState(TRACKS[0]!.id);
  const [lap, setLap] = useState<Lap | null>(null);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [place, setPlace] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    void repo.typingLists().then((all) => {
      if (!live) return;
      setLists(all);
      if (all[0]) {
        setListId(all[0].id);
        setLap(startLap(all[0].words));
      }
    });
    return () => {
      live = false;
    };
  }, [repo]);

  // The high scores shown are those of the race track on screen.
  useEffect(() => {
    let live = true;
    void repo.highScores(trackId).then((all) => {
      if (live) setScores(all);
    });
    return () => {
      live = false;
    };
  }, [repo, trackId]);

  const current = lists?.find((l) => l.id === listId);
  const track = TRACKS.find((t) => t.id === trackId) ?? TRACKS[0]!;
  const chooseList = (id: string) => {
    const next = lists?.find((l) => l.id === id);
    if (!next) return;
    setListId(id);
    setLap(startLap(next.words));
    setLaps([]);
    setPlace(null);
  };
  const chooseTrack = (id: string) => {
    if (!current) return;
    setTrackId(id);
    setLap(startLap(current.words));
    setLaps([]);
    setPlace(null);
  };
  const goAgain = () => {
    if (current) setLap(startLap(current.words));
    setPlace(null);
  };
  const onType = (value: string) => {
    if (!lap || !current) return;
    const next = typeInto(lap, value, Date.now());
    setLap(next);
    if (next.finishedAt !== undefined && lap.finishedAt === undefined) {
      setLaps((all) => [...all, next]);
      const entry = scoreFor(next, child.name, new Date().toISOString());
      if (entry)
        void repo.recordHighScore(track.id, entry).then((all) => {
          setScores(all);
          const index = all.indexOf(entry);
          setPlace(index >= 0 ? index + 1 : null);
        });
    }
  };

  const wpm = lap ? netWpm(lap) : 0;
  const finished = lap?.finishedAt !== undefined;
  const estimate = lap ? lapSeconds(lap.target, wpm) : undefined;

  return (
    <Page title="Typing practice" nav={<BackBar />} className="library typing">
      <p>Type each word as it appears. Your speed and your accuracy move the car round the race track, from the start line back to it. Typing practice is separate from the story, and there is no time limit.</p>
      {lists === null && <p role="status">Loading…</p>}
      {lists?.length === 0 && (
        <div className="empty">
          <h2>No word lists yet</h2>
          <p>A grown-up can add a word list in the grown-up area.</p>
        </div>
      )}
      {lap && current && (
        <>
          <div className="row">
            <label htmlFor="typing-list">Word list</label>
            <select id="typing-list" className="input" value={listId} onChange={(e) => chooseList(e.target.value)}>
              {lists?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.words.length} {l.words.length === 1 ? 'word' : 'words'})
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <label htmlFor="typing-track">Race track</label>
            <select id="typing-track" className="input" value={trackId} onChange={(e) => chooseTrack(e.target.value)}>
              {TRACKS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <section className="typing-car" aria-label="Track and speed">
            <TrackView track={track} progress={carProgress(lap)} />
            <Gauge wpm={wpm} />
            <p className="typing-readout" role="status">
              Speed {Math.round(wpm)} words a minute. Accuracy {Math.round(accuracy(lap) * 100)} percent.{' '}
              {estimate !== undefined ? `Lap time at this speed: about ${formatLapTime(estimate)}.` : 'Start typing to see your speed.'}
            </p>
          </section>

          <Target lap={lap} />
          <label htmlFor="typing-input">Type here</label>
          <input
            id="typing-input"
            className="input typing-input"
            value={lap.typed}
            readOnly={finished}
            onChange={(e) => onType(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />

          {finished && (
            <section className="typing-done" aria-label="Lap result">
              <p role="status">
                Lap {laps.length} done in {formatLapTime(lapTimeSeconds(lap) ?? 0)}. {Math.round(netWpm(lap))} words a minute, {Math.round(accuracy(lap) * 100)} percent accurate.
                {place !== null && ` That is place ${place} on this track’s high scores.`}
              </p>
              <button type="button" className="btn primary" onClick={goAgain}>
                Go again
              </button>
            </section>
          )}

          {laps.length > 0 && (
            <>
              <h2>This visit</h2>
              <ol>
                {laps.map((l, i) => (
                  <li key={i}>
                    Lap {i + 1}: {formatLapTime(lapTimeSeconds(l) ?? 0)}, {Math.round(netWpm(l))} words a minute, {Math.round(accuracy(l) * 100)} percent accurate
                  </li>
                ))}
              </ol>
            </>
          )}

          <section className="typing-scores" aria-labelledby="typing-scores-title">
            <h2 id="typing-scores-title">High scores: {track.name}</h2>
            {scores.length === 0 ? (
              <p className="muted">No laps finished on this track yet.</p>
            ) : (
              <ol>
                {scores.map((sc, i) => (
                  <li key={`${sc.at}-${i}`}>
                    {sc.name}: {Math.round(sc.wpm)} words a minute, {Math.round(sc.accuracy * 100)} percent accurate, lap {formatLapTime(sc.lapSeconds)}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </Page>
  );
}
