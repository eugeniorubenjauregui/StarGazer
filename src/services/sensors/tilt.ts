import { radToDeg } from '@/src/utils/math';

/**
 * Pitch (degrees above the horizon) of the direction the top edge of the phone
 * points, from a DeviceMotion `accelerationIncludingGravity` reading, assuming
 * the phone is held vertically in portrait with its top edge aimed at the sky.
 *
 * Accelerometer axis conventions have historically varied a bit by platform;
 * the sign/orientation here should be double-checked on a physical device
 * (see the phase 8 QA checklist) before shipping.
 */
export function pitchFromAcceleration(x: number, y: number, z: number): number {
  return radToDeg(Math.atan2(-y, Math.sqrt(x * x + z * z)));
}
