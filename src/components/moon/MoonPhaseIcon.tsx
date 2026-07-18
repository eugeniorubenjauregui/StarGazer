import { StyleSheet, Text } from 'react-native';
import type { MoonPhaseName } from '@/src/services/astro/moonPhase';
import { MOON_PHASE_EMOJI } from './moonPhaseDisplay';

export function MoonPhaseIcon({ phase, size = 72 }: { phase: MoonPhaseName; size?: number }) {
  return <Text style={[styles.icon, { fontSize: size }]}>{MOON_PHASE_EMOJI[phase]}</Text>;
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});
