import { createObserver } from '@/src/services/astro/observer';
import { buildSearchTargets, filterTargets } from '@/src/services/search/searchTargets';

const OBSERVER = createObserver(4.711, -74.0721, 2640);
const DATE = new Date('2026-07-18T03:00:00Z');

describe('buildSearchTargets', () => {
  const targets = buildSearchTargets(OBSERVER, DATE);

  it('includes planets, constellations and named stars', () => {
    expect(targets.filter((t) => t.type === 'planet')).toHaveLength(6);
    expect(targets.filter((t) => t.type === 'constellation')).toHaveLength(88);
    expect(targets.filter((t) => t.type === 'star').length).toBeGreaterThan(100);
  });

  it('planets come first (most common searches)', () => {
    expect(targets[0].type).toBe('planet');
  });
});

describe('filterTargets', () => {
  const targets = buildSearchTargets(OBSERVER, DATE);

  it('finds Jupiter by Spanish name', () => {
    const results = filterTargets(targets, 'júpiter');
    expect(results[0].name).toBe('Júpiter');
  });

  it('is accent-insensitive', () => {
    const results = filterTargets(targets, 'jupiter');
    expect(results[0].name).toBe('Júpiter');
    expect(filterTargets(targets, 'orion')[0].name).toBe('Orión');
  });

  it('matches partial names', () => {
    const results = filterTargets(targets, 'sir');
    expect(results.some((r) => r.name === 'Sirio')).toBe(true);
  });

  it('caps results and returns a default list for an empty query', () => {
    expect(filterTargets(targets, '').length).toBeLessThanOrEqual(25);
    expect(filterTargets(targets, 'a').length).toBeLessThanOrEqual(25);
  });
});
