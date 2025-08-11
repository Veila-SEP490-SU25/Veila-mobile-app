import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type CategoryType = "DRESS" | "SHOP" | "CUSTOM" | "BLOG";

interface CategoryTab {
  id: CategoryType;
  label: string;
  icon: string;
}

interface CategoryTabsProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

const categories: CategoryTab[] = [
  {
    id: "DRESS",
    label: "Váy cưới",
    icon: "👗",
  },
  {
    id: "SHOP",
    label: "Shop",
    icon: "🏪",
  },
  {
    id: "CUSTOM",
    label: "Đặt may",
    icon: "✂️",
  },
  {
    id: "BLOG",
    label: "Blog",
    icon: "📝",
  },
];

export default function CategoryTabs({
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onSelectCategory(category.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>
                {category.icon}
              </Text>
              <Text
                style={[styles.tabLabel, isActive && styles.activeTabLabel]}
              >
                {category.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 80,
    justifyContent: "center",
    position: "relative",
  },
  activeTab: {
    backgroundColor: "#E05C78",
    shadowOpacity: 0.18,
    transform: [{ scale: 1.02 }],
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  activeTabIcon: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
    textAlign: "center",
  },
  activeTabLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -2,
    left: "50%",
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
