import React from "react";
import { Tabs, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { View, StyleSheet, TouchableOpacity } from "react-native";

export default function TabLayout() {
  return (

    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1e90ff",
        tabBarInactiveTintColor: "#a9a9a9",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eaeaea",
          height: 70,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="CommunityScreen"
        options={{
          title: "Community",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="users" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="FoodScannerScreen"
        options={{
          title: "",
          tabBarIcon: () => null,
          tabBarButton: (props) => <CentralButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="FitnessScreen"
        options={{
          title: "Fitness",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="heartbeat" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SettingsScreen"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cogs" size={size || 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const CentralButton = ({ navigation }: any) => {
  const router = useRouter();
  return (
    <View style={styles.centralButtonContainer}>
      <TouchableOpacity
        style={styles.centralButton}
        onPress={() => router.push("/tabs/FoodScannerScreen")} // Use the correct path
      >
        <FontAwesome name="camera" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  centralButtonContainer: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: [{ translateX: -35 }],
    zIndex: 1,
  },
  centralButton: {
    width: 70,
    height: 70,
    backgroundColor: "#007BFF",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});