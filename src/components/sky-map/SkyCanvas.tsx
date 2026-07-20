import { useMemo } from 'react';
import { Platform } from 'react-native';
import {
  Canvas,
  Circle,
  Line,
  Text,
  Skia,
  matchFont,
  type SkFont,
} from '@shopify/react-native-skia';
import { colors } from '@/src/theme/colors';
import { radiusForMagnitude, opacityForMagnitude } from './starVisuals';
import type { ProjectedStar, ProjectedConstellation } from '@/src/services/sky-map/projectSky';

export interface SkyCanvasProps {
  projectedStars: ProjectedStar[];
  visibleConstellations: ProjectedConstellation[];
  /** Display name shown next to each constellation, keyed by constellation id. */
  constellationNames?: Record<string, string>;
  width: number;
  height: number;
  showLabels?: boolean;
}

const LABEL_FONT_SIZE = 12;

/**
 * Resolves a label font after Skia is available.
 * ASSUMPTION: On web, matchFont/System FontMgr is unreliable; use default Skia.Font.
 */
function resolveLabelFont(): SkFont | null {
  try {
    if (Platform.OS === 'web') {
      return Skia.Font(null, LABEL_FONT_SIZE);
    }

    return matchFont({
      fontFamily: Platform.select({
        ios: 'Helvetica',
        android: 'sans-serif',
        default: 'sans-serif',
      }),
      fontSize: LABEL_FONT_SIZE,
      fontStyle: 'normal',
      fontWeight: 'normal',
    });
  } catch {
    return null;
  }
}

/** Purely presentational: draws already-projected screen-space points. See services/sky-map/projectSky for the astronomy -> screen pipeline. */
export function SkyCanvas({
  projectedStars,
  visibleConstellations,
  constellationNames = {},
  width,
  height,
  showLabels = true,
}: SkyCanvasProps) {
  const labelFont = useMemo(() => resolveLabelFont(), []);

  return (
    <Canvas style={{ width, height, backgroundColor: colors.skyBackground }}>
      {visibleConstellations.map((constellation) => (
        <ConstellationLines key={constellation.id} segments={constellation.segments} />
      ))}
      {showLabels &&
        labelFont &&
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
