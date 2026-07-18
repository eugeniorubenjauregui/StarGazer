import { findConstellationAtPoint } from '@/src/services/sky-map/hitTest';
import type { ProjectedConstellation } from '@/src/services/sky-map/projectSky';

const CONSTELLATIONS: ProjectedConstellation[] = [
  {
    id: 'orion',
    segments: [
      { pointA: { x: 100, y: 100 }, pointB: { x: 150, y: 120 } },
      { pointA: { x: 150, y: 120 }, pointB: { x: 200, y: 100 } },
    ],
  },
  {
    id: 'ursa-major',
    segments: [{ pointA: { x: 500, y: 500 }, pointB: { x: 540, y: 480 } }],
  },
];

describe('findConstellationAtPoint', () => {
  it('finds the constellation whose nearest star is within range', () => {
    expect(findConstellationAtPoint({ x: 102, y: 101 }, CONSTELLATIONS, 20)).toBe('orion');
  });

  it('returns null when nothing is close enough', () => {
    expect(findConstellationAtPoint({ x: 300, y: 300 }, CONSTELLATIONS, 20)).toBeNull();
  });

  it('picks the closer constellation when two are within range', () => {
    // Equidistant-ish tap: closer to the ursa-major endpoint than to any orion endpoint.
    expect(findConstellationAtPoint({ x: 505, y: 505 }, CONSTELLATIONS, 1000)).toBe('ursa-major');
  });

  it('respects the maxDistancePx boundary', () => {
    expect(findConstellationAtPoint({ x: 110, y: 100 }, CONSTELLATIONS, 20)).toBe('orion');
    expect(findConstellationAtPoint({ x: 300, y: 100 }, CONSTELLATIONS, 20)).toBeNull();
  });
});
