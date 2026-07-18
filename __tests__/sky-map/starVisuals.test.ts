import { radiusForMagnitude, opacityForMagnitude } from '@/src/components/sky-map/starVisuals';

describe('radiusForMagnitude', () => {
  it('renders brighter (lower magnitude) stars larger', () => {
    expect(radiusForMagnitude(-1.46)).toBeGreaterThan(radiusForMagnitude(1)); // Sirius vs a dim-ish star
    expect(radiusForMagnitude(1)).toBeGreaterThan(radiusForMagnitude(4));
  });

  it('clamps to a sane pixel range', () => {
    expect(radiusForMagnitude(-5)).toBeLessThanOrEqual(4.6);
    expect(radiusForMagnitude(10)).toBeGreaterThanOrEqual(0.6);
  });
});

describe('opacityForMagnitude', () => {
  it('renders brighter stars more opaque', () => {
    expect(opacityForMagnitude(-1.46)).toBeGreaterThan(opacityForMagnitude(3));
  });

  it('clamps to [0.25, 1]', () => {
    expect(opacityForMagnitude(-5)).toBeLessThanOrEqual(1);
    expect(opacityForMagnitude(10)).toBeGreaterThanOrEqual(0.25);
  });
});
