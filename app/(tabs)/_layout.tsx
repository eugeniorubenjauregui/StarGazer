import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Cielo' }} />
      <Tabs.Screen name="moon" options={{ title: 'Luna' }} />
    </Tabs>
  );
}
