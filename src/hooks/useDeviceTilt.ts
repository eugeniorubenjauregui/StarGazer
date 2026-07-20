import { useEffect, useRef, useState } from 'react';
import { DeviceMotion } from 'expo-sensors';
import { pitchFromAcceleration } from '@/src/services/sensors/tilt';
import { smoothValue } from '@/src/services/sensors/smoothing';

const UPDATE_INTERVAL_MS = 100;
/** Lower = smoother tilt but more lag. The accelerometer also picks up hand shake, so keep this low. */
const PITCH_SMOOTHING_ALPHA = 0.2;
/** Skip re-renders for sub-degree changes the eye can't see anyway. */
const MIN_PITCH_CHANGE_DEG = 0.5;

export interface TiltState {
  pitchDegrees: number | null;
  status: 'requesting' | 'active' | 'unavailable';
}

export function useDeviceTilt(): TiltState {
  const [state, setState] = useState<TiltState>({ pitchDegrees: null, status: 'requesting' });
  const smoothedRef = useRef<number | null>(null);
  const lastEmittedRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let subscription: ReturnType<typeof DeviceMotion.addListener> | null = null;

    (async () => {
      const available = await DeviceMotion.isAvailableAsync();
      if (cancelled) return;

      if (!available) {
        setState({ pitchDegrees: null, status: 'unavailable' });
        return;
      }

      DeviceMotion.setUpdateInterval(UPDATE_INTERVAL_MS);
      subscription = DeviceMotion.addListener(({ accelerationIncludingGravity }) => {
        if (cancelled || !accelerationIncludingGravity) return;
        const { x, y, z } = accelerationIncludingGravity;

        smoothedRef.current = smoothValue(
          smoothedRef.current,
          pitchFromAcceleration(x, y, z),
          PITCH_SMOOTHING_ALPHA
        );
        const smoothed = smoothedRef.current;

        const last = lastEmittedRef.current;
        if (last !== null && Math.abs(smoothed - last) < MIN_PITCH_CHANGE_DEG) return;
        lastEmittedRef.current = smoothed;

        setState({ pitchDegrees: smoothed, status: 'active' });
      });
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return state;
}
