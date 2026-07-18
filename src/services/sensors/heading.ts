/**
 * `trueHeading` needs location permission and is `-1` when unavailable;
 * `magHeading` (uncalibrated for magnetic declination) is used as a fallback
 * so the compass still works if the user denies location but grants motion.
 */
export function resolveHeading(trueHeading: number, magHeading: number): number | null {
  if (trueHeading >= 0) return trueHeading;
  if (Number.isFinite(magHeading) && magHeading >= 0) return magHeading;
  return null;
}
