import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../src/theme';

// Colored icon wrapper
function TabIcon({ name, color, focused, bgColor }: { name: any; color: string; focused: boolean; bgColor: string }) {
  return (
    <View style={[styles.iconWrap, focused && { backgroundColor: bgColor }]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTitleStyle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.tabBg,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Translate',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="language" color={focused ? colors.primary : colors.tabInactive} focused={focused} bgColor={colors.primaryLight} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="camera" color={focused ? '#8B5CF6' : colors.tabInactive} focused={focused} bgColor="#EDE9FE" />
          ),
          tabBarActiveTintColor: '#8B5CF6',
        }}
      />
      <Tabs.Screen
        name="paste"
        options={{
          title: 'Paste',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="clipboard" color={focused ? '#F59E0B' : colors.tabInactive} focused={focused} bgColor="#FEF3C7" />
          ),
          tabBarActiveTintColor: '#F59E0B',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="time" color={focused ? '#10B981' : colors.tabInactive} focused={focused} bgColor="#D1FAE5" />
          ),
          tabBarActiveTintColor: '#10B981',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
