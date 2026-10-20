// Race tracks for the typing car. A track is a closed course with one start and
// finish line at its first point. The car starts on that line, and a lap ends
// back on it when the words are typed. Each track has its own high scores.
// Shapes are drawn on a 240 by 160 canvas, clockwise on screen.

export interface Point {
  x: number;
  y: number;
}

export interface Track {
  id: string;
  name: string;
  /** Corners of the closed course. The last point joins back to the first. */
  points: Point[];
}

const SEGMENTS = 72;

/** Points around an ellipse, starting at the top and running clockwise on screen. */
function ellipse(cx: number, cy: number, rx: number, ry: number): Point[] {
  return Array.from({ length: SEGMENTS }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / SEGMENTS;
    return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  });
}

/** A kidney-shaped harbour loop: wider on the lighthouse side, pinched at the bottom. */
function harbourLoop(): Point[] {
  return Array.from({ length: SEGMENTS }, (_, i) => {
    const t = -Math.PI / 2 + (2 * Math.PI * i) / SEGMENTS;
    return { x: 120 + 100 * Math.cos(t) + 16 * Math.cos(2 * t), y: 80 + 58 * Math.sin(t) - 10 * Math.sin(2 * t) };
  });
}

export const TRACKS: Track[] = [
  { id: 'harbour-oval', name: 'Harbour oval', points: ellipse(120, 80, 100, 60) },
  { id: 'harbour-loop', name: 'Harbour loop', points: harbourLoop() },
];

/** Distance round the closed course, in points, from its first point. */
function segmentLengths(points: Point[]): number[] {
  return points.map((p, i) => {
    const q = points[(i + 1) % points.length]!;
    return Math.hypot(q.x - p.x, q.y - p.y);
  });
}

/**
 * Where the car is on the course. Progress 0 and 1 are both the start and finish
 * line, so a finished lap leaves the car on the line.
 */
export function trackPointAt(track: Track, progress: number): Point {
  const lengths = segmentLengths(track.points);
  const total = lengths.reduce((sum, l) => sum + l, 0);
  let distance = (((progress % 1) + 1) % 1) * total;
  for (let i = 0; i < track.points.length; i++) {
    const length = lengths[i]!;
    if (distance <= length || i === track.points.length - 1) {
      const p = track.points[i]!;
      const q = track.points[(i + 1) % track.points.length]!;
      const t = length === 0 ? 0 : Math.min(distance / length, 1);
      return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
    }
    distance -= length;
  }
  return track.points[0]!;
}

/** The start and finish line: a short bar across the course at its first point. */
export function startLine(track: Track): [Point, Point] {
  const [p, q] = [track.points[0]!, track.points[1]!];
  const length = Math.hypot(q.x - p.x, q.y - p.y) || 1;
  const nx = -(q.y - p.y) / length;
  const ny = (q.x - p.x) / length;
  const half = 9;
  return [
    { x: p.x - nx * half, y: p.y - ny * half },
    { x: p.x + nx * half, y: p.y + ny * half },
  ];
}
