import type { ScreenPoint } from '@/src/services/astro/coordinates';
import type { ProjectedConstellation } from './projectSky';

function distance(a: ScreenPoint, b: ScreenPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Finds the constellation whose closest line-segment endpoint is nearest the
 * tapped point, within `maxDistancePx`. Returns null if nothing is close
 * enough (a tap on empty sky).
 */
export function findConstellationAtPoint(
  point: ScreenPoint,
  visibleConstellations: ProjectedConstellation[],
  maxDistancePx: number
): string | null {
  let closestId: string | null = null;
  let closestDistance = maxDistancePx;

  for (const constellation of visibleConstellations) {
    for (const { pointA, pointB } of constellation.segments) {
      for (const candidate of [pointA, pointB]) {
        const d = distance(point, candidate);
        if (d < closestDistance) {
          closestDistance = d;
          closestId = constellation.id;
        }
      }
    }
  }

  return closestId;
}
