import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export interface GeolocationState {
  coords: Location.LocationObjectCoords | null;
  status: 'requesting' | 'granted' | 'denied' | 'error';
  errorMessage: string | null;
  /** Re-requests permission and restarts watching position; use after a denial or error. */
  retry: () => void;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<Omit<GeolocationState, 'retry'>>({
    coords: null,
    status: 'requesting',
    errorMessage: null,
  });
  const [retryToken, setRetryToken] = useState(0);
  const retry = useCallback(() => setRetryToken((token) => token + 1), []);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    setState((prev) => ({ ...prev, status: 'requesting', errorMessage: null }));

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (status !== 'granted') {
        setState({ coords: null, status: 'denied', errorMessage: null });
        return;
      }

      try {
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 50 },
          (location) => {
            if (cancelled) return;
            setState({ coords: location.coords, status: 'granted', errorMessage: null });
          }
        );
      } catch (error) {
        if (cancelled) return;
        setState({ coords: null, status: 'error', errorMessage: (error as Error).message });
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [retryToken]);

  return { ...state, retry };
}
