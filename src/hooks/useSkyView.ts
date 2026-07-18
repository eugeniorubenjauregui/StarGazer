import { useEffect, useMemo, useState } from 'react';
import type { Observer } from 'astronomy-engine';
import { createObserver } from '@/src/services/astro/observer';
import { useGeolocation } from './useGeolocation';
import { useCompassHeading } from './useCompassHeading';
import { useDeviceTilt } from './useDeviceTilt';
import { usePanFallback } from './usePanFallback';

const DATE_REFRESH_INTERVAL_MS = 30_000;
const DEFAULT_CENTER = { azimuth: 180, altitude: 45 };

export interface SkyViewState {
  centerAzimuth: number;
  centerAltitude: number;
  observer: Observer | null;
  date: Date;
  usingCompass: boolean;
  usingTilt: boolean;
  geolocationStatus: 'requesting' | 'granted' | 'denied' | 'error';
  geolocationError: string | null;
  panHandlers: ReturnType<typeof usePanFallback>['panHandlers'];
}

/**
 * Combines GPS, compass and tilt into a single view direction, falling back to
 * touch-drag for whichever sensor isn't available (denied permission, no
 * hardware, or running in a simulator without motion support).
 */
export function useSkyView(onTap?: (point: { x: number; y: number }) => void): SkyViewState {
  const geolocation = useGeolocation();
  const compass = useCompassHeading();
  const tilt = useDeviceTilt();
  const pan = usePanFallback(DEFAULT_CENTER, onTap);

  const [date, setDate] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setDate(new Date()), DATE_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const observer = useMemo(() => {
    if (!geolocation.coords) return null;
    return createObserver(
      geolocation.coords.latitude,
      geolocation.coords.longitude,
      geolocation.coords.altitude ?? 0
    );
  }, [geolocation.coords?.latitude, geolocation.coords?.longitude, geolocation.coords?.altitude]);

  const usingCompass = compass.status === 'active' && compass.headingDegrees !== null;
  const usingTilt = tilt.status === 'active' && tilt.pitchDegrees !== null;

  const centerAzimuth = usingCompass ? compass.headingDegrees! : pan.center.azimuth;
  const centerAltitude = usingTilt ? tilt.pitchDegrees! : pan.center.altitude;

  return {
    centerAzimuth,
    centerAltitude,
    observer,
    date,
    usingCompass,
    usingTilt,
    geolocationStatus: geolocation.status,
    geolocationError: geolocation.errorMessage,
    panHandlers: pan.panHandlers,
  };
}
