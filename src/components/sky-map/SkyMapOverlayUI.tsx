import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';

export interface SkyMapOverlayUIProps {
  usingCompass: boolean;
  usingTilt: boolean;
  centerAzimuth: number;
  centerAltitude: number;
}

export function SkyMapOverlayUI({
  usingCompass,
  usingTilt,
  centerAzimuth,
  centerAltitude,
}: SkyMapOverlayUIProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={styles.text}>
        {usingCompass ? 'Brújula' : 'Arrastra'} · {usingTilt ? 'Inclinación' : 'Arrastra (vertical)'} · az{' '}
        {centerAzimuth.toFixed(0)}° alt {centerAltitude.toFixed(0)}°
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  text: {
    color: colors.constellationLabel,
    fontSize: 12,
  },
});
