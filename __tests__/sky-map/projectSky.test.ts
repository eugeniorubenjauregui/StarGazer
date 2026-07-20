import { createObserver } from '@/src/services/astro/observer';
import {
  computeStarVectors,
  projectVectors,
  projectSky,
  projectCardinalMarkers,
} from '@/src/services/sky-map/projectSky';
import type { Star } from '@/src/services/catalog/types';
import type { ResolvedConstellation } from '@/src/services/catalog/loadConstellations';

const POLARIS: Star = { id: 'polaris', name: 'Polaris', ra: 2.5303, dec: 89.264, magnitude: 1.98 };
const SOUTH_POLE_STAR: Star = { id: 'south-pole-star', name: 'South Pole Star', ra: 0, dec: -89.264, magnitude: 1.98 };
const OBSERVER = createObserver(45, 0, 0);
const DATE = new Date('2026-07-18T03:00:00Z');

describe('computeStarVectors + projectVectors', () => {
  it('projects Polaris near the center of the screen when facing north near its altitude', () => {
    const vectors = computeStarVectors([POLARIS], OBSERVER, DATE);
    // At 45deg N, Polaris sits at ~45deg altitude, close to (but not exactly) due
    // north -- it's ~0.7deg off the true celestial pole, hence the loose tolerance.
    const points = projectVectors(vectors, 0, 45, 70, 1000, 800);
    const point = points.get('polaris');
    expect(point).toBeDefined();
    expect(Math.abs(point!.x - 500)).toBeLessThan(15);
    expect(Math.abs(point!.y - 400)).toBeLessThan(15);
  });

  it('omits stars below the horizon opposite the observer (culled as behind-view or below ground)', () => {
    const vectors = computeStarVectors([SOUTH_POLE_STAR], OBSERVER, DATE);
    // From 45N, the south celestial pole is always below the horizon.
    const points = projectVectors(vectors, 0, 45, 70, 1000, 800);
    expect(points.has('south-pole-star')).toBe(false);
  });
});

describe('projectCardinalMarkers', () => {
  it('centers N on screen when facing due north at the horizon', () => {
    const markers = projectCardinalMarkers(0, 0, 70, 1000, 800);
    const north = markers.find((m) => m.label === 'N');
    expect(north).toBeDefined();
    expect(north!.point.x).toBeCloseTo(500, 5);
    expect(north!.point.y).toBeCloseTo(400, 5);
  });

  it('omits compass points behind the viewer', () => {
    const markers = projectCardinalMarkers(0, 0, 70, 1000, 800);
    expect(markers.find((m) => m.label === 'S')).toBeUndefined();
  });

  it('places E to the right of N when facing north', () => {
    const markers = projectCardinalMarkers(0, 0, 70, 1000, 800);
    const north = markers.find((m) => m.label === 'N')!;
    const east = markers.find((m) => m.label === 'E')!;
    expect(east.point.x).toBeGreaterThan(north.point.x);
  });
});

describe('projectSky', () => {
  const constellations: ResolvedConstellation[] = [
    { id: 'polaris-only', segments: [{ a: POLARIS, b: SOUTH_POLE_STAR }] },
  ];

  it('drops a constellation segment when one endpoint is not visible', () => {
    const sky = projectSky({
      stars: [POLARIS, SOUTH_POLE_STAR],
      constellations,
      observer: OBSERVER,
      date: DATE,
      centerAzimuth: 0,
      centerAltitude: 45,
      fovDegrees: 70,
      width: 1000,
      height: 800,
    });

    expect(sky.projectedStars.map((p) => p.star.id)).toEqual(['polaris']);
    expect(sky.visibleConstellations).toHaveLength(0);
  });

  it('includes a constellation once both endpoints are visible', () => {
    const bothVisible: ResolvedConstellation[] = [{ id: 'test', segments: [{ a: POLARIS, b: POLARIS }] }];
    const sky = projectSky({
      stars: [POLARIS],
      constellations: bothVisible,
      observer: OBSERVER,
      date: DATE,
      centerAzimuth: 0,
      centerAltitude: 45,
      fovDegrees: 70,
      width: 1000,
      height: 800,
    });

    expect(sky.visibleConstellations).toHaveLength(1);
    expect(sky.visibleConstellations[0].segments).toHaveLength(1);
  });
});
