import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Package } from "@/types";
import { useColors } from "@/hooks/useColors";

interface PackageCardProps {
  pkg: Package;
  selected: boolean;
  onPress: () => void;
  operatorColor: string;
}

function formatPrice(price: number): string {
  return price.toLocaleString("fr-CI") + " FCFA";
}

export default function PackageCard({ pkg, selected, onPress, operatorColor }: PackageCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: 1.5,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        <View style={[styles.dataBadge, { backgroundColor: selected ? "rgba(255,255,255,0.2)" : operatorColor + "18" }]}>
          <Feather name="wifi" size={16} color={selected ? "#FFF" : operatorColor} />
        </View>
        <View>
          <Text style={[styles.data, { color: selected ? "#FFF" : colors.foreground }]}>{pkg.data}</Text>
          <Text style={[styles.validity, { color: selected ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>
            {pkg.validity}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.price, { color: selected ? "#FFF" : colors.primary }]}>{formatPrice(pkg.price)}</Text>
        {selected && (
          <View style={styles.checkCircle}>
            <Feather name="check" size={12} color={colors.primary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  dataBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  data: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  validity: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
    gap: 4,
  },
  price: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
