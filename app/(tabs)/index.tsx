import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { loadStars } from '@/src/services/catalog/loadStars';
import { loadConstellationInfos, resolveConstellations } from '@/src/services/catalog/loadConstellations';
import { projectSky, type ProjectedConstellation } from '@/src/services/sky-map/projectSky';
import { findConstellationAtPoint } from '@/src/services/sky-map/hitTest';
import { SkyCanvas } from '@/src/components/sky-map/SkyCanvas';
import { SkyMapOverlayUI } from '@/src/components/sky-map/SkyMapOverlayUI';
import { PermissionGate } from '@/src/components/sky-map/PermissionGate';
import { useSkyView } from '@/src/hooks/useSkyView';
import { colors } from '@/src/theme/colors';

const FOV_DEGREES = 70;
const TAP_HIT_RADIUS_PX = 28;

export default function SkyMapScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();

  const stars = useMemo(() => loadStars(), []);
  const constellations = useMemo(() => resolveConstellations(), []);
  const constellationNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const info of loadConstellationInfos()) names[info.id] = info.name;
    return names;
  }, []);

  const visibleConstellationsRef = useRef<ProjectedConstellation[]>([]);
  const handleTap = useCallback(
    (point: { x: number; y: number }) => {
      const id = findConstellationAtPoint(point, visibleConstellationsRef.current, TAP_HIT_RADIUS_PX);
      if (id) router.push(`/constellation/${id}`);
    },
    [router]
  );

  const view = useSkyView(handleTap);

  const sky = useMemo(() => {
    if (!view.observer) return null;
    return projectSky({
      stars,
      constellations,
      observer: view.observer,
      date: view.date,
      centerAzimuth: view.centerAzimuth,
      centerAltitude: view.centerAltitude,
      fovDegrees: FOV_DEGREES,
      width,
      height,
    });
  }, [stars, constellations, view.observer, view.date, view.centerAzimuth, view.centerAltitude, width, height]);

  visibleConstellationsRef.current = sky?.visibleConstellations ?? [];

  if (!view.observer || !sky) {
    return (
      <PermissionGate
        status={view.geolocationStatus}
        errorMessage={view.geolocationError}
        onRetry={view.retryGeolocation}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View {...view.panHandlers}>
        <SkyCanvas
          projectedStars={sky.projectedStars}
          visibleConstellations={sky.visibleConstellations}
          cardinalMarkers={sky.cardinalMarkers}
          constellationNames={constellationNames}
          width={width}
          height={height}
        />
      </View>
      <SkyMapOverlayUI
        usingCompass={view.usingCompass}
        usingTilt={view.usingTilt}
        centerAzimuth={view.centerAzimuth}
        centerAltitude={view.centerAltitude}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.skyBackground,
  },
});
