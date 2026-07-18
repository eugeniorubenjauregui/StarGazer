import { useMemo, useRef, useState } from 'react';
import { PanResponder, type GestureResponderHandlers } from 'react-native';

const DRAG_SENSITIVITY = 0.25;

export interface AzAlt {
  azimuth: number;
  altitude: number;
}

export interface PanFallback {
  center: AzAlt;
  setCenter: (center: AzAlt) => void;
  panHandlers: GestureResponderHandlers;
}

/**
 * Lets the user look around the sky map by dragging, for when compass/tilt
 * sensors are unavailable (iOS Simulator, denied permissions) or as the only
 * input during development.
 */
export function usePanFallback(initial: AzAlt): PanFallback {
  const [center, setCenter] = useState<AzAlt>(initial);
  const dragStart = useRef(center);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStart.current = center;
        },
        onPanResponderMove: (_event, gesture) => {
          const nextAzimuth = (dragStart.current.azimuth - gesture.dx * DRAG_SENSITIVITY + 360) % 360;
          const nextAltitude = Math.min(
            89,
            Math.max(-89, dragStart.current.altitude + gesture.dy * DRAG_SENSITIVITY)
          );
          setCenter({ azimuth: nextAzimuth, altitude: nextAltitude });
        },
      }),
    [center]
  );

  return { center, setCenter, panHandlers: panResponder.panHandlers };
}
