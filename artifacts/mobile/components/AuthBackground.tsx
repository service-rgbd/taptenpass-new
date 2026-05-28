import { Image, type ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AuthBackgroundProps {
  source: ImageSource;
}

export default function AuthBackground({ source }: AuthBackgroundProps) {
  return (
    <>
      <Image
        source={source}
        style={styles.backgroundImage}
        contentFit="cover"
        contentPosition="center"
      />
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.96)",
          "rgba(255,255,255,0.88)",
          "rgba(255,255,255,0.55)",
          "rgba(255,255,255,0.08)",
        ]}
        locations={[0, 0.18, 0.42, 0.58]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.12)", "rgba(0,0,0,0.58)"]}
        locations={[0.38, 0.68, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
