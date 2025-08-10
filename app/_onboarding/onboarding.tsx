import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { slides } from "../../constants/slide";

const { width, height } = Dimensions.get("window");

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentStep(index);
  };

  const handleDone = async () => {
    await AsyncStorage.setItem("hasSeenIntro", "true");
    router.replace("/_auth/login");
  };

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={slides}
        keyExtractor={(slide) => slide.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <ImageBackground
            source={item.image}
            resizeMode="cover"
            style={{ width, height }}
            className="justify-end"
          >
            <View className="absolute bottom-44 px-6 w-full">
              <Text className="text-white text-2xl font-bold text-center mb-3">
                {item.title}
              </Text>
              <Text className="text-white text-base text-center opacity-90">
                {item.description}
              </Text>
            </View>
          </ImageBackground>
        )}
      />

      {/* Indicator */}
      <View className="absolute bottom-36 gap-2 w-full flex-row justify-center items-center">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`w-2.5 h-2.5 rounded-full ${
              currentStep === index ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </View>

      {/* Button */}
      {currentStep >= slides.length - 1 && (
        <TouchableOpacity
          onPress={handleDone}
          className="absolute bottom-20 self-center bg-white px-6 py-3 rounded-full"
        >
          <Text className="text-black font-bold">Bắt đầu ngay</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
