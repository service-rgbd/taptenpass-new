import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { OPERATOR_COLORS } from "@/constants/packages";

// To swap in real logos, replace the value for each operator below:
// e.g. orange: require("@/assets/images/operators/orange.png")
const OPERATOR_IMAGES: Record<string, ReturnType<typeof require> | null> = {
  Orange: require("@/assets/images/operators/orange.png"),
  MTN: require("@/assets/images/operators/mtn.png"),
  Moov: require("@/assets/images/operators/moov.png"),
};

interface OperatorLogoProps {
  operator: string;
  size?: number;
  radius?: number;
}

export default function OperatorLogo({ operator, size = 48, radius }: OperatorLogoProps) {
  const color = OPERATOR_COLORS[operator] ?? "#888";
  const src = OPERATOR_IMAGES[operator];
  const r = radius ?? size / 2;

  return (
    <View
      style={[
        styles.wrapper,
        { width: size, height: size, borderRadius: r, backgroundColor: color + "20" },
      ]}
    >
      {src ? (
        <Image
          source={src}
          style={{ width: size * 0.65, height: size * 0.65, borderRadius: 4 }}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.fallback, { backgroundColor: color, borderRadius: r }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fallback: {
    width: "100%",
    height: "100%",
  },
});
