import { createObserver } from '@/src/services/astro/observer';
import { getPlanetPositions } from '@/src/services/astro/planets';

const OBSERVER = createObserver(4.711, -74.0721, 2640);
const DATE = new Date('2026-07-18T03:00:00Z');

describe('getPlanetPositions', () => {
  it('returns the Moon and the five naked-eye planets', () => {
    const planets = getPlanetPositions(OBSERVER, DATE);
    expect(planets.map((p) => p.id).sort()).toEqual(
      ['jupiter', 'mars', 'mercury', 'moon', 'saturn', 'venus'].sort()
    );
  });

  it('returns coordinates in valid ranges', () => {
    for (const planet of getPlanetPositions(OBSERVER, DATE)) {
      expect(planet.ra).toBeGreaterThanOrEqual(0);
      expect(planet.ra).toBeLessThan(24);
      expect(planet.dec).toBeGreaterThanOrEqual(-90);
      expect(planet.dec).toBeLessThanOrEqual(90);
      expect(Number.isFinite(planet.magnitude)).toBe(true);
    }
  });

  it('reports Venus brighter than Saturn (always true from Earth)', () => {
    const planets = getPlanetPositions(OBSERVER, DATE);
    const venus = planets.find((p) => p.id === 'venus')!;
    const saturn = planets.find((p) => p.id === 'saturn')!;
    expect(venus.magnitude).toBeLessThan(saturn.magnitude);
  });
});
