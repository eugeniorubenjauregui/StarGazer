import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getMoonPhase, getUpcomingMoonQuarters } from '@/src/services/astro/moonPhase';
import { MoonPhaseIcon } from '@/src/components/moon/MoonPhaseIcon';
import { MoonCalendarList } from '@/src/components/moon/MoonCalendarList';
import { MOON_PHASE_LABELS } from '@/src/components/moon/moonPhaseDisplay';
import { colors } from '@/src/theme/colors';

export default function MoonScreen() {
  const now = useMemo(() => new Date(), []);
  const phase = useMemo(() => getMoonPhase(now), [now]);
  const upcomingQuarters = useMemo(() => getUpcomingMoonQuarters(now, 6), [now]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <MoonPhaseIcon phase={phase.name} size={96} />
        <Text style={styles.phaseName}>{MOON_PHASE_LABELS[phase.name]}</Text>
        <View style={styles.illuminationBadge}>
          <View style={[styles.illuminationFill, { width: `${Math.round(phase.illumination * 100)}%` }]} />
        </View>
        <Text style={styles.illumination}>{Math.round(phase.illumination * 100)}% iluminada</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximas fases</Text>
        <View style={styles.calendarCard}>
          <MoonCalendarList quarters={upcomingQuarters} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.skyBackground,
  },
  content: {
    paddingTop: 72,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  phaseName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  illuminationBadge: {
    width: '70%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.horizonHint,
    marginTop: 16,
    overflow: 'hidden',
  },
  illuminationFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.cardinal,
  },
  illumination: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  calendarCard: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
