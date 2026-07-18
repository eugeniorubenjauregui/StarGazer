import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { createObserver } from '@/src/services/astro/observer';
import { loadStars } from '@/src/services/catalog/loadStars';
import { loadConstellationInfos, resolveConstellations } from '@/src/services/catalog/loadConstellations';
import { SkyCanvas } from '@/src/components/sky-map/SkyCanvas';
import { colors } from '@/src/theme/colors';

// Dev-only default: Bogotá. Replaced by real GPS once sensor integration lands.
const DEV_OBSERVER = createObserver(4.711, -74.0721, 2640);
const FOV_DEGREES = 70;
const DRAG_SENSITIVITY = 0.25;

export default function SkyMapScreen() {
  const { width, height } = useWindowDimensions();
  const [center, setCenter] = useState({ azimuth: 180, altitude: 45 });
  const dragStart = useRef(center);

  const stars = useMemo(() => loadStars(), []);
  const constellations = useMemo(() => resolveConstellations(), []);
  const constellationNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const info of loadConstellationInfos()) names[info.id] = info.name;
    return names;
  }, []);

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

  return (
    <View style={styles.container}>
      <View {...panResponder.panHandlers}>
        <SkyCanvas
          stars={stars}
          constellations={constellations}
          constellationNames={constellationNames}
          observer={DEV_OBSERVER}
          date={new Date()}
          centerAzimuth={center.azimuth}
          centerAltitude={center.altitude}
          fovDegrees={FOV_DEGREES}
          width={width}
          height={height}
        />
      </View>
      <View style={styles.hint} pointerEvents="none">
        <Text style={styles.hintText}>
          Arrastra para mirar alrededor (az {center.azimuth.toFixed(0)}°, alt{' '}
          {center.altitude.toFixed(0)}°)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.skyBackground,
  },
  hint: {
    position: 'absolute',
    bottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  hintText: {
    color: colors.constellationLabel,
    fontSize: 12,
  },
});
