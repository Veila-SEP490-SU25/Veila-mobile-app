import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#E05C78",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          height: 90,
          borderTopWidth: 0,
          paddingBottom: 24,
          paddingTop: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 12,
        },
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "shopping":
              iconName = focused ? "pricetags" : "pricetags-outline";
              break;
            case "chat":
              iconName = focused ? "chatbox" : "chatbox-outline";
              break;
            case "notifications":
              iconName = focused ? "notifications" : "notifications-outline";
              break;
            case "account":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="shopping" options={{ title: "Khám phá" }} />
      <Tabs.Screen name="chat" options={{ title: "Tin nhắn" }} />
      <Tabs.Screen name="notifications" options={{ title: "Thông báo" }} />
      <Tabs.Screen name="account" options={{ title: "Tài khoản" }} />
    </Tabs>
  );
}
