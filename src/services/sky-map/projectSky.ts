import type { Observer } from 'astronomy-engine';
import {
  equatorialToHorizontal,
  altAzToVector,
  projectGnomonic,
  type ScreenPoint,
  type Vector3,
} from '@/src/services/astro/coordinates';
import type { Star } from '@/src/services/catalog/types';
import type { ResolvedConstellation } from '@/src/services/catalog/loadConstellations';

export interface ProjectedStar {
  star: Star;
  point: ScreenPoint;
}

export interface ProjectedConstellation {
  id: string;
  segments: { pointA: ScreenPoint; pointB: ScreenPoint }[];
}

export interface ProjectedSky {
  projectedStars: ProjectedStar[];
  visibleConstellations: ProjectedConstellation[];
  projectedPointById: Map<string, ScreenPoint>;
}

/** Slow tier: RA/Dec -> Az/Alt -> unit vector only depends on observer position and date, not view direction. */
export function computeStarVectors(stars: Star[], observer: Observer, date: Date): Map<string, Vector3> {
  const map = new Map<string, Vector3>();
  for (const star of stars) {
    const horizontal = equatorialToHorizontal(star.ra, star.dec, observer, date);
    map.set(star.id, altAzToVector(horizontal.azimuth, horizontal.altitude));
  }
  return map;
}

/** Fast tier: projecting cached vectors onto the screen from the current view direction. */
export function projectVectors(
  starVectors: Map<string, Vector3>,
  centerAzimuth: number,
  centerAltitude: number,
  fovDegrees: number,
  width: number,
  height: number
): Map<string, ScreenPoint> {
  const fovRadians = (fovDegrees * Math.PI) / 180;
  const viewCenter = altAzToVector(centerAzimuth, centerAltitude);
  const points = new Map<string, ScreenPoint>();
  for (const [id, vector] of starVectors) {
    const point = projectGnomonic(vector, viewCenter, fovRadians, width, height);
    if (point) points.set(id, point);
  }
  return points;
}

export interface ProjectSkyParams {
  stars: Star[];
  constellations: ResolvedConstellation[];
  observer: Observer;
  date: Date;
  centerAzimuth: number;
  centerAltitude: number;
  fovDegrees: number;
  width: number;
  height: number;
}

export function projectSky({
  stars,
  constellations,
  observer,
  date,
  centerAzimuth,
  centerAltitude,
  fovDegrees,
  width,
  height,
}: ProjectSkyParams): ProjectedSky {
  const starVectors = computeStarVectors(stars, observer, date);
  const projectedPointById = projectVectors(starVectors, centerAzimuth, centerAltitude, fovDegrees, width, height);

  const projectedStars: ProjectedStar[] = [];
  for (const star of stars) {
    const point = projectedPointById.get(star.id);
    if (point) projectedStars.push({ star, point });
  }

  const visibleConstellations: ProjectedConstellation[] = [];
  for (const constellation of constellations) {
    const segments: { pointA: ScreenPoint; pointB: ScreenPoint }[] = [];
    for (const { a, b } of constellation.segments) {
      const pointA = projectedPointById.get(a.id);
      const pointB = projectedPointById.get(b.id);
      if (pointA && pointB) segments.push({ pointA, pointB });
    }
    if (segments.length > 0) visibleConstellations.push({ id: constellation.id, segments });
  }

  return { projectedStars, visibleConstellations, projectedPointById };
}
