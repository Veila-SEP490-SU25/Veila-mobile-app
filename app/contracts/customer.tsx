import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTokenCheck } from "../../hooks/useTokenCheck";
import { useGetCustomerContractQuery } from "../../services/apis";

export default function CustomerContractScreen() {
  const router = useRouter();
  const {
    data: contractData,
    isLoading,
    error,
  } = useGetCustomerContractQuery();

  useTokenCheck();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderMarkdownContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <Text key={index} style={styles.h1}>
            {line.replace("# ", "")}
          </Text>
        );
      } else if (line.startsWith("## ")) {
        return (
          <Text key={index} style={styles.h2}>
            {line.replace("## ", "")}
          </Text>
        );
      } else if (line.startsWith("### ")) {
        return (
          <Text key={index} style={styles.h3}>
            {line.replace("### ", "")}
          </Text>
        );
      } else if (line.startsWith("- ")) {
        return (
          <View key={index} style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{line.replace("- ", "")}</Text>
          </View>
        );
      } else if (line.trim() === "") {
        return <View key={index} style={styles.spacing} />;
      } else {
        return (
          <Text key={index} style={styles.paragraph}>
            {line}
          </Text>
        );
      }
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hợp đồng khách hàng</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E05C78" />
          <Text style={styles.loadingText}>Đang tải hợp đồng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !contractData?.item) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hợp đồng khách hàng</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Không thể tải hợp đồng</Text>
          <Text style={styles.errorMessage}>
            Vui lòng thử lại sau hoặc liên hệ hỗ trợ
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const contract = contractData.item;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hợp đồng khách hàng</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contractHeader}>
          <Text style={styles.contractTitle}>{contract.title}</Text>
          <View style={styles.contractMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#666666" />
              <Text style={styles.metaText}>
                Có hiệu lực từ: {formatDate(contract.effectiveFrom)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#10B981"
              />
              <Text style={styles.metaText}>Trạng thái: {contract.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {renderMarkdownContent(contract.content)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bằng việc sử dụng dịch vụ, bạn đồng ý với toàn bộ điều khoản trên
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  contractHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  contractTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
    textAlign: "center",
  },
  contractMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#64748B",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  h1: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
    marginTop: 24,
  },
  h2: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
    marginTop: 20,
  },
  h3: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    marginTop: 16,
  },
  paragraph: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    color: "#E05C78",
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    flex: 1,
  },
  spacing: {
    height: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    fontStyle: "italic",
  },
});
