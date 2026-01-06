import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="read"
        options={{
          title: "Read",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="nfc-search-variant"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="write"
        options={{
          title: "Write",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="nfc-variant"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="friendlist"
        options={{
          title: "Friends",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}