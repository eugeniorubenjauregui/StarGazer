import { StyleSheet, Text, View } from 'react-native';

export default function MoonScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fase lunar (próximamente)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1026',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
  },
});
