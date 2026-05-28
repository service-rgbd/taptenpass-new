import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          height: isWeb ? 86 : 78,
          paddingBottom: isWeb ? 32 : 12,
          paddingTop: 8,
          backgroundColor: colors.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: -6 },
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_500Medium",
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" size={21} color={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historique",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="bar-chart-2" size={21} color={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="buy"
        options={{
          title: "Acheter",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="grid" size={21} color={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <Feather name="credit-card" size={21} color={color} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
