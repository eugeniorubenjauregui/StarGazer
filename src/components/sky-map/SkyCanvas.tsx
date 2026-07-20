import { useMemo } from 'react';
import { Platform } from 'react-native';
import { Canvas, Circle, Line, Points, Text, matchFont, vec, type SkFont } from '@shopify/react-native-skia';
import { useColors } from '@/src/theme/colors';
import type { Palette } from '@/src/theme/palettes';
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
  /** Screen point to highlight (search target). */
  highlightPoint?: { x: number; y: number } | null;
  width: number;
  height: number;
  showLabels?: boolean;
  /** Transparent background so the camera feed shows through in AR mode. */
  transparent?: boolean;
}

const fontFamily = Platform.select({ ios: 'Helvetica', android: 'sans-serif', default: 'sans-serif' });
const labelFont = matchFont({ fontFamily, fontSize: 12, fontStyle: 'normal', fontWeight: 'normal' });
const cardinalFont = matchFont({ fontFamily, fontSize: 16, fontStyle: 'normal', fontWeight: 'bold' });

/** Stars brighter than this render as individual circles; the rest go into batched point buckets. */
const BRIGHT_STAR_MAGNITUDE = 2.0;
/** Named stars brighter than this get a name label. */
const LABELED_STAR_MAGNITUDE = 0.8;

/** Faint-star buckets: one batched Points draw call per bucket instead of thousands of Circle nodes. */
const FAINT_BUCKETS = [
  { maxMagnitude: 3.0, size: 3.2, opacity: 0.85 },
  { maxMagnitude: 4.0, size: 2.4, opacity: 0.65 },
  { maxMagnitude: 5.0, size: 1.7, opacity: 0.45 },
  { maxMagnitude: 6.5, size: 1.2, opacity: 0.3 },
];

/** Purely presentational: draws already-projected screen-space points. See services/sky-map/projectSky for the astronomy -> screen pipeline. */
export function SkyCanvas({
  projectedStars,
  visibleConstellations,
  projectedPlanets = [],
  cardinalMarkers = [],
  constellationNames = {},
  highlightPoint = null,
  width,
  height,
  showLabels = true,
  transparent = false,
}: SkyCanvasProps) {
  const colors = useColors();
  const { brightStars, faintBuckets } = useMemo(() => {
    const bright: ProjectedStar[] = [];
    const buckets = FAINT_BUCKETS.map(() => [] as ReturnType<typeof vec>[]);
    for (const projected of projectedStars) {
      if (projected.star.magnitude < BRIGHT_STAR_MAGNITUDE) {
        bright.push(projected);
        continue;
      }
      const bucketIndex = FAINT_BUCKETS.findIndex((b) => projected.star.magnitude < b.maxMagnitude);
      buckets[bucketIndex === -1 ? FAINT_BUCKETS.length - 1 : bucketIndex].push(
        vec(projected.point.x, projected.point.y)
      );
    }
    return { brightStars: bright, faintBuckets: buckets };
  }, [projectedStars]);

  return (
    <Canvas style={{ width, height, backgroundColor: transparent ? 'transparent' : colors.skyBackground }}>
      <HorizonAndCardinals markers={cardinalMarkers} colors={colors} />
      {visibleConstellations.map((constellation) => (
        <ConstellationLines key={constellation.id} segments={constellation.segments} colors={colors} />
      ))}
      {faintBuckets.map((points, index) => (
        <Points
          key={`bucket-${index}`}
          points={points}
          mode="points"
          color={colors.star}
          strokeWidth={FAINT_BUCKETS[index].size}
          strokeCap="round"
          opacity={FAINT_BUCKETS[index].opacity}
        />
      ))}
      {brightStars.map(({ star, point }) => (
        <Circle
          key={star.id}
          cx={point.x}
          cy={point.y}
          r={radiusForMagnitude(star.magnitude)}
          color={colors.star}
          opacity={opacityForMagnitude(star.magnitude)}
        />
      ))}
      {showLabels &&
        brightStars
          .filter(({ star }) => star.name && star.magnitude < LABELED_STAR_MAGNITUDE)
          .map(({ star, point }) => (
            <Text
              key={`star-label-${star.id}`}
              x={point.x + 8}
              y={point.y - 6}
              text={star.name!}
              font={labelFont}
              color={colors.constellationLabel}
              opacity={0.8}
            />
          ))}
      {showLabels &&
        visibleConstellations.map((constellation) => (
          <ConstellationLabel
            key={`label-${constellation.id}`}
            label={constellationNames[constellation.id] ?? constellation.id}
            constellation={constellation}
            font={labelFont}
            colors={colors}
          />
        ))}
      {projectedPlanets.map(({ planet, point }) => (
        <PlanetMark key={planet.id} name={planet.name} magnitude={planet.magnitude} point={point} colors={colors} />
      ))}
      {highlightPoint && (
        <>
          <Circle cx={highlightPoint.x} cy={highlightPoint.y} r={26} color={colors.accent} style="stroke" strokeWidth={2} />
          <Circle cx={highlightPoint.x} cy={highlightPoint.y} r={32} color={colors.accent} style="stroke" strokeWidth={1} opacity={0.4} />
        </>
      )}
    </Canvas>
  );
}

function PlanetMark({
  name,
  magnitude,
  point,
  colors,
}: {
  name: string;
  magnitude: number;
  point: { x: number; y: number };
  colors: Palette;
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
function HorizonAndCardinals({ markers, colors }: { markers: CardinalMarker[]; colors: Palette }) {
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
  colors,
}: {
  segments: { pointA: { x: number; y: number }; pointB: { x: number; y: number } }[];
  colors: Palette;
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
  constellation,
  font,
  colors,
}: {
  label: string;
  constellation: ProjectedConstellation;
  font: SkFont;
  colors: Palette;
}) {
  let x: number;
  let y: number;
  if (constellation.labelPoint) {
    x = constellation.labelPoint.x;
    y = constellation.labelPoint.y;
  } else {
    const centroid = constellation.segments.reduce(
      (acc, { pointA }) => ({ x: acc.x + pointA.x, y: acc.y + pointA.y }),
      { x: 0, y: 0 }
    );
    x = centroid.x / constellation.segments.length;
    y = centroid.y / constellation.segments.length;
  }

  return <Text x={x} y={y} text={label} font={font} color={colors.constellationLabel} opacity={0.7} />;
}
