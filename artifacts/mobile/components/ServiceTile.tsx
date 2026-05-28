import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { HomeService } from "@/constants/services";

interface ServiceTileProps {
  service: HomeService;
  onPress: () => void;
}

export default function ServiceTile({ service, onPress }: ServiceTileProps) {
  const colors = useColors();

  return (
    <TouchableOpacity style={styles.cell} onPress={onPress} activeOpacity={0.82}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Image source={service.icon} style={styles.icon} contentFit="contain" />
      </View>
      <Text style={[styles.label, { color: colors.foreground }]} numberOfLines={1}>
        {service.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: "25%",
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  icon: {
    width: 46,
    height: 46,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    maxWidth: 74,
  },
});
