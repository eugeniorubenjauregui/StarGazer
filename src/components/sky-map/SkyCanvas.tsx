import { Platform } from 'react-native';
import { Canvas, Circle, Line, Text, matchFont, type SkFont } from '@shopify/react-native-skia';
import { colors } from '@/src/theme/colors';
import { radiusForMagnitude, opacityForMagnitude } from './starVisuals';
import type { ProjectedStar, ProjectedConstellation, CardinalMarker } from '@/src/services/sky-map/projectSky';

export interface SkyCanvasProps {
  projectedStars: ProjectedStar[];
  visibleConstellations: ProjectedConstellation[];
  /** Compass points (N, E, S, O...) projected onto the horizon. */
  cardinalMarkers?: CardinalMarker[];
  /** Display name shown next to each constellation, keyed by constellation id. */
  constellationNames?: Record<string, string>;
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
  cardinalMarkers = [],
  constellationNames = {},
  width,
  height,
  showLabels = true,
}: SkyCanvasProps) {
  return (
    <Canvas style={{ width, height, backgroundColor: colors.skyBackground }}>
      <HorizonAndCardinals markers={cardinalMarkers} />
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
