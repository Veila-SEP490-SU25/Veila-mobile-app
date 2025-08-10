import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BlogList from "../../components/shopping/BlogList";
import CategoryTabs, {
  CategoryType,
} from "../../components/shopping/CategoryTabs";
import DressGrid from "../../components/shopping/DressGrid";
import ShopList from "../../components/shopping/ShopList";
import { BlogPost, Dress, Shop } from "../../services/types";

export default function Shopping() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>("DRESS");

  const handleDressPress = (dress: Dress) => {
    router.push(`/dress/${dress.id}` as any);
  };

  const handleShopPress = (shop: Shop) => {
    router.push(`/shop/${shop.id}` as any);
  };

  const handleBlogPress = (blog: BlogPost) => {
    router.push(`/blog/${blog.id}` as any);
  };

  const renderContent = () => {
    switch (selectedCategory) {
      case "DRESS":
        return <DressGrid onDressPress={handleDressPress} />;
      case "SHOP":
        return <ShopList onShopPress={handleShopPress} />;
      case "BLOG":
        return <BlogList onBlogPress={handleBlogPress} />;
      default:
        return <DressGrid onDressPress={handleDressPress} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#E05C78" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khám phá váy cưới</Text>
        <View style={{ width: 40 }} />
      </View>
      <CategoryTabs
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE4E9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E05C78",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
});
