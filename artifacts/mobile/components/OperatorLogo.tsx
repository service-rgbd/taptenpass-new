import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { OPERATOR_COLORS } from "@/constants/packages";

function safeRequire(loader: () => ReturnType<typeof require>): ReturnType<typeof require> | null {
  try {
    return loader();
  } catch {
    return null;
  }
}

// To swap in real logos, replace the loader for each operator below.
const OPERATOR_IMAGES: Record<string, ReturnType<typeof require> | null> = {
  Orange: null,
  MTN: safeRequire(() => require("../assets/images/operators/mtn.png")),
  Moov: safeRequire(() => require("../assets/images/operators/moov.png")),
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
          style={{ width: size * 0.78, height: size * 0.78, borderRadius: 4 }}
          resizeMode="contain"
        />
      ) : operator === "Orange" ? (
        <View style={[styles.orangeFallback, { width: size * 0.82, height: size * 0.82, borderRadius: r * 0.8 }]}>
          <Text style={styles.orangeText}>Orange</Text>
        </View>
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
  orangeFallback: {
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  orangeText: {
    color: "#FF7900",
    fontSize: 10,
    fontFamily: "System",
    fontWeight: "700",
  },
});
