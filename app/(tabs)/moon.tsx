import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMoonPhase, getUpcomingMoonQuarters } from '@/src/services/astro/moonPhase';
import { getRiseSetTimes } from '@/src/services/astro/riseSet';
import { createObserver } from '@/src/services/astro/observer';
import { MoonPhaseIcon } from '@/src/components/moon/MoonPhaseIcon';
import { MoonCalendarList } from '@/src/components/moon/MoonCalendarList';
import { MOON_PHASE_LABELS } from '@/src/components/moon/moonPhaseDisplay';
import { useGeolocation } from '@/src/hooks/useGeolocation';
import { useColors } from '@/src/theme/colors';
import type { Palette } from '@/src/theme/palettes';

export default function MoonScreen() {
  const palette = useColors();
  const now = useMemo(() => new Date(), []);
  const phase = useMemo(() => getMoonPhase(now), [now]);
  const upcomingQuarters = useMemo(() => getUpcomingMoonQuarters(now, 6), [now]);
  const geolocation = useGeolocation();

  const riseSet = useMemo(() => {
    if (!geolocation.coords) return null;
    const observer = createObserver(
      geolocation.coords.latitude,
      geolocation.coords.longitude,
      geolocation.coords.altitude ?? 0
    );
    return getRiseSetTimes(observer, now);
  }, [geolocation.coords?.latitude, geolocation.coords?.longitude, geolocation.coords?.altitude, now]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.skyBackground }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.heroCard, { backgroundColor: palette.surface, borderColor: palette.surfaceBorder }]}>
        <MoonPhaseIcon phase={phase.name} size={96} />
        <Text style={[styles.phaseName, { color: palette.textPrimary }]}>{MOON_PHASE_LABELS[phase.name]}</Text>
        <View style={[styles.illuminationBadge, { backgroundColor: palette.horizonHint }]}>
          <View
            style={[
              styles.illuminationFill,
              { backgroundColor: palette.cardinal, width: `${Math.round(phase.illumination * 100)}%` },
            ]}
          />
        </View>
        <Text style={[styles.illumination, { color: palette.textSecondary }]}>
          {Math.round(phase.illumination * 100)}% iluminada
        </Text>
      </View>

      {riseSet && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Hoy en tu ubicación</Text>
          <View style={[styles.riseSetCard, { backgroundColor: palette.surface, borderColor: palette.surfaceBorder }]}>
            <RiseSetRow icon="sunny-outline" label="Sale el sol" date={riseSet.sunrise} palette={palette} />
            <RiseSetRow icon="partly-sunny-outline" label="Se pone el sol" date={riseSet.sunset} palette={palette} />
            <RiseSetRow icon="moon-outline" label="Sale la luna" date={riseSet.moonrise} palette={palette} />
            <RiseSetRow icon="cloudy-night-outline" label="Se pone la luna" date={riseSet.moonset} palette={palette} last />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Próximas fases</Text>
        <View style={[styles.calendarCard, { backgroundColor: palette.surface, borderColor: palette.surfaceBorder }]}>
          <MoonCalendarList quarters={upcomingQuarters} />
        </View>
      </View>
    </ScrollView>
  );
}

function RiseSetRow({
  icon,
  label,
  date,
  palette,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  date: Date | null;
  palette: Palette;
  last?: boolean;
}) {
  return (
    <View style={[styles.riseSetRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.horizonHint }]}>
      <Ionicons name={icon} size={18} color={palette.cardinal} />
      <Text style={[styles.riseSetLabel, { color: palette.textPrimary }]}>{label}</Text>
      <Text style={[styles.riseSetTime, { color: palette.textSecondary }]}>
        {date
          ? date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
          : '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 72,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  heroCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  phaseName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  illuminationBadge: {
    width: '70%',
    height: 6,
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  illuminationFill: {
    height: '100%',
    borderRadius: 3,
  },
  illumination: {
    fontSize: 13,
    marginTop: 8,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  riseSetCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  riseSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  riseSetLabel: {
    flex: 1,
    fontSize: 14,
  },
  riseSetTime: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  calendarCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
