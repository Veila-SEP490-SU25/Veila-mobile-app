import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type CategoryType = "DRESS" | "SHOP" | "BLOG";

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
    label: "Cửa hàng",
    icon: "🏪",
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tab,
              selectedCategory === category.id && styles.activeTab,
            ]}
            onPress={() => onSelectCategory(category.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                selectedCategory === category.id && styles.activeTabLabel,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginRight: 16,
    borderRadius: 24,
    backgroundColor: "#F8F9FA",
    minWidth: 100,
    shadowColor: "#E05C78",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: "#E05C78",
    shadowOpacity: 0.18,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  activeTabLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
