import { useMemo } from 'react';
import { Platform } from 'react-native';
import { Canvas, Circle, Line, Text, matchFont, type SkFont } from '@shopify/react-native-skia';
import type { Observer } from 'astronomy-engine';
import { equatorialToHorizontal, altAzToVector, projectGnomonic } from '@/src/services/astro/coordinates';
import type { Star } from '@/src/services/catalog/types';
import type { ResolvedConstellation } from '@/src/services/catalog/loadConstellations';
import { colors } from '@/src/theme/colors';
import { radiusForMagnitude, opacityForMagnitude } from './starVisuals';

export interface SkyCanvasProps {
  stars: Star[];
  constellations: ResolvedConstellation[];
  /** Display name shown next to each constellation, keyed by constellation id. */
  constellationNames?: Record<string, string>;
  observer: Observer;
  date: Date;
  /** Direction the viewer is facing, in degrees. Azimuth: 0=N, 90=E. */
  centerAzimuth: number;
  centerAltitude: number;
  fovDegrees: number;
  width: number;
  height: number;
  showLabels?: boolean;
}

const labelFont = matchFont({
  fontFamily: Platform.select({ ios: 'Helvetica', android: 'sans-serif', default: 'sans-serif' }),
  fontSize: 12,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

export function SkyCanvas({
  stars,
  constellations,
  constellationNames = {},
  observer,
  date,
  centerAzimuth,
  centerAltitude,
  fovDegrees,
  width,
  height,
  showLabels = true,
}: SkyCanvasProps) {
  // Slow tier: RA/Dec -> Az/Alt -> unit vector only changes with position/time, not every frame.
  const starVectors = useMemo(() => {
    const map = new Map<string, ReturnType<typeof altAzToVector>>();
    for (const star of stars) {
      const horizontal = equatorialToHorizontal(star.ra, star.dec, observer, date);
      map.set(star.id, altAzToVector(horizontal.azimuth, horizontal.altitude));
    }
    return map;
  }, [stars, observer, date]);

  // Fast tier: projecting onto the screen from the current view direction is cheap trig,
  // safe to redo whenever the view center changes (every sensor frame, once wired up in a later phase).
  const fovRadians = (fovDegrees * Math.PI) / 180;
  const viewCenter = altAzToVector(centerAzimuth, centerAltitude);

  const projectedStars = useMemo(() => {
    return stars
      .map((star) => {
        const vector = starVectors.get(star.id);
        if (!vector) return null;
        const point = projectGnomonic(vector, viewCenter, fovRadians, width, height);
        if (!point) return null;
        return { star, point };
      })
      .filter((entry): entry is { star: Star; point: { x: number; y: number } } => entry !== null);
  }, [stars, starVectors, viewCenter, fovRadians, width, height]);

  const projectedPointById = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const { star, point } of projectedStars) map.set(star.id, point);
    return map;
  }, [projectedStars]);

  const visibleConstellations = useMemo(() => {
    return constellations
      .map((constellation) => {
        const segments = constellation.segments
          .map(({ a, b }) => {
            const pointA = projectedPointById.get(a.id);
            const pointB = projectedPointById.get(b.id);
            return pointA && pointB ? { pointA, pointB } : null;
          })
          .filter((segment): segment is { pointA: { x: number; y: number }; pointB: { x: number; y: number } } => segment !== null);
        return { id: constellation.id, segments };
      })
      .filter((constellation) => constellation.segments.length > 0);
  }, [constellations, projectedPointById]);

  return (
    <Canvas style={{ width, height, backgroundColor: colors.skyBackground }}>
      {visibleConstellations.map((constellation) => (
        <ConstellationLines key={constellation.id} segments={constellation.segments} />
      ))}
      {showLabels &&
        visibleConstellations.map((constellation) => (
          <ConstellationLabel
            key={`label-${constellation.id}`}
            label={constellationNames[constellation.id] ?? constellation.id}
            segments={constellation.segments}
            font={labelFont}
          />
        ))}
      {projectedStars.map(({ star, point }) => (
        <Circle
          key={star.id}
          cx={point.x}
          cy={point.y}
          r={radiusForMagnitude(star.magnitude)}
          color={colors.star}
          opacity={opacityForMagnitude(star.magnitude)}
        />
      ))}
    </Canvas>
  );
}

function ConstellationLines({
  segments,
}: {
  segments: { pointA: { x: number; y: number }; pointB: { x: number; y: number } }[];
}) {
  return (
    <>
      {segments.map((segment, index) => (
        <Line
          key={index}
          p1={segment.pointA}
          p2={segment.pointB}
          color={colors.constellationLine}
          strokeWidth={1}
          opacity={0.6}
        />
      ))}
    </>
  );
}

function ConstellationLabel({
  label,
  segments,
  font,
}: {
  label: string;
  segments: { pointA: { x: number; y: number }; pointB: { x: number; y: number } }[];
  font: SkFont;
}) {
  const centroid = segments.reduce(
    (acc, { pointA }) => ({ x: acc.x + pointA.x, y: acc.y + pointA.y }),
    { x: 0, y: 0 }
  );
  const x = centroid.x / segments.length;
  const y = centroid.y / segments.length;

  return <Text x={x} y={y} text={label} font={font} color={colors.constellationLabel} />;
}
