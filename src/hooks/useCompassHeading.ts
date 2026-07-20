import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { resolveHeading } from '@/src/services/sensors/heading';
import { smoothAngle } from '@/src/services/sensors/smoothing';

/** Lower = smoother compass but more lag when turning. Tuned against real-device jitter. */
const HEADING_SMOOTHING_ALPHA = 0.15;
/** Skip re-renders for sub-degree changes the eye can't see anyway. */
const MIN_HEADING_CHANGE_DEG = 0.5;

export interface CompassState {
  headingDegrees: number | null;
  accuracy: number | null;
  status: 'requesting' | 'active' | 'error';
  errorMessage: string | null;
}

export function useCompassHeading(): CompassState {
  const [state, setState] = useState<CompassState>({
    headingDegrees: null,
    accuracy: null,
    status: 'requesting',
    errorMessage: null,
  });

  const smoothedRef = useRef<number | null>(null);
  const lastEmittedRef = useRef<number | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      // magHeading works without location permission; trueHeading (corrected for true
      // north) additionally needs it and falls back to magHeading via resolveHeading
      // when it's not granted, so we always subscribe rather than gating on permission.
      try {
        subscription = await Location.watchHeadingAsync((heading) => {
          if (cancelled) return;
          const raw = resolveHeading(heading.trueHeading, heading.magHeading);
          if (raw === null) return;

          smoothedRef.current = smoothAngle(smoothedRef.current, raw, HEADING_SMOOTHING_ALPHA);
          const smoothed = smoothedRef.current;

          const last = lastEmittedRef.current;
          const change = last === null ? Infinity : Math.abs(((smoothed - last + 540) % 360) - 180);
          if (change < MIN_HEADING_CHANGE_DEG) return;
          lastEmittedRef.current = smoothed;

          setState({
            headingDegrees: smoothed,
            accuracy: heading.accuracy,
            status: 'active',
            errorMessage: null,
          });
        });
      } catch (error) {
        if (cancelled) return;
        setState({
          headingDegrees: null,
          accuracy: null,
          status: 'error',
          errorMessage: (error as Error).message,
        });
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return state;
}
