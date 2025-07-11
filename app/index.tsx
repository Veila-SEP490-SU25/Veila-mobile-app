import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";

import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

export default function SplashIntroVideo() {
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/(onboarding)/onboarding");
    }, 6000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require("../assets/logo.mp4")}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            router.replace("/(onboarding)/onboarding");
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
