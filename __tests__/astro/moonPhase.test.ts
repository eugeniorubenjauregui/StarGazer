import {
  classifyMoonPhase,
  illuminatedFraction,
  getMoonPhase,
  getUpcomingMoonQuarters,
} from '@/src/services/astro/moonPhase';

describe('classifyMoonPhase', () => {
  it.each([
    [0, 'new'],
    [20, 'new'],
    [46, 'waxingCrescent'],
    [90, 'firstQuarter'],
    [180, 'full'],
    [270, 'lastQuarter'],
    [316, 'waningCrescent'],
    [359, 'new'],
  ])('classifies %s degrees as %s', (angle, expected) => {
    expect(classifyMoonPhase(angle)).toBe(expected);
  });
});

describe('illuminatedFraction', () => {
  it('is 0 at new moon', () => {
    expect(illuminatedFraction(0)).toBeCloseTo(0, 6);
  });

  it('is 1 at full moon', () => {
    expect(illuminatedFraction(180)).toBeCloseTo(1, 6);
  });

  it('is 0.5 at the quarters', () => {
    expect(illuminatedFraction(90)).toBeCloseTo(0.5, 6);
    expect(illuminatedFraction(270)).toBeCloseTo(0.5, 6);
  });
});

describe('getMoonPhase', () => {
  it('returns a self-consistent angle/name/illumination triple for today', () => {
    const info = getMoonPhase(new Date());
    expect(info.phaseAngle).toBeGreaterThanOrEqual(0);
    expect(info.phaseAngle).toBeLessThan(360);
    expect(info.name).toBe(classifyMoonPhase(info.phaseAngle));
    expect(info.illumination).toBeCloseTo(illuminatedFraction(info.phaseAngle), 6);
  });
});

describe('getUpcomingMoonQuarters', () => {
  it('returns quarters in strictly increasing chronological order', () => {
    const quarters = getUpcomingMoonQuarters(new Date('2026-07-18T00:00:00Z'), 6);
    expect(quarters).toHaveLength(6);
    for (let i = 1; i < quarters.length; i++) {
      expect(quarters[i].date.getTime()).toBeGreaterThan(quarters[i - 1].date.getTime());
    }
  });

  it('cycles through the four named quarters in order', () => {
    const quarters = getUpcomingMoonQuarters(new Date('2026-07-18T00:00:00Z'), 8);
    const names = quarters.map((q) => q.name);
    const cycle = ['new', 'firstQuarter', 'full', 'lastQuarter'];
    const startIndex = cycle.indexOf(names[0]);
    const expected = Array.from({ length: 8 }, (_, i) => cycle[(startIndex + i) % 4]);
    expect(names).toEqual(expected);
  });

  it('spans about 3/4 of a synodic month across 4 consecutive quarters (~22 days)', () => {
    const quarters = getUpcomingMoonQuarters(new Date('2026-07-18T00:00:00Z'), 4);
    const daysSpan =
      (quarters[3].date.getTime() - quarters[0].date.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysSpan).toBeGreaterThan(20);
    expect(daysSpan).toBeLessThan(25);
  });
});
