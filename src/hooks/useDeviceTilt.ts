import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { DeviceMotion } from 'expo-sensors';
import { pitchFromAcceleration } from '@/src/services/sensors/tilt';

const UPDATE_INTERVAL_MS = 100;

export interface TiltState {
  pitchDegrees: number | null;
  status: 'requesting' | 'active' | 'unavailable';
}

export function useDeviceTilt(): TiltState {
  const [state, setState] = useState<TiltState>({ pitchDegrees: null, status: 'requesting' });

  useEffect(() => {
    let cancelled = false;
    let subscription: { remove: () => void } | null = null;

    (async () => {
      // ASSUMPTION: DeviceMotion native listeners are unavailable on web.
      if (Platform.OS === 'web' || typeof DeviceMotion.addListener !== 'function') {
        setState({ pitchDegrees: null, status: 'unavailable' });
        return;
      }

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
        setState({ pitchDegrees: pitchFromAcceleration(x, y, z), status: 'active' });
      });
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return state;
}
