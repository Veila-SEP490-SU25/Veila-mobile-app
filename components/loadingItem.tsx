import { View } from "react-native";

export const LoadingItem = () => {
  return (
    <View className="w-full flex-row gap-2 mb-2">
      <View className="w-12 h-12 rounded-full bg-gray-300" />
      <View className="flex-1 flex-col gap-2">
        <View className="w-full h-8 rounded-md bg-gray-300" />
        <View className="w-full h-4 rounded-md bg-gray-200" />
        <View className="w-1/2 h-4 rounded-md bg-gray-200" />
      </View>
    </View>
  );
};
