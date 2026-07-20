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
import type {
  ProjectedStar,
  ProjectedConstellation,
  ProjectedPlanet,
  CardinalMarker,
} from '@/src/services/sky-map/projectSky';

export interface SkyCanvasProps {
  projectedStars: ProjectedStar[];
  visibleConstellations: ProjectedConstellation[];
  /** Moon and naked-eye planets projected into the current view. */
  projectedPlanets?: ProjectedPlanet[];
  /** Compass points (N, E, S, O...) projected onto the horizon. */
  cardinalMarkers?: CardinalMarker[];
  /** Display name shown next to each constellation, keyed by constellation id. */
  constellationNames?: Record<string, string>;
  width: number;
  height: number;
  showLabels?: boolean;
  /** Transparent background so the camera feed shows through in AR mode. */
  transparent?: boolean;
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

const cardinalFont = matchFont({
  fontFamily: Platform.select({ ios: 'Helvetica', android: 'sans-serif', default: 'sans-serif' }),
  fontSize: 16,
  fontStyle: 'normal',
  fontWeight: 'bold',
});

/** Purely presentational: draws already-projected screen-space points. See services/sky-map/projectSky for the astronomy -> screen pipeline. */
export function SkyCanvas({
  projectedStars,
  visibleConstellations,
  projectedPlanets = [],
  cardinalMarkers = [],
  constellationNames = {},
  width,
  height,
  showLabels = true,
  transparent = false,
}: SkyCanvasProps) {
  const labelFont = useMemo(() => resolveLabelFont(), []);

  return (
    <Canvas style={{ width, height, backgroundColor: transparent ? 'transparent' : colors.skyBackground }}>
      <HorizonAndCardinals markers={cardinalMarkers} />
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
      {projectedPlanets.map(({ planet, point }) => (
        <PlanetMark key={planet.id} name={planet.name} magnitude={planet.magnitude} point={point} />
      ))}
    </Canvas>
  );
}

function PlanetMark({
  name,
  magnitude,
  point,
}: {
  name: string;
  magnitude: number;
  point: { x: number; y: number };
}) {
  const radius = Math.max(3, radiusForMagnitude(magnitude) + 1);
  return (
    <>
      {/* Soft halo so planets stand apart from stars at a glance */}
      <Circle cx={point.x} cy={point.y} r={radius + 4} color={colors.planet} opacity={0.2} />
      <Circle cx={point.x} cy={point.y} r={radius} color={colors.planet} />
      <Text x={point.x + radius + 6} y={point.y + 4} text={name} font={labelFont} color={colors.planet} />
    </>
  );
}

/**
 * Cardinal labels (N, E, S, O...) sit on the horizon, with a short tick above
 * each and a segmented horizon line between adjacent visible markers, so the
 * user always knows which way they're facing and where the ground is.
 */
function HorizonAndCardinals({ markers }: { markers: CardinalMarker[] }) {
  return (
    <>
      {markers.map((marker, index) => {
        const next = markers[index + 1];
        // Only join points that are true neighbours on the compass ring (45deg
        // apart); when an intermediate point is culled off-screen, a joining
        // line would cut a wrong-looking chord across the view.
        if (!next || (next.azimuth - marker.azimuth + 360) % 360 !== 45) return null;
        return (
          <Line
            key={`horizon-${marker.label}`}
            p1={marker.point}
            p2={next.point}
            color={colors.horizonHint}
            strokeWidth={1}
            opacity={0.8}
          />
        );
      })}
      {markers.map((marker) => (
        <Line
          key={`tick-${marker.label}`}
          p1={marker.point}
          p2={{ x: marker.point.x, y: marker.point.y - 8 }}
          color={colors.cardinal}
          strokeWidth={2}
        />
      ))}
      {markers.map((marker) => (
        <Text
          key={`cardinal-${marker.label}`}
          x={marker.point.x - (marker.label.length > 1 ? 10 : 5)}
          y={marker.point.y + 20}
          text={marker.label}
          font={cardinalFont}
          color={colors.cardinal}
        />
      ))}
    </>
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
