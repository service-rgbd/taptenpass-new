import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface WalletCardProps {
  balance: number;
  phone: string;
  name: string;
  onTopUp?: () => void;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("fr-CI") + " FCFA";
}

export default function WalletCard({ balance, phone, name, onTopUp }: WalletCardProps) {
  const colors = useColors();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <View style={styles.row}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Solde disponible</Text>
        <Text style={styles.balance}>{formatAmount(balance)}</Text>
        <View style={styles.phoneRow}>
          <Feather name="phone" size={12} color="rgba(255,255,255,0.7)" />
          <Text style={styles.phone}>{phone}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.topUpBtn} onPress={onTopUp} activeOpacity={0.8}>
          <Feather name="plus-circle" size={14} color={colors.primary} />
          <Text style={[styles.topUpText, { color: colors.primary }]}>Recharger</Text>
        </TouchableOpacity>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: "#0A4FFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  balanceSection: {
    marginBottom: 20,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  balance: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  phone: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topUpBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topUpText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  dots: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#FFFFFF",
  },
});
