import { StyleSheet, Text, View } from 'react-native';
import type { UpcomingMoonQuarter } from '@/src/services/astro/moonPhase';
import { colors } from '@/src/theme/colors';
import { MOON_PHASE_EMOJI, MOON_PHASE_LABELS } from './moonPhaseDisplay';

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function MoonCalendarList({ quarters }: { quarters: UpcomingMoonQuarter[] }) {
  return (
    <View>
      {quarters.map((quarter, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.emoji}>{MOON_PHASE_EMOJI[quarter.name]}</Text>
          <Text style={styles.label}>{MOON_PHASE_LABELS[quarter.name]}</Text>
          <Text style={styles.date}>{formatDate(quarter.date)}</Text>
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
    borderBottomColor: colors.horizonHint,
  },
  emoji: {
    fontSize: 20,
    width: 32,
  },
  label: {
    flex: 1,
    color: colors.star,
    fontSize: 14,
  },
  date: {
    color: colors.constellationLabel,
    fontSize: 13,
  },
});
