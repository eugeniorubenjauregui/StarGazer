import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';

export interface SkyMapOverlayUIProps {
  usingCompass: boolean;
  usingTilt: boolean;
  centerAzimuth: number;
  centerAltitude: number;
  arEnabled: boolean;
  arAvailable: boolean;
  onToggleAr: () => void;
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
}: SkyMapOverlayUIProps) {
  return (
    <>
      <View style={styles.topBar} pointerEvents="box-none">
        <View style={styles.headingChip}>
          <Ionicons name="compass-outline" size={16} color={colors.cardinal} />
          <Text style={styles.headingText}>
            {cardinalFromAzimuth(centerAzimuth)} {centerAzimuth.toFixed(0)}°
          </Text>
          <Text style={styles.altText}>alt {centerAltitude.toFixed(0)}°</Text>
        </View>
        {arAvailable && (
          <Pressable
            style={[styles.arButton, arEnabled && styles.arButtonActive]}
            onPress={onToggleAr}
            accessibilityLabel={arEnabled ? 'Desactivar cámara' : 'Activar cámara'}
          >
            <Ionicons name={arEnabled ? 'camera' : 'camera-outline'} size={18} color={arEnabled ? colors.skyBackground : colors.textPrimary} />
            <Text style={[styles.arButtonText, arEnabled && styles.arButtonTextActive]}>AR</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.bottomBar} pointerEvents="none">
        <View style={styles.sensorChip}>
          <View style={[styles.dot, { backgroundColor: usingCompass ? colors.success : colors.textSecondary }]} />
          <Text style={styles.sensorText}>{usingCompass ? 'Brújula activa' : 'Arrastra para girar'}</Text>
          <View style={styles.separator} />
          <View style={[styles.dot, { backgroundColor: usingTilt ? colors.success : colors.textSecondary }]} />
          <Text style={styles.sensorText}>{usingTilt ? 'Inclinación activa' : 'Arrastra vertical'}</Text>
        </View>
      </View>
    </>
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
    backgroundColor: 'rgba(13, 19, 48, 0.85)',
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  headingText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  altText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  arButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(13, 19, 48, 0.85)',
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  arButtonActive: {
    backgroundColor: colors.cardinal,
    borderColor: colors.cardinal,
  },
  arButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  arButtonTextActive: {
    color: colors.skyBackground,
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
    backgroundColor: 'rgba(13, 19, 48, 0.85)',
    borderColor: colors.surfaceBorder,
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
    color: colors.textSecondary,
    fontSize: 11,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: 4,
  },
});
