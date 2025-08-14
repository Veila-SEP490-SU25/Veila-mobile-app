import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

interface LoadingItemProps {
  variant?: "default" | "card" | "list" | "avatar";
  height?: number;
  width?: string | number;
}

export const LoadingItem = ({
  variant = "default",
  height = 60,
  width = "100%",
}: LoadingItemProps) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderDefaultSkeleton = () => (
    <View className="w-full flex-row gap-3 mb-3">
      <Animated.View
        className="w-12 h-12 rounded-full bg-gray-200"
        style={{ opacity: shimmerOpacity }}
      />
      <View className="flex-1 flex-col gap-2">
        <Animated.View
          className="w-3/4 h-4 rounded-md bg-gray-200"
          style={{ opacity: shimmerOpacity }}
        />
        <Animated.View
          className="w-full h-3 rounded-md bg-gray-100"
          style={{ opacity: shimmerOpacity }}
        />
        <Animated.View
          className="w-1/2 h-3 rounded-md bg-gray-100"
          style={{ opacity: shimmerOpacity }}
        />
      </View>
    </View>
  );

  const renderCardSkeleton = () => (
    <View className="w-full bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <Animated.View
        className="w-full h-32 rounded-lg bg-gray-200 mb-3"
        style={{ opacity: shimmerOpacity }}
      />
      <Animated.View
        className="w-3/4 h-5 rounded-md bg-gray-200 mb-2"
        style={{ opacity: shimmerOpacity }}
      />
      <Animated.View
        className="w-full h-3 rounded-md bg-gray-100 mb-2"
        style={{ opacity: shimmerOpacity }}
      />
      <View className="flex-row justify-between items-center">
        <Animated.View
          className="w-20 h-6 rounded-md bg-gray-200"
          style={{ opacity: shimmerOpacity }}
        />
        <Animated.View
          className="w-16 h-6 rounded-md bg-gray-100"
          style={{ opacity: shimmerOpacity }}
        />
      </View>
    </View>
  );

  const renderListSkeleton = () => (
    <View className="w-full flex-row items-center gap-3 p-3 border-b border-gray-100">
      <Animated.View
        className="w-16 h-16 rounded-lg bg-gray-200"
        style={{ opacity: shimmerOpacity }}
      />
      <View className="flex-1">
        <Animated.View
          className="w-2/3 h-4 rounded-md bg-gray-200 mb-2"
          style={{ opacity: shimmerOpacity }}
        />
        <Animated.View
          className="w-full h-3 rounded-md bg-gray-100 mb-1"
          style={{ opacity: shimmerOpacity }}
        />
        <Animated.View
          className="w-1/2 h-3 rounded-md bg-gray-100"
          style={{ opacity: shimmerOpacity }}
        />
      </View>
      <Animated.View
        className="w-6 h-6 rounded-full bg-gray-200"
        style={{ opacity: shimmerOpacity }}
      />
    </View>
  );

  const renderAvatarSkeleton = () => (
    <View className="items-center">
      <Animated.View
        className="w-20 h-20 rounded-full bg-gray-200 mb-2"
        style={{ opacity: shimmerOpacity }}
      />
      <Animated.View
        className="w-24 h-4 rounded-md bg-gray-200 mb-1"
        style={{ opacity: shimmerOpacity }}
      />
      <Animated.View
        className="w-20 h-3 rounded-md bg-gray-100"
        style={{ opacity: shimmerOpacity }}
      />
    </View>
  );

  switch (variant) {
    case "card":
      return renderCardSkeleton();
    case "list":
      return renderListSkeleton();
    case "avatar":
      return renderAvatarSkeleton();
    default:
      return renderDefaultSkeleton();
  }
};

// Skeleton loading for different content types
export const LoadingGrid = ({ count = 6 }: { count?: number }) => (
  <View className="flex-row flex-wrap justify-between">
    {Array.from({ length: count }).map((_, index) => (
      <View key={index} className="w-[48%] mb-4">
        <LoadingItem variant="card" />
      </View>
    ))}
  </View>
);

export const LoadingList = ({ count = 5 }: { count?: number }) => (
  <View>
    {Array.from({ length: count }).map((_, index) => (
      <LoadingItem key={index} variant="list" />
    ))}
  </View>
);

export const LoadingAvatar = ({ count = 4 }: { count?: number }) => (
  <View className="flex-row justify-around">
    {Array.from({ length: count }).map((_, index) => (
      <LoadingItem key={index} variant="avatar" />
    ))}
  </View>
);
