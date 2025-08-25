import AsyncStorage from "@react-native-async-storage/async-storage";
import assets from "assets";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { isAccessTokenValid } from "utils";

export default function SplashIntroVideo() {
  const videoRef = useRef<VideoView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navigated, setNavigated] = useState(false);

  const player = useVideoPlayer(assets.Videos.logoClip, (player) => {
    player.loop = false;
    player.play();
  });

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
    } catch {
      router.replace("/_auth/login");
    }
  }, [navigated]);

  // Listen for video events
  useEffect(() => {
    const playToEndSubscription = player.addListener("playToEnd", () => {
      navigate();
    });

    const statusChangeSubscription = player.addListener(
      "statusChange",
      (status) => {
        if (status.status === "readyToPlay" && isLoading) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      playToEndSubscription?.remove();
      statusChangeSubscription?.remove();
    };
  }, [player, navigate, isLoading]);

  useEffect(() => {
    const fallback = setTimeout(() => {
      navigate();
    }, 3000);

    return () => clearTimeout(fallback);
  }, [navigate]);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#800000" />
        </View>
      )}

      <VideoView
        ref={videoRef}
        style={styles.video}
        player={player}
        contentFit="cover"
        allowsFullscreen={false}
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
