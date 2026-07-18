import { Horizon, Observer, type FlexibleDateTime } from 'astronomy-engine';
import { clamp, degToRad } from '@/src/utils/math';

export interface HorizontalPosition {
  azimuth: number;
  altitude: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export function equatorialToHorizontal(
  raHours: number,
  decDeg: number,
  observer: Observer,
  date: FlexibleDateTime
): HorizontalPosition {
  const result = Horizon(date, observer, raHours, decDeg, 'normal');
  return { azimuth: result.azimuth, altitude: result.altitude };
}

/**
 * Azimuth is measured clockwise from north; altitude from the horizon.
 * x = east, y = north, z = up — a right-handed local horizontal frame.
 */
export function altAzToVector(azimuthDeg: number, altitudeDeg: number): Vector3 {
  const az = degToRad(azimuthDeg);
  const alt = degToRad(altitudeDeg);
  const cosAlt = Math.cos(alt);
  return {
    x: cosAlt * Math.sin(az),
    y: cosAlt * Math.cos(az),
    z: Math.sin(alt),
  };
}

export function dot(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function normalize(v: Vector3): Vector3 {
  const len = Math.sqrt(dot(v, v));
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export function angularSeparation(a: Vector3, b: Vector3): number {
  return Math.acos(clamp(dot(a, b), -1, 1));
}

const WORLD_UP: Vector3 = { x: 0, y: 0, z: 1 };
/** Used only when the view center is within this many radians of the zenith/nadir. */
const POLE_EPSILON = 1e-6;

/**
 * Gnomonic (tangent-plane) projection of a point on the celestial sphere onto
 * the screen, centered on `viewCenter`. Preserves straight lines, which is why
 * constellation lines stay straight instead of curving near the edges of the FOV.
 * Returns null when the point falls behind the observer (outside a 180° hemisphere).
 */
export function projectGnomonic(
  point: Vector3,
  viewCenter: Vector3,
  fovRadians: number,
  screenWidth: number,
  screenHeight: number
): ScreenPoint | null {
  const cosC = dot(viewCenter, point);
  if (cosC <= 0) return null;

  const referenceUp =
    Math.abs(dot(viewCenter, WORLD_UP)) > 1 - POLE_EPSILON ? { x: 1, y: 0, z: 0 } : WORLD_UP;
  const right = normalize(cross(viewCenter, referenceUp));
  const up = cross(right, viewCenter);

  const tx = dot(point, right) / cosC;
  const ty = dot(point, up) / cosC;

  const scale = screenWidth / 2 / Math.tan(fovRadians / 2);
  return {
    x: screenWidth / 2 + tx * scale,
    y: screenHeight / 2 - ty * scale,
  };
}
