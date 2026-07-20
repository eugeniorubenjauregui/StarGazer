import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme/colors';

export interface SkyMapOverlayUIProps {
  usingCompass: boolean;
  usingTilt: boolean;
  centerAzimuth: number;
  centerAltitude: number;
  arEnabled: boolean;
  arAvailable: boolean;
  onToggleAr: () => void;
  nightMode: boolean;
  onToggleNightMode: () => void;
  onOpenSearch: () => void;
  timeTravelActive: boolean;
  onToggleTimeTravel: () => void;
}

const CARDINAL_LABELS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

function cardinalFromAzimuth(azimuth: number): string {
  return CARDINAL_LABELS[Math.round(((azimuth % 360) + 360) % 360 / 45) % 8];
}

export function SkyMapOverlayUI({
  usingCompass,
  usingTilt,
  centerAzimuth,
  centerAltitude,
  arEnabled,
  arAvailable,
  onToggleAr,
  nightMode,
  onToggleNightMode,
  onOpenSearch,
  timeTravelActive,
  onToggleTimeTravel,
}: SkyMapOverlayUIProps) {
  const palette = useColors();
  const chipStyle = {
    backgroundColor: nightMode ? 'rgba(28, 5, 5, 0.88)' : 'rgba(13, 19, 48, 0.85)',
    borderColor: palette.surfaceBorder,
  };

  return (
    <>
      <View style={styles.topBar} pointerEvents="box-none">
        <View style={[styles.headingChip, chipStyle]}>
          <Ionicons name="compass-outline" size={16} color={palette.cardinal} />
          <Text style={[styles.headingText, { color: palette.textPrimary }]}>
            {cardinalFromAzimuth(centerAzimuth)} {centerAzimuth.toFixed(0)}°
          </Text>
          <Text style={[styles.altText, { color: palette.textSecondary }]}>alt {centerAltitude.toFixed(0)}°</Text>
        </View>
        <View style={styles.actions}>
          <IconButton icon="search" active={false} chipStyle={chipStyle} onPress={onOpenSearch} label="Buscar objeto" />
          <IconButton
            icon="time-outline"
            active={timeTravelActive}
            chipStyle={chipStyle}
            onPress={onToggleTimeTravel}
            label="Viajar en el tiempo"
          />
          <IconButton
            icon={nightMode ? 'eye' : 'eye-outline'}
            active={nightMode}
            chipStyle={chipStyle}
            onPress={onToggleNightMode}
            label="Modo visión nocturna"
          />
          {arAvailable && (
            <IconButton
              icon={arEnabled ? 'camera' : 'camera-outline'}
              active={arEnabled}
              chipStyle={chipStyle}
              onPress={onToggleAr}
              label={arEnabled ? 'Desactivar cámara' : 'Activar cámara'}
            />
          )}
        </View>
      </View>

      <View style={styles.bottomBar} pointerEvents="none">
        <View style={[styles.sensorChip, chipStyle]}>
          <View style={[styles.dot, { backgroundColor: usingCompass ? palette.success : palette.textSecondary }]} />
          <Text style={[styles.sensorText, { color: palette.textSecondary }]}>
            {usingCompass ? 'Brújula activa' : 'Arrastra para girar'}
          </Text>
          <View style={[styles.separator, { backgroundColor: palette.surfaceBorder }]} />
          <View style={[styles.dot, { backgroundColor: usingTilt ? palette.success : palette.textSecondary }]} />
          <Text style={[styles.sensorText, { color: palette.textSecondary }]}>
            {usingTilt ? 'Inclinación activa' : 'Arrastra vertical'}
          </Text>
        </View>
      </View>
    </>
  );
}

function IconButton({
  icon,
  active,
  chipStyle,
  onPress,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  chipStyle: { backgroundColor: string; borderColor: string };
  onPress: () => void;
  label: string;
}) {
  const palette = useColors();
  return (
    <Pressable
      style={[
        styles.iconButton,
        chipStyle,
        active && { backgroundColor: palette.cardinal, borderColor: palette.cardinal },
      ]}
      onPress={onPress}
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={18} color={active ? palette.skyBackground : palette.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  headingText: {
    fontSize: 14,
    fontWeight: '700',
  },
  altText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 28,
    width: '100%',
    alignItems: 'center',
  },
  sensorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sensorText: {
    fontSize: 11,
  },
  separator: {
    width: 1,
    height: 12,
    marginHorizontal: 4,
  },
});
