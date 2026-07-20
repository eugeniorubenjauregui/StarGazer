import { averageForTonight, classifyCloudCover } from '@/src/services/weather/cloudCover';

describe('classifyCloudCover', () => {
  it('classifies the three bands', () => {
    expect(classifyCloudCover(10)).toBe('despejado');
    expect(classifyCloudCover(50)).toBe('parcial');
    expect(classifyCloudCover(90)).toBe('nublado');
  });
});

describe('averageForTonight', () => {
  const now = new Date('2026-07-18T15:00:00');

  it('averages only the 20:00-02:00 window', () => {
    const times = [
      '2026-07-18T15:00',
      '2026-07-18T20:00',
      '2026-07-18T23:00',
      '2026-07-19T02:00',
      '2026-07-19T10:00',
    ];
    const cover = [100, 10, 20, 30, 100];
    expect(averageForTonight(times, cover, now)).toBeCloseTo(20, 5);
  });

  it('returns null when no samples fall in the window', () => {
    expect(averageForTonight(['2026-07-18T10:00'], [50], now)).toBeNull();
  });
});
