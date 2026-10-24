// Race tracks for the typing car: Road Race style - an open road from a start
// line to a finish line, not a loop. The car starts on the line at the left
// and drives to the finish at the right as correct letters are typed. Each
// track has its own high scores. Shapes are drawn on a 240 by 160 canvas.

export interface Point {
  x: number;
  y: number;
}

export interface Track {
  id: string;
  name: string;
  /** The open road, left to right. The car never goes past the last point. */
  points: Point[];
}

const SEGMENTS = 48;

/** Points along an open road running left to right, with a gentle curve. */
function road(cy: number, amplitude: number, waves: number): Point[] {
  return Array.from({ length: SEGMENTS + 1 }, (_, i) => {
    const t = i / SEGMENTS;
    return { x: 20 + 200 * t, y: cy + amplitude * Math.sin(t * Math.PI * waves) };
  });
}

export const TRACKS: Track[] = [
  { id: 'coast-highway', name: 'Coast highway', points: road(80, 8, 1) },
  { id: 'mountain-pass', name: 'Mountain pass', points: road(80, 18, 2) },
];

/** Distance along the open road, between each consecutive pair of points. */
function segmentLengths(points: Point[]): number[] {
  return points.slice(1).map((p, i) => Math.hypot(p.x - points[i]!.x, p.y - points[i]!.y));
}

/**
 * Where the car is on the road, from the start line (progress 0) to the
 * finish line (progress 1). Progress past 1 stays at the finish line.
 */
export function trackPointAt(track: Track, progress: number): Point {
  const { points } = track;
  const lengths = segmentLengths(points);
  const total = lengths.reduce((sum, l) => sum + l, 0);
  let distance = Math.min(Math.max(progress, 0), 1) * total;
  for (let i = 0; i < lengths.length; i++) {
    const length = lengths[i]!;
    if (distance <= length || i === lengths.length - 1) {
      const p = points[i]!;
      const q = points[i + 1]!;
      const t = length === 0 ? 0 : Math.min(distance / length, 1);
      return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
    }
    distance -= length;
  }
  return points[0]!;
}

/** A short bar across the road, perpendicular to it, at a pair of neighbouring points. */
function crossBar(p: Point, q: Point, at: Point): [Point, Point] {
  const length = Math.hypot(q.x - p.x, q.y - p.y) || 1;
  const nx = -(q.y - p.y) / length;
  const ny = (q.x - p.x) / length;
  const half = 9;
  return [
    { x: at.x - nx * half, y: at.y - ny * half },
    { x: at.x + nx * half, y: at.y + ny * half },
  ];
}

/** The start line: a short bar across the road at its first point. */
export function startLine(track: Track): [Point, Point] {
  const [p, q] = track.points;
  return crossBar(p!, q!, p!);
}

/** The finish line: a short bar across the road at its last point. */
export function finishLine(track: Track): [Point, Point] {
  const { points } = track;
  const [p, q] = [points[points.length - 2]!, points[points.length - 1]!];
  return crossBar(p, q, q);
}
