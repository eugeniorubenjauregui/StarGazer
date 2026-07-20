import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { filterTargets, type SearchTarget, type TargetType } from '@/src/services/search/searchTargets';
import { useColors } from '@/src/theme/colors';

const TYPE_ICONS: Record<TargetType, keyof typeof Ionicons.glyphMap> = {
  planet: 'planet-outline',
  star: 'star-outline',
  constellation: 'git-network-outline',
};

export interface SearchModalProps {
  visible: boolean;
  targets: SearchTarget[];
  onSelect: (target: SearchTarget) => void;
  onClose: () => void;
}

export function SearchModal({ visible, targets, onSelect, onClose }: SearchModalProps) {
  const palette = useColors();
  const [query, setQuery] = useState('');
  const results = useMemo(() => filterTargets(targets, query), [targets, query]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: palette.surface, borderColor: palette.surfaceBorder }]}>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={palette.textSecondary} />
            <TextInput
              style={[styles.input, { color: palette.textPrimary }]}
              placeholder="Buscar planeta, estrella o constelación..."
              placeholderTextColor={palette.textSecondary}
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCorrect={false}
            />
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={palette.textSecondary} />
            </Pressable>
          </View>
          <FlatList
            data={results}
            keyExtractor={(item) => item.key}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: palette.surfaceBorder }]}
                onPress={() => {
                  onSelect(item);
                  setQuery('');
                }}
              >
                <Ionicons name={TYPE_ICONS[item.type]} size={18} color={palette.cardinal} />
                <View style={styles.rowText}>
                  <Text style={[styles.name, { color: palette.textPrimary }]}>{item.name}</Text>
                  {item.subtitle && (
                    <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{item.subtitle}</Text>
                  )}
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: palette.textSecondary }]}>Sin resultados para “{query}”.</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: 15,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 13,
  },
});
