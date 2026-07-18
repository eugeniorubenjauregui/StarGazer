import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { getConstellationInfo } from '@/src/services/catalog/loadConstellations';
import { getStarById } from '@/src/services/catalog/loadStars';
import { colors } from '@/src/theme/colors';

export default function ConstellationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const info = useMemo(() => (id ? getConstellationInfo(id) : undefined), [id]);

  if (!info) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Constelación' }} />
        <Text style={styles.mythology}>No encontramos información para esta constelación.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: info.name }} />
      <Text style={styles.name}>{info.name}</Text>
      <Text style={styles.latinName}>{info.latinName}</Text>
      <Text style={styles.mythology}>{info.mythology}</Text>

      <Text style={styles.sectionTitle}>Estrellas principales</Text>
      {info.mainStars.map((starId) => {
        const star = getStarById(starId);
        if (!star) return null;
        return (
          <View key={starId} style={styles.starRow}>
            <Text style={styles.starName}>{star.name}</Text>
            <Text style={styles.starMagnitude}>mag {star.magnitude.toFixed(2)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.skyBackground,
  },
  content: {
    padding: 24,
  },
  name: {
    color: colors.star,
    fontSize: 24,
    fontWeight: '700',
  },
  latinName: {
    color: colors.constellationLabel,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  mythology: {
    color: colors.star,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.star,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.horizonHint,
  },
  starName: {
    color: colors.star,
    fontSize: 14,
  },
  starMagnitude: {
    color: colors.constellationLabel,
    fontSize: 13,
  },
});
