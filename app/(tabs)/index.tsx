import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { loadStars } from '@/src/services/catalog/loadStars';
import { loadConstellations, loadConstellationInfos } from '@/src/services/catalog/loadConstellations';
import { getPlanetPositions } from '@/src/services/astro/planets';
import {
  equatorialToHorizontal,
  altAzToVector,
  projectGnomonic,
  screenDirection,
} from '@/src/services/astro/coordinates';
import {
  computeSkyGeometry,
  projectGeometry,
  type ProjectedConstellation,
} from '@/src/services/sky-map/projectSky';
import { findConstellationAtPoint } from '@/src/services/sky-map/hitTest';
import { buildSearchTargets, type SearchTarget } from '@/src/services/search/searchTargets';
import { SkyCanvas } from '@/src/components/sky-map/SkyCanvas';
import { SkyMapOverlayUI } from '@/src/components/sky-map/SkyMapOverlayUI';
import { PermissionGate } from '@/src/components/sky-map/PermissionGate';
import { SearchModal } from '@/src/components/sky-map/SearchModal';
import { TargetGuide } from '@/src/components/sky-map/TargetGuide';
import { TimeTravelBar } from '@/src/components/sky-map/TimeTravelBar';
import { useSkyView } from '@/src/hooks/useSkyView';
import { usePreferencesStore } from '@/src/store/usePreferencesStore';
import { useColors } from '@/src/theme/colors';

const FOV_DEGREES = 70;
const TAP_HIT_RADIUS_PX = 28;

export default function SkyMapScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const palette = useColors();

  const [arEnabled, setArEnabled] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [searchOpen, setSearchOpen] = useState(false);
  const [target, setTarget] = useState<SearchTarget | null>(null);
  const [timeTravelOpen, setTimeTravelOpen] = useState(false);
  const [dateOffsetMs, setDateOffsetMs] = useState(0);
  const nightMode = usePreferencesStore((state) => state.nightMode);
  const toggleNightMode = usePreferencesStore((state) => state.toggleNightMode);

  const stars = useMemo(() => loadStars(), []);
  const constellations = useMemo(() => loadConstellations(), []);
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

  const view = useSkyView(handleTap, dateOffsetMs);

  const planets = useMemo(() => {
    if (!view.observer) return [];
    return getPlanetPositions(view.observer, view.date);
  }, [view.observer, view.date]);

  // Slow tier: one astronomy-engine call per object, only when position/time change.
  const geometry = useMemo(() => {
    if (!view.observer) return null;
    return computeSkyGeometry(stars, constellations, planets, view.observer, view.date);
  }, [stars, constellations, planets, view.observer, view.date]);

  // Fast tier: cheap dot products on every sensor/drag update.
  const sky = useMemo(() => {
    if (!geometry) return null;
    return projectGeometry(geometry, view.centerAzimuth, view.centerAltitude, FOV_DEGREES, width, height);
  }, [geometry, view.centerAzimuth, view.centerAltitude, width, height]);

  visibleConstellationsRef.current = sky?.visibleConstellations ?? [];

  const searchTargets = useMemo(() => {
    if (!view.observer) return [];
    return buildSearchTargets(view.observer, view.date);
  }, [view.observer, view.date]);

  // Keep a selected planet's coordinates fresh as the date ticks forward.
  const liveTarget = useMemo(() => {
    if (!target) return null;
    return searchTargets.find((t) => t.key === target.key) ?? target;
  }, [target, searchTargets]);

  const targetGuide = useMemo(() => {
    if (!liveTarget || !view.observer) return null;
    const horizontal = equatorialToHorizontal(liveTarget.ra, liveTarget.dec, view.observer, view.date);
    const targetVector = altAzToVector(horizontal.azimuth, horizontal.altitude);
    const viewCenter = altAzToVector(view.centerAzimuth, view.centerAltitude);
    const fovRadians = (FOV_DEGREES * Math.PI) / 180;
    return {
      point: projectGnomonic(targetVector, viewCenter, fovRadians, width, height),
      direction: screenDirection(targetVector, viewCenter),
    };
  }, [liveTarget, view.observer, view.date, view.centerAzimuth, view.centerAltitude, width, height]);

  const handleToggleAr = useCallback(async () => {
    if (arEnabled) {
      setArEnabled(false);
      return;
    }
    if (!cameraPermission?.granted) {
      const response = await requestCameraPermission();
      if (!response.granted) return;
    }
    setArEnabled(true);
  }, [arEnabled, cameraPermission?.granted, requestCameraPermission]);

  if (!view.observer || !sky) {
    return (
      <PermissionGate
        status={view.geolocationStatus}
        errorMessage={view.geolocationError}
        onRetry={view.retryGeolocation}
      />
    );
  }

  const arActive = arEnabled && (cameraPermission?.granted ?? false);

  return (
    <View style={[styles.container, { backgroundColor: palette.skyBackground }]}>
      {arActive && <CameraView style={StyleSheet.absoluteFill} facing="back" />}
      <View {...view.panHandlers}>
        <SkyCanvas
          projectedStars={sky.projectedStars}
          visibleConstellations={sky.visibleConstellations}
          projectedPlanets={sky.projectedPlanets}
          cardinalMarkers={sky.cardinalMarkers}
          constellationNames={constellationNames}
          highlightPoint={targetGuide?.point ?? null}
          width={width}
          height={height}
          transparent={arActive}
        />
      </View>
      <SkyMapOverlayUI
        usingCompass={view.usingCompass}
        usingTilt={view.usingTilt}
        centerAzimuth={view.centerAzimuth}
        centerAltitude={view.centerAltitude}
        arEnabled={arActive}
        arAvailable
        onToggleAr={handleToggleAr}
        nightMode={nightMode}
        onToggleNightMode={toggleNightMode}
        onOpenSearch={() => setSearchOpen(true)}
        timeTravelActive={timeTravelOpen || dateOffsetMs !== 0}
        onToggleTimeTravel={() => {
          if (timeTravelOpen) setDateOffsetMs(0);
          setTimeTravelOpen((open) => !open);
        }}
      />
      {liveTarget && targetGuide && (
        <TargetGuide
          name={liveTarget.name}
          screenPoint={targetGuide.point}
          direction={targetGuide.direction}
          width={width}
          height={height}
          onDismiss={() => setTarget(null)}
        />
      )}
      {timeTravelOpen && (
        <TimeTravelBar offsetMs={dateOffsetMs} simulatedDate={view.date} onChangeOffset={setDateOffsetMs} />
      )}
      <SearchModal
        visible={searchOpen}
        targets={searchTargets}
        onSelect={(selected) => {
          setTarget(selected);
          setSearchOpen(false);
        }}
        onClose={() => setSearchOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
