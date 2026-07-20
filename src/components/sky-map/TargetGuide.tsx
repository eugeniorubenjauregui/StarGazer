import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme/colors';

export interface TargetGuideProps {
  name: string;
  /** Where the target sits on screen, when visible. */
  screenPoint: { x: number; y: number } | null;
  /** Unit screen-space direction toward the target when off-screen (+x right, +y down). */
  direction: { dx: number; dy: number } | null;
  width: number;
  height: number;
  onDismiss: () => void;
}

const EDGE_MARGIN = 90;

/**
 * Guides the user toward a searched object: a name chip when it's on screen,
 * or an arrow at the screen edge pointing the way to turn when it's not.
 */
export function TargetGuide({ name, screenPoint, direction, width, height, onDismiss }: TargetGuideProps) {
  const palette = useColors();

  const onScreen =
    screenPoint !== null &&
    screenPoint.x >= 0 &&
    screenPoint.x <= width &&
    screenPoint.y >= 0 &&
    screenPoint.y <= height;

  let arrow: { x: number; y: number; angleDeg: number } | null = null;
  if (!onScreen && direction) {
    const radiusX = width / 2 - EDGE_MARGIN;
    const radiusY = height / 2 - EDGE_MARGIN;
    arrow = {
      x: width / 2 + direction.dx * radiusX,
      y: height / 2 + direction.dy * radiusY,
      angleDeg: (Math.atan2(direction.dy, direction.dx) * 180) / Math.PI,
    };
  }

  return (
    <>
      {arrow && (
        <View style={[styles.arrowContainer, { left: arrow.x - 22, top: arrow.y - 22 }]} pointerEvents="none">
          <View
            style={[
              styles.arrowCircle,
              { backgroundColor: palette.accent, transform: [{ rotate: `${arrow.angleDeg}deg` }] },
            ]}
          >
            <Ionicons name="arrow-forward" size={22} color={palette.skyBackground} />
          </View>
        </View>
      )}
      <View style={styles.chipContainer} pointerEvents="box-none">
        <View style={[styles.chip, { backgroundColor: palette.surface, borderColor: palette.accent }]}>
          <Ionicons name="locate-outline" size={15} color={palette.accent} />
          <Text style={[styles.chipText, { color: palette.textPrimary }]}>
            {onScreen ? name : `Gira hacia ${name}`}
          </Text>
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close-circle" size={17} color={palette.textSecondary} />
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  arrowContainer: {
    position: 'absolute',
  },
  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipContainer: {
    position: 'absolute',
    top: 104,
    width: '100%',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
