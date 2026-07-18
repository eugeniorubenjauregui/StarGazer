import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { loadStars } from '@/src/services/catalog/loadStars';
import { loadConstellationInfos, resolveConstellations } from '@/src/services/catalog/loadConstellations';
import { projectSky, type ProjectedConstellation } from '@/src/services/sky-map/projectSky';
import { findConstellationAtPoint } from '@/src/services/sky-map/hitTest';
import { SkyCanvas } from '@/src/components/sky-map/SkyCanvas';
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
      <View style={styles.container}>
        <Text style={styles.text}>{locationStatusMessage(view.geolocationStatus, view.geolocationError)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View {...view.panHandlers}>
        <SkyCanvas
          projectedStars={sky.projectedStars}
          visibleConstellations={sky.visibleConstellations}
          constellationNames={constellationNames}
          width={width}
          height={height}
        />
      </View>
      <View style={styles.hint} pointerEvents="none">
        <Text style={styles.hintText}>
          {view.usingCompass ? 'Brújula' : 'Arrastra'} · {view.usingTilt ? 'inclinación' : 'arrastra (vertical)'} · az{' '}
          {view.centerAzimuth.toFixed(0)}° alt {view.centerAltitude.toFixed(0)}°
        </Text>
      </View>
    </View>
  );
}

function locationStatusMessage(
  status: 'requesting' | 'granted' | 'denied' | 'error',
  errorMessage: string | null
): string {
  switch (status) {
    case 'requesting':
      return 'Buscando tu ubicación...';
    case 'denied':
      return 'Necesitamos tu ubicación para calcular qué estrellas son visibles desde donde estás.';
    case 'error':
      return `No pudimos obtener tu ubicación${errorMessage ? `: ${errorMessage}` : '.'}`;
    case 'granted':
      return 'Obteniendo tu posición...';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.skyBackground,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    color: colors.constellationLabel,
    textAlign: 'center',
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
