import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUpcomingShowers } from '@/src/services/events/meteorShowers';
import { fetchTonightForecast, type TonightForecast } from '@/src/services/weather/cloudCover';
import { getConstellationInfo } from '@/src/services/catalog/loadConstellations';
import { useGeolocation } from '@/src/hooks/useGeolocation';
import { useColors } from '@/src/theme/colors';
import type { Palette } from '@/src/theme/palettes';

export default function EventsScreen() {
  const palette = useColors();
  const now = useMemo(() => new Date(), []);
  const showers = useMemo(() => getUpcomingShowers(now), [now]);
  const geolocation = useGeolocation();

  const [forecast, setForecast] = useState<TonightForecast | null>(null);
  useEffect(() => {
    if (!geolocation.coords) return;
    let cancelled = false;
    fetchTonightForecast(geolocation.coords.latitude, geolocation.coords.longitude).then((result) => {
      if (!cancelled) setForecast(result);
    });
    return () => {
      cancelled = true;
    };
  }, [geolocation.coords?.latitude, geolocation.coords?.longitude]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.skyBackground }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: palette.textPrimary }]}>Eventos</Text>

      {forecast && <ForecastCard forecast={forecast} palette={palette} />}

      <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Lluvias de meteoros</Text>
      {showers.map(({ shower, nextPeak, isActiveNow, daysToPeak }) => {
        const radiant = getConstellationInfo(shower.radiantConstellation);
        return (
          <View
            key={shower.id}
            style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.surfaceBorder }]}
          >
            <View style={styles.cardTop}>
              <Text style={[styles.showerName, { color: palette.textPrimary }]}>{shower.name}</Text>
              {isActiveNow && (
                <View style={[styles.activeBadge, { backgroundColor: palette.success }]}>
                  <Text style={[styles.activeBadgeText, { color: palette.skyBackground }]}>Activa ahora</Text>
                </View>
              )}
            </View>
            <Text style={[styles.showerDetail, { color: palette.textSecondary }]}>
              Pico: {nextPeak.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
              {daysToPeak === 0 ? ' (¡hoy!)' : ` (en ${daysToPeak} días)`} · hasta {shower.zhr} meteoros/hora
            </Text>
            {radiant && (
              <Text style={[styles.showerDetail, { color: palette.textSecondary }]}>
                Radiante en {radiant.name}
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const FORECAST_META: Record<TonightForecast['rating'], { icon: keyof typeof Ionicons.glyphMap; text: string }> = {
  despejado: { icon: 'moon', text: 'Cielo despejado — buena noche para observar' },
  parcial: { icon: 'cloudy-night', text: 'Parcialmente nublado — observación intermitente' },
  nublado: { icon: 'cloud', text: 'Nublado — mala noche para observar' },
};

function ForecastCard({ forecast, palette }: { forecast: TonightForecast; palette: Palette }) {
  const meta = FORECAST_META[forecast.rating];
  return (
    <View style={[styles.card, styles.forecastCard, { backgroundColor: palette.surface, borderColor: palette.surfaceBorder }]}>
      <Ionicons name={meta.icon} size={28} color={palette.cardinal} />
      <View style={styles.forecastText}>
        <Text style={[styles.showerName, { color: palette.textPrimary }]}>Esta noche</Text>
        <Text style={[styles.showerDetail, { color: palette.textSecondary }]}>
          {meta.text} ({Math.round(forecast.averageCloudCover)}% de nubes)
        </Text>
      </View>
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
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  forecastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  forecastText: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  showerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  showerDetail: {
    fontSize: 13,
    marginTop: 3,
  },
  activeBadge: {
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
