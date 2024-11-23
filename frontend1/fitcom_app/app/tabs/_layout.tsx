import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons"; 
import { Colors } from "@/constants/Colors"; 
import { useColorScheme } from "@/hooks/useColorScheme"; 

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />

      {/* Community Tab */}
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="users" size={24} color={color} />
          ),
        }}
      />



      {/* Fitness Tab */}
      <Tabs.Screen
        name="fitness"
        options={{
          title: "Fitness",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="heartbeat" size={24} color={color} />
          ),
        }}
      />

      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cogs" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    borderRadius: 35, 
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30, 
    elevation: 8, 
  },
});
