import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';

export interface PermissionGateProps {
  status: 'requesting' | 'granted' | 'denied' | 'error';
  errorMessage: string | null;
  onRetry: () => void;
}

/**
 * Full-screen state shown while we don't yet have a GPS fix. We never fall
 * back to a guessed location — an unverified position would silently skew
 * every star's calculated altitude/azimuth.
 */
export function PermissionGate({ status, errorMessage, onRetry }: PermissionGateProps) {
  const message = statusMessage(status, errorMessage);
  const canRetry = status === 'denied' || status === 'error';

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      {canRetry && (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      )}
    </View>
  );
}

function statusMessage(
  status: PermissionGateProps['status'],
  errorMessage: string | null
): string {
  switch (status) {
    case 'requesting':
      return 'Buscando tu ubicación...';
    case 'denied':
      return 'Necesitamos tu ubicación para calcular qué estrellas son visibles desde donde estás.';
    case 'error':
      return `No pudimos obtener tu ubicación${errorMessage ? `: ${errorMessage}` : '.'}`;
    case 'granted':
      return 'Obteniendo tu posición...';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.skyBackground,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    color: colors.constellationLabel,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.constellationLine,
  },
  buttonText: {
    color: colors.star,
    fontSize: 14,
  },
});
