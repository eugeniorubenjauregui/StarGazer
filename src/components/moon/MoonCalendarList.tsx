import { StyleSheet, Text, View } from 'react-native';
import type { UpcomingMoonQuarter } from '@/src/services/astro/moonPhase';
import { useColors } from '@/src/theme/colors';
import { MOON_PHASE_EMOJI, MOON_PHASE_LABELS } from './moonPhaseDisplay';

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function MoonCalendarList({ quarters }: { quarters: UpcomingMoonQuarter[] }) {
  const palette = useColors();
  return (
    <View>
      {quarters.map((quarter, index) => (
        <View key={index} style={[styles.row, { borderBottomColor: palette.horizonHint }]}>
          <Text style={styles.emoji}>{MOON_PHASE_EMOJI[quarter.name]}</Text>
          <Text style={[styles.label, { color: palette.textPrimary }]}>{MOON_PHASE_LABELS[quarter.name]}</Text>
          <Text style={[styles.date, { color: palette.textSecondary }]}>{formatDate(quarter.date)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emoji: {
    fontSize: 20,
    width: 32,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  date: {
    fontSize: 13,
  },
});
