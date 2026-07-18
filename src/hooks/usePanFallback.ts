import { useMemo, useRef, useState } from 'react';
import { PanResponder, type GestureResponderHandlers } from 'react-native';

const DRAG_SENSITIVITY = 0.25;
/** Releases with total movement below this (in px) are treated as a tap rather than a drag. */
const TAP_MOVEMENT_THRESHOLD_PX = 8;

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
 * input during development. A release with negligible movement is treated as
 * a tap and reported via `onTap`, so the same gesture surface can both pan
 * the view and let the user select a constellation.
 */
export function usePanFallback(initial: AzAlt, onTap?: (point: { x: number; y: number }) => void): PanFallback {
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
        onPanResponderRelease: (event, gesture) => {
          if (Math.hypot(gesture.dx, gesture.dy) < TAP_MOVEMENT_THRESHOLD_PX) {
            onTap?.({ x: event.nativeEvent.locationX, y: event.nativeEvent.locationY });
          }
        },
      }),
    [center, onTap]
  );

  return { center, setCenter, panHandlers: panResponder.panHandlers };
}
