import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) =>    <MaterialIcons name="explore" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="uploads"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color }) => <FontAwesome name="plus-square-o" size={24} color={color}  />,
        }}
      />
       {/* <Tabs.Screen
        name="notifications"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <Ionicons name="heart-outline" size={24} color={color} />,
        }}
      /> */}
       <Tabs.Screen
        name="profile"
        options={{
          title: 'Profiles',
          tabBarIcon: ({ color }) =><FontAwesome name="user-o" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
