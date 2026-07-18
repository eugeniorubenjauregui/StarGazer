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
      <MoonPhaseIcon phase={phase.name} />
      <Text style={styles.phaseName}>{MOON_PHASE_LABELS[phase.name]}</Text>
      <Text style={styles.illumination}>{Math.round(phase.illumination * 100)}% iluminada</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximas fases</Text>
        <MoonCalendarList quarters={upcomingQuarters} />
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
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  phaseName: {
    color: colors.star,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  illumination: {
    color: colors.constellationLabel,
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    width: '100%',
    marginTop: 40,
  },
  sectionTitle: {
    color: colors.star,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
});
