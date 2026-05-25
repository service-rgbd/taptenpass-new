import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface OperatorCardProps {
  name: string;
  color: string;
  selected: boolean;
  onPress: () => void;
}

export default function OperatorCard({ name, color, selected, onPress }: OperatorCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: selected ? color + "18" : colors.card,
          borderColor: selected ? color : colors.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.logoCircle, { backgroundColor: color + "20" }]}>
        <Text style={[styles.logoText, { color }]}>{name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <Text style={[styles.name, { color: colors.foreground }]}>{name}</Text>
      {selected && (
        <View style={[styles.check, { backgroundColor: color }]}>
          <Feather name="check" size={12} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 10,
    position: "relative",
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  name: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  check: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
