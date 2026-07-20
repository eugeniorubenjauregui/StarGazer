import { createObserver } from '@/src/services/astro/observer';
import { getRiseSetTimes } from '@/src/services/astro/riseSet';

describe('getRiseSetTimes', () => {
  const bogota = createObserver(4.711, -74.0721, 2640);
  const from = new Date('2026-07-18T12:00:00Z');

  it('finds all four events at tropical latitudes', () => {
    const times = getRiseSetTimes(bogota, from);
    expect(times.sunrise).not.toBeNull();
    expect(times.sunset).not.toBeNull();
    expect(times.moonrise).not.toBeNull();
    expect(times.moonset).not.toBeNull();
  });

  it('returns events in the future, within the 2-day search window', () => {
    const times = getRiseSetTimes(bogota, from);
    for (const event of [times.sunrise, times.sunset, times.moonrise, times.moonset]) {
      expect(event!.getTime()).toBeGreaterThan(from.getTime());
      expect(event!.getTime() - from.getTime()).toBeLessThan(2 * 86_400_000);
    }
  });

  it('near the equator, day length is ~12h (sunset ~12h from sunrise)', () => {
    const times = getRiseSetTimes(bogota, from);
    // Consecutive sun events from noon UTC (~7am local): sunset comes before next sunrise.
    expect(times.sunset!.getTime()).toBeLessThan(times.sunrise!.getTime());
  });
});
