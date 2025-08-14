import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  refreshing?: boolean;
  enabled?: boolean;
  showIndicator?: boolean;
  pullDistance?: number;
  refreshThreshold?: number;
}

export default function PullToRefresh({
  children,
  onRefresh,
  refreshing = false,
  enabled = true,
  showIndicator = true,
  pullDistance = 100,
  refreshThreshold = 80,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const refreshAnim = useRef(new Animated.Value(0)).current;

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY < 0) {
          const progress = Math.min(Math.abs(offsetY) / pullDistance, 1);
          setPullProgress(progress);

          if (Math.abs(offsetY) > refreshThreshold && !isRefreshing) {
            refreshAnim.setValue(1);
          }
        }
      },
    }
  );

  useEffect(() => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsRefreshing(false);
    }
  }, [refreshing]);

  const renderRefreshIndicator = () => {
    if (!showIndicator || !enabled) return null;

    const rotateAnim = refreshAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    const scaleAnim = scrollY.interpolate({
      inputRange: [-pullDistance, 0],
      outputRange: [1.2, 0.8],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.refreshContainer}>
        <Animated.View
          style={[
            styles.refreshIcon,
            {
              transform: [{ rotate: rotateAnim }, { scale: scaleAnim }],
              opacity: pullProgress,
            },
          ]}
        >
          <Ionicons
            name={isRefreshing ? "refresh" : "arrow-down"}
            size={24}
            color={pullProgress > 0.5 ? "#E05C78" : "#9CA3AF"}
          />
        </Animated.View>

        {pullProgress > 0.3 && (
          <Animated.Text
            style={[styles.refreshText, { opacity: pullProgress }]}
          >
            {isRefreshing ? "Đang làm mới..." : "Kéo xuống để làm mới"}
          </Animated.Text>
        )}
      </View>
    );
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {renderRefreshIndicator()}

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={showIndicator ? 60 : 0}
            colors={["#E05C78"]}
            tintColor="#E05C78"
            title="Đang làm mới..."
            titleColor="#E05C78"
          />
        }
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}

// Enhanced ScrollView with pull-to-refresh
export const EnhancedScrollView = ({
  children,
  onRefresh,
  refreshing = false,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  ...props
}: any) => {
  return (
    <PullToRefresh
      onRefresh={onRefresh}
      refreshing={refreshing}
      enabled={!!onRefresh}
    >
      <ScrollView
        style={style}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        {...props}
      >
        {children}
      </ScrollView>
    </PullToRefresh>
  );
};

// Enhanced FlatList with pull-to-refresh
export const EnhancedFlatList = ({
  onRefresh,
  refreshing = false,
  refreshControl,
  ...props
}: any) => {
  const customRefreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={["#E05C78"]}
      tintColor="#E05C78"
      title="Đang làm mới..."
      titleColor="#E05C78"
    />
  ) : (
    refreshControl
  );

  return <FlatList {...props} refreshControl={customRefreshControl} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  refreshContainer: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  refreshIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
});
