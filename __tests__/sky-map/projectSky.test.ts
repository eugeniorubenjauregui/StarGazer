import { createObserver } from '@/src/services/astro/observer';
import {
  computeSkyGeometry,
  projectGeometry,
  projectCardinalMarkers,
} from '@/src/services/sky-map/projectSky';
import type { Star, Constellation } from '@/src/services/catalog/types';

const POLARIS: Star = { id: 'polaris', name: 'Polaris', ra: 2.5303, dec: 89.264, magnitude: 1.98 };
const SOUTH_POLE_STAR: Star = { id: 'south-pole-star', ra: 0, dec: -89.264, magnitude: 1.98 };
const OBSERVER = createObserver(45, 0, 0);
const DATE = new Date('2026-07-18T03:00:00Z');

describe('computeSkyGeometry + projectGeometry', () => {
  it('projects Polaris near the center of the screen when facing north near its altitude', () => {
    const geometry = computeSkyGeometry([POLARIS], [], [], OBSERVER, DATE);
    // At 45deg N, Polaris sits at ~45deg altitude, close to (but not exactly) due
    // north -- it's ~0.7deg off the true celestial pole, hence the loose tolerance.
    const sky = projectGeometry(geometry, 0, 45, 70, 1000, 800);
    expect(sky.projectedStars).toHaveLength(1);
    const point = sky.projectedStars[0].point;
    expect(Math.abs(point.x - 500)).toBeLessThan(15);
    expect(Math.abs(point.y - 400)).toBeLessThan(15);
  });

  it('omits stars on the far side of the sphere', () => {
    const geometry = computeSkyGeometry([SOUTH_POLE_STAR], [], [], OBSERVER, DATE);
    const sky = projectGeometry(geometry, 0, 45, 70, 1000, 800);
    expect(sky.projectedStars).toHaveLength(0);
  });

  it('projects constellation polylines into consecutive segments', () => {
    // A short polyline around Polaris: 3 vertices -> 2 segments.
    const constellation: Constellation = {
      id: 'Tst',
      lines: [
        [
          [2.5, 88],
          [4.0, 88.5],
          [6.0, 88],
        ],
      ],
      label: [2.5, 88],
    };
    const geometry = computeSkyGeometry([], [constellation], [], OBSERVER, DATE);
    const sky = projectGeometry(geometry, 0, 45, 70, 1000, 800);
    expect(sky.visibleConstellations).toHaveLength(1);
    expect(sky.visibleConstellations[0].segments).toHaveLength(2);
    expect(sky.visibleConstellations[0].labelPoint).toBeDefined();
  });

  it('drops constellations entirely outside the view', () => {
    const constellation: Constellation = {
      id: 'Tst',
      lines: [
        [
          [0, -88],
          [4, -88],
        ],
      ],
      label: [0, -88],
    };
    const geometry = computeSkyGeometry([], [constellation], [], OBSERVER, DATE);
    const sky = projectGeometry(geometry, 0, 45, 70, 1000, 800);
    expect(sky.visibleConstellations).toHaveLength(0);
  });

  it('excludes planets below the horizon', () => {
    const geometry = computeSkyGeometry(
      [],
      [],
      [{ id: 'test', name: 'Test', ra: 0, dec: -89, magnitude: 1 }],
      OBSERVER,
      DATE
    );
    expect(geometry.planets[0].belowHorizon).toBe(true);
    const sky = projectGeometry(geometry, 180, 10, 70, 1000, 800);
    expect(sky.projectedPlanets).toHaveLength(0);
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
