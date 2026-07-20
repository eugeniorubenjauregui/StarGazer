/**
 * Exponential moving average for angles in degrees, taking the shortest path
 * around the circle so smoothing a heading crossing 359 -> 1 doesn't swing
 * the long way through 180. `alpha` in (0, 1]: lower = smoother but laggier.
 */
export function smoothAngle(previous: number | null, next: number, alpha: number): number {
  if (previous === null) return next;
  const delta = ((next - previous + 540) % 360) - 180;
  return (previous + alpha * delta + 360) % 360;
}

/** Plain exponential moving average for non-circular values (e.g. pitch). */
export function smoothValue(previous: number | null, next: number, alpha: number): number {
  if (previous === null) return next;
  return previous + alpha * (next - previous);
}
