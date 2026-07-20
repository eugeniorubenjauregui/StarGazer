import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceBorder,
        },
        tabBarActiveTintColor: colors.cardinal,
        tabBarInactiveTintColor: colors.textSecondary,
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
    </Tabs>
  );
}
