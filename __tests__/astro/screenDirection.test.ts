import { altAzToVector, screenDirection } from '@/src/services/astro/coordinates';

describe('screenDirection', () => {
  const facingNorthHorizon = altAzToVector(0, 0);

  it('points right for a target to the east', () => {
    const east = altAzToVector(90, 0);
    const direction = screenDirection(east, facingNorthHorizon)!;
    expect(direction.dx).toBeGreaterThan(0.9);
    expect(Math.abs(direction.dy)).toBeLessThan(0.1);
  });

  it('points up (negative dy) for a target above the view center', () => {
    const zenith = altAzToVector(0, 90);
    const direction = screenDirection(zenith, facingNorthHorizon)!;
    expect(direction.dy).toBeLessThan(-0.9);
  });

  it('still gives a lateral direction for a target behind the viewer', () => {
    // Due south on the horizon, slightly east: should point right, not crash.
    const behindEast = altAzToVector(170, 0);
    const direction = screenDirection(behindEast, facingNorthHorizon);
    expect(direction).not.toBeNull();
    expect(direction!.dx).toBeGreaterThan(0);
  });

  it('returns a unit vector', () => {
    const target = altAzToVector(45, 30);
    const direction = screenDirection(target, facingNorthHorizon)!;
    expect(Math.hypot(direction.dx, direction.dy)).toBeCloseTo(1, 6);
  });
});
