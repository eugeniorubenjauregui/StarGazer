import { METEOR_SHOWERS, isShowerActive, getUpcomingShowers } from '@/src/services/events/meteorShowers';

const perseids = METEOR_SHOWERS.find((s) => s.id === 'perseids')!;
const quadrantids = METEOR_SHOWERS.find((s) => s.id === 'quadrantids')!;

describe('isShowerActive', () => {
  it('marks the Perseids active in mid August', () => {
    expect(isShowerActive(perseids, new Date(2026, 7, 12))).toBe(true);
  });

  it('marks the Perseids inactive in March', () => {
    expect(isShowerActive(perseids, new Date(2026, 2, 12))).toBe(false);
  });

  it('handles windows that wrap the new year (Quadrantids: Dec 28 - Jan 12)', () => {
    expect(isShowerActive(quadrantids, new Date(2026, 11, 30))).toBe(true);
    expect(isShowerActive(quadrantids, new Date(2027, 0, 5))).toBe(true);
    expect(isShowerActive(quadrantids, new Date(2026, 5, 15))).toBe(false);
  });
});

describe('getUpcomingShowers', () => {
  it('returns every shower sorted by next peak', () => {
    const upcoming = getUpcomingShowers(new Date(2026, 6, 20)); // July 20
    expect(upcoming).toHaveLength(METEOR_SHOWERS.length);
    for (let i = 1; i < upcoming.length; i++) {
      expect(upcoming[i].nextPeak.getTime()).toBeGreaterThanOrEqual(upcoming[i - 1].nextPeak.getTime());
    }
  });

  it('rolls a past peak into next year', () => {
    const upcoming = getUpcomingShowers(new Date(2026, 6, 20));
    const lyrids = upcoming.find((u) => u.shower.id === 'lyrids')!;
    expect(lyrids.nextPeak.getFullYear()).toBe(2027); // April peak already passed in July
  });

  it('flags the Delta Aquariids as active on July 20 with a future peak', () => {
    const upcoming = getUpcomingShowers(new Date(2026, 6, 20));
    const deltaAquariids = upcoming.find((u) => u.shower.id === 'delta-aquariids')!;
    expect(deltaAquariids.isActiveNow).toBe(true);
    expect(deltaAquariids.daysToPeak).toBeGreaterThan(0);
    expect(deltaAquariids.daysToPeak).toBeLessThan(15);
  });
});
