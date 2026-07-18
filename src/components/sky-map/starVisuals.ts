/** Screen radius for a star, brighter (lower magnitude) stars render larger. */
export function radiusForMagnitude(magnitude: number): number {
  const radius = 4.6 - magnitude * 0.65;
  return Math.min(4.6, Math.max(0.6, radius));
}

export function opacityForMagnitude(magnitude: number): number {
  const opacity = 1.15 - magnitude * 0.16;
  return Math.min(1, Math.max(0.25, opacity));
}
