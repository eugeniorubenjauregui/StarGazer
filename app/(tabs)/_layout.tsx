import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme/colors';

export default function TabsLayout() {
  const palette = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.surfaceBorder,
        },
        tabBarActiveTintColor: palette.cardinal,
        tabBarInactiveTintColor: palette.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cielo',
          tabBarIcon: ({ color, size }) => <Ionicons name="telescope-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="moon"
        options={{
          title: 'Luna',
          tabBarIcon: ({ color, size }) => <Ionicons name="moon-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
