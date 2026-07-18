import { resolveHeading } from '@/src/services/sensors/heading';

describe('resolveHeading', () => {
  it('prefers trueHeading when available', () => {
    expect(resolveHeading(123, 130)).toBe(123);
  });

  it('falls back to magHeading when trueHeading is -1 (no location permission)', () => {
    expect(resolveHeading(-1, 130)).toBe(130);
  });

  it('returns null when neither heading is available', () => {
    expect(resolveHeading(-1, -1)).toBeNull();
  });
});
