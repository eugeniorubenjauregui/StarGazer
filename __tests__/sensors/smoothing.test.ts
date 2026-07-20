import { smoothAngle, smoothValue } from '@/src/services/sensors/smoothing';

describe('smoothAngle', () => {
  it('returns the raw value on the first sample', () => {
    expect(smoothAngle(null, 123, 0.2)).toBe(123);
  });

  it('moves partway toward the new value', () => {
    expect(smoothAngle(100, 110, 0.5)).toBeCloseTo(105, 6);
  });

  it('takes the short path across the 0/360 wraparound', () => {
    // 359 -> 1 is a +2 degree move, not -358.
    expect(smoothAngle(359, 1, 0.5)).toBeCloseTo(0, 6);
    // 1 -> 359 is a -2 degree move; result stays in [0, 360).
    expect(smoothAngle(1, 359, 0.5)).toBeCloseTo(0, 6);
  });

  it('damps jitter: small oscillations barely move the output', () => {
    let value: number | null = null;
    for (const sample of [180, 183, 178, 182, 179, 181]) {
      value = smoothAngle(value, sample, 0.2);
    }
    expect(Math.abs(value! - 180)).toBeLessThan(2);
  });
});

describe('smoothValue', () => {
  it('returns the raw value on the first sample', () => {
    expect(smoothValue(null, 45, 0.2)).toBe(45);
  });

  it('moves partway toward the new value', () => {
    expect(smoothValue(40, 50, 0.25)).toBeCloseTo(42.5, 6);
  });
});
