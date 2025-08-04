import AsyncStorage from "@react-native-async-storage/async-storage";
import assets from "assets";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { isAccessTokenValid } from "utils";

export default function SplashIntroVideo() {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navigated, setNavigated] = useState(false);

  const navigate = useCallback(async () => {
    if (navigated) return;
    setNavigated(true);

    try {
      const hasSeenIntro = await AsyncStorage.getItem("hasSeenIntro");

      if (!hasSeenIntro) {
        router.replace("/_onboarding/onboarding");
        return;
      }

      const isValid = await isAccessTokenValid();

      if (isValid) {
        router.replace("/_tab/home");
      } else {
        router.replace("/_auth/login");
      }
    } catch (err) {
      console.error("Error navigating from splash:", err);
      router.replace("/_auth/login");
    }
  }, [navigated]);

  useEffect(() => {
    const fallback = setTimeout(() => {
      navigate();
    }, 4000);

    return () => clearTimeout(fallback);
  }, [navigate]);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#800000" />
        </View>
      )}

      <Video
        ref={videoRef}
        source={assets.Videos.logoClip}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        onLoadStart={() => setIsLoading(true)}
        onReadyForDisplay={() => setIsLoading(false)}
        onError={navigate}
        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            navigate();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  video: { width: "100%", height: "100%" },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    zIndex: 1,
  },
});
