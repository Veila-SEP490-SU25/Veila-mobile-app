import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type CategoryType = "DRESS" | "RENTAL_DRESS" | "ACCESSORY" | "BLOG";

interface CategoryTab {
  id: CategoryType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

interface CategoryTabsProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

const categories: CategoryTab[] = [
  {
    id: "DRESS",
    label: "Váy cưới",
    icon: "shirt-outline",
    description: "Mua sở hữu",
  },
  {
    id: "RENTAL_DRESS",
    label: "Váy thuê",
    icon: "repeat-outline",
    description: "Thuê theo ngày",
  },
  {
    id: "ACCESSORY",
    label: "Phụ kiện",
    icon: "diamond-outline",
    description: "Phụ kiện cưới",
  },
  {
    id: "BLOG",
    label: "Blog",
    icon: "newspaper-outline",
    description: "Bài viết",
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
              <View style={styles.tabContent}>
                <Ionicons
                  name={category.icon}
                  size={20}
                  color={isActive ? "#FFFFFF" : "#666666"}
                  style={styles.tabIcon}
                />
                <Text
                  style={[styles.tabLabel, isActive && styles.activeTabLabel]}
                >
                  {category.label}
                </Text>
                <Text
                  style={[
                    styles.tabDescription,
                    isActive && styles.activeTabDescription,
                  ]}
                >
                  {category.description}
                </Text>
              </View>
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
  tabContent: {
    alignItems: "center",
  },
  tabIcon: {
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
  tabDescription: {
    fontSize: 10,
    color: "#999999",
    textAlign: "center",
    marginTop: 4,
  },
  activeTabDescription: {
    color: "#FFFFFF",
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
