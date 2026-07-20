import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getConstellationInfo } from '@/src/services/catalog/loadConstellations';
import { getStarById } from '@/src/services/catalog/loadStars';
import { colors } from '@/src/theme/colors';

export default function ConstellationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const info = useMemo(() => (id ? getConstellationInfo(id) : undefined), [id]);

  if (!info) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ title: 'Constelación', ...headerStyle }} />
        <Text style={styles.mythology}>No encontramos información para esta constelación.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: info.name, ...headerStyle }} />
      <Text style={styles.name}>{info.name}</Text>
      <Text style={styles.latinName}>{info.latinName}</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="book-outline" size={16} color={colors.cardinal} />
          <Text style={styles.cardTitle}>Mitología</Text>
        </View>
        <Text style={styles.mythology}>{info.mythology}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="star-outline" size={16} color={colors.cardinal} />
          <Text style={styles.cardTitle}>Estrellas principales</Text>
        </View>
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
      </View>
    </ScrollView>
  );
}

const headerStyle = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.textPrimary,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.skyBackground,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    padding: 20,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  latinName: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  mythology: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 23,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.horizonHint,
  },
  starName: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  starMagnitude: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
