import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { resolveHeading } from '@/src/services/sensors/heading';

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
          setState({
            headingDegrees: resolveHeading(heading.trueHeading, heading.magHeading),
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
