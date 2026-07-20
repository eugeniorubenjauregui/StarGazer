import type { Observer } from 'astronomy-engine';
import {
  equatorialToHorizontal,
  altAzToVector,
  projectGnomonic,
  type ScreenPoint,
  type Vector3,
} from '@/src/services/astro/coordinates';
import type { Star, Constellation } from '@/src/services/catalog/types';
import type { PlanetPosition } from '@/src/services/astro/planets';

export interface ProjectedStar {
  star: Star;
  point: ScreenPoint;
}

export interface ProjectedConstellation {
  id: string;
  segments: { pointA: ScreenPoint; pointB: ScreenPoint }[];
  /** Canonical label anchor when it falls inside the view. */
  labelPoint?: ScreenPoint;
}

export interface ProjectedPlanet {
  planet: PlanetPosition;
  point: ScreenPoint;
}

export interface CardinalMarker {
  label: string;
  azimuth: number;
  point: ScreenPoint;
}

export interface ProjectedSky {
  projectedStars: ProjectedStar[];
  visibleConstellations: ProjectedConstellation[];
  cardinalMarkers: CardinalMarker[];
  projectedPlanets: ProjectedPlanet[];
}

/**
 * Slow tier: everything that depends only on observer position and date —
 * recomputed every ~30s or on a GPS change, never per sensor frame. With the
 * full ~5000-star catalog this is the expensive half of the pipeline (one
 * astronomy-engine Horizon() call per object).
 */
export interface SkyGeometry {
  stars: { star: Star; vector: Vector3 }[];
  constellations: { id: string; lineVectors: Vector3[][]; labelVector: Vector3 }[];
  planets: { planet: PlanetPosition; vector: Vector3; belowHorizon: boolean }[];
}

export function computeSkyGeometry(
  stars: Star[],
  constellations: Constellation[],
  planets: PlanetPosition[],
  observer: Observer,
  date: Date
): SkyGeometry {
  const toVector = (ra: number, dec: number): { vector: Vector3; altitude: number } => {
    const horizontal = equatorialToHorizontal(ra, dec, observer, date);
    return { vector: altAzToVector(horizontal.azimuth, horizontal.altitude), altitude: horizontal.altitude };
  };

  return {
    stars: stars.map((star) => ({ star, vector: toVector(star.ra, star.dec).vector })),
    constellations: constellations.map((constellation) => ({
      id: constellation.id,
      lineVectors: constellation.lines.map((line) => line.map(([ra, dec]) => toVector(ra, dec).vector)),
      labelVector: toVector(constellation.label[0], constellation.label[1]).vector,
    })),
    planets: planets.map((planet) => {
      const { vector, altitude } = toVector(planet.ra, planet.dec);
      return { planet, vector, belowHorizon: altitude < 0 };
    }),
  };
}

const CARDINAL_POINTS: { label: string; azimuth: number }[] = [
  { label: 'N', azimuth: 0 },
  { label: 'NE', azimuth: 45 },
  { label: 'E', azimuth: 90 },
  { label: 'SE', azimuth: 135 },
  { label: 'S', azimuth: 180 },
  { label: 'SO', azimuth: 225 },
  { label: 'O', azimuth: 270 },
  { label: 'NO', azimuth: 315 },
];

/** Projects the compass points sitting on the horizon (altitude 0) into screen space. */
export function projectCardinalMarkers(
  centerAzimuth: number,
  centerAltitude: number,
  fovDegrees: number,
  width: number,
  height: number
): CardinalMarker[] {
  const fovRadians = (fovDegrees * Math.PI) / 180;
  const viewCenter = altAzToVector(centerAzimuth, centerAltitude);
  const markers: CardinalMarker[] = [];
  for (const { label, azimuth } of CARDINAL_POINTS) {
    const point = projectGnomonic(altAzToVector(azimuth, 0), viewCenter, fovRadians, width, height);
    if (point) markers.push({ label, azimuth, point });
  }
  return markers;
}

/**
 * Fast tier: projects precomputed geometry onto the screen for the current
 * view direction. Cheap dot products only — safe to run on every sensor
 * update.
 */
export function projectGeometry(
  geometry: SkyGeometry,
  centerAzimuth: number,
  centerAltitude: number,
  fovDegrees: number,
  width: number,
  height: number
): ProjectedSky {
  const fovRadians = (fovDegrees * Math.PI) / 180;
  const viewCenter = altAzToVector(centerAzimuth, centerAltitude);

  const projectedStars: ProjectedStar[] = [];
  for (const { star, vector } of geometry.stars) {
    const point = projectGnomonic(vector, viewCenter, fovRadians, width, height);
    if (point) projectedStars.push({ star, point });
  }

  const visibleConstellations: ProjectedConstellation[] = [];
  for (const constellation of geometry.constellations) {
    const segments: { pointA: ScreenPoint; pointB: ScreenPoint }[] = [];
    for (const line of constellation.lineVectors) {
      let previous: ScreenPoint | null = null;
      for (const vector of line) {
        const point = projectGnomonic(vector, viewCenter, fovRadians, width, height);
        if (point && previous) segments.push({ pointA: previous, pointB: point });
        previous = point;
      }
    }
    if (segments.length === 0) continue;
    const labelPoint = projectGnomonic(constellation.labelVector, viewCenter, fovRadians, width, height);
    visibleConstellations.push({
      id: constellation.id,
      segments,
      ...(labelPoint ? { labelPoint } : {}),
    });
  }

  const projectedPlanets: ProjectedPlanet[] = [];
  for (const { planet, vector, belowHorizon } of geometry.planets) {
    if (belowHorizon) continue;
    const point = projectGnomonic(vector, viewCenter, fovRadians, width, height);
    if (point) projectedPlanets.push({ planet, point });
  }

  return {
    projectedStars,
    visibleConstellations,
    cardinalMarkers: projectCardinalMarkers(centerAzimuth, centerAltitude, fovDegrees, width, height),
    projectedPlanets,
  };
}
