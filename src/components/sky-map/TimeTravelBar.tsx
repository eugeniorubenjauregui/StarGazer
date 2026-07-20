import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme/colors';

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

const STEPS: { label: string; deltaMs: number }[] = [
  { label: '-1d', deltaMs: -DAY_MS },
  { label: '-1h', deltaMs: -HOUR_MS },
  { label: '+1h', deltaMs: HOUR_MS },
  { label: '+1d', deltaMs: DAY_MS },
];

export interface TimeTravelBarProps {
  offsetMs: number;
  simulatedDate: Date;
  onChangeOffset: (offsetMs: number) => void;
}

function formatSimulated(date: Date): string {
  return date.toLocaleString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Step the sky view backward/forward in time; visible only while exploring another moment. */
export function TimeTravelBar({ offsetMs, simulatedDate, onChangeOffset }: TimeTravelBarProps) {
  const palette = useColors();

  return (
    <View style={styles.container} pointerEvents="box-none">
      {offsetMs !== 0 && (
        <View style={[styles.dateChip, { backgroundColor: palette.cardinal }]}>
          <Ionicons name="time-outline" size={14} color={palette.skyBackground} />
          <Text style={[styles.dateText, { color: palette.skyBackground }]}>{formatSimulated(simulatedDate)}</Text>
        </View>
      )}
      <View style={styles.row}>
        {STEPS.slice(0, 2).map((step) => (
          <StepButton key={step.label} label={step.label} onPress={() => onChangeOffset(offsetMs + step.deltaMs)} />
        ))}
        <Pressable
          style={[styles.nowButton, { backgroundColor: offsetMs === 0 ? palette.surfaceBorder : palette.accent }]}
          onPress={() => onChangeOffset(0)}
        >
          <Text style={[styles.nowText, { color: offsetMs === 0 ? palette.textSecondary : palette.skyBackground }]}>
            Ahora
          </Text>
        </Pressable>
        {STEPS.slice(2).map((step) => (
          <StepButton key={step.label} label={step.label} onPress={() => onChangeOffset(offsetMs + step.deltaMs)} />
        ))}
      </View>
    </View>
  );
}

function StepButton({ label, onPress }: { label: string; onPress: () => void }) {
  const palette = useColors();
  return (
    <Pressable
      style={[styles.stepButton, { backgroundColor: palette.surface, borderColor: palette.surfaceBorder }]}
      onPress={onPress}
    >
      <Text style={[styles.stepText, { color: palette.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 64,
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nowButton: {
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  nowText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
