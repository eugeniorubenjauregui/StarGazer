import { createObserver } from '@/src/services/astro/observer';
import {
  equatorialToHorizontal,
  altAzToVector,
  angularSeparation,
  projectGnomonic,
  dot,
} from '@/src/services/astro/coordinates';
import { degToRad } from '@/src/utils/math';

// Polaris (J2000): RA 2h31m49s ~= 2.5303h, Dec +89.264 deg.
const POLARIS_RA_HOURS = 2.5303;
const POLARIS_DEC_DEG = 89.264;

describe('equatorialToHorizontal', () => {
  it.each([0, 19.4326, 45, 51.5074])(
    "Polaris' altitude approximates the observer's latitude (%s deg N)",
    (latitude) => {
      const observer = createObserver(latitude, -70, 0);
      // Any date works: Polaris sits almost exactly on the celestial pole,
      // so its altitude barely changes with Earth's rotation.
      const date = new Date('2026-07-18T03:00:00Z');
      const { altitude } = equatorialToHorizontal(POLARIS_RA_HOURS, POLARIS_DEC_DEG, observer, date);
      expect(altitude).toBeCloseTo(latitude, 0);
    }
  );

  it('places a star at the south celestial pole below the horizon for a northern observer', () => {
    const observer = createObserver(45, 0, 0);
    const date = new Date('2026-07-18T03:00:00Z');
    const { altitude } = equatorialToHorizontal(0, -89.264, observer, date);
    expect(altitude).toBeLessThan(0);
  });
});

describe('altAzToVector + angularSeparation', () => {
  it('produces unit vectors', () => {
    const v = altAzToVector(123, 45);
    expect(dot(v, v)).toBeCloseTo(1, 6);
  });

  it('gives zero separation for the same direction', () => {
    const a = altAzToVector(10, 20);
    expect(angularSeparation(a, a)).toBeCloseTo(0, 6);
  });

  it('gives ~90deg separation between the zenith and the horizon due north', () => {
    const zenith = altAzToVector(0, 90);
    const northHorizon = altAzToVector(0, 0);
    expect(angularSeparation(zenith, northHorizon)).toBeCloseTo(Math.PI / 2, 6);
  });

  it('gives ~180deg separation between opposite points on the sphere', () => {
    const north = altAzToVector(0, 30);
    const south = altAzToVector(180, -30);
    expect(angularSeparation(north, south)).toBeCloseTo(Math.PI, 6);
  });
});

describe('projectGnomonic', () => {
  const fov = degToRad(90);

  it('projects the view center to the middle of the screen', () => {
    const center = altAzToVector(200, 40);
    const point = projectGnomonic(center, center, fov, 1000, 800);
    expect(point).not.toBeNull();
    expect(point!.x).toBeCloseTo(500, 5);
    expect(point!.y).toBeCloseTo(400, 5);
  });

  it('returns null for a point behind the observer', () => {
    const center = altAzToVector(0, 45);
    const behind = altAzToVector(180, -45);
    expect(projectGnomonic(behind, center, fov, 1000, 800)).toBeNull();
  });

  it('projects a point near the edge of the FOV away from center, on the correct side', () => {
    const center = altAzToVector(0, 0); // facing north, on the horizon
    const slightlyEast = altAzToVector(10, 0);
    const point = projectGnomonic(center, center, fov, 1000, 800);
    const eastPoint = projectGnomonic(slightlyEast, center, fov, 1000, 800);
    expect(eastPoint).not.toBeNull();
    // Azimuth increases clockwise (toward the east); east should render to the right of center.
    expect(eastPoint!.x).toBeGreaterThan(point!.x);
  });

  it('handles a view center at the zenith without producing NaN', () => {
    const center = altAzToVector(0, 90);
    const nearby = altAzToVector(45, 89);
    const point = projectGnomonic(nearby, center, fov, 1000, 800);
    expect(point).not.toBeNull();
    expect(Number.isFinite(point!.x)).toBe(true);
    expect(Number.isFinite(point!.y)).toBe(true);
  });
});
