import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Transaction } from "@/types";
import { OPERATOR_COLORS } from "@/constants/packages";
import { useColors } from "@/hooks/useColors";

interface TransactionItemProps {
  transaction: Transaction;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-CI", { day: "2-digit", month: "short", year: "numeric" });
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("fr-CI") + " FCFA";
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const colors = useColors();
  const opColor = OPERATOR_COLORS[transaction.operator] ?? colors.primary;

  const statusConfig = {
    success: { color: colors.success, label: "Réussi", icon: "check-circle" as const },
    pending: { color: colors.secondary, label: "En attente", icon: "clock" as const },
    failed: { color: colors.destructive, label: "Échoué", icon: "x-circle" as const },
  };
  const status = statusConfig[transaction.status];

  return (
    <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: opColor + "18" }]}>
        <Feather name="wifi" size={18} color={opColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {transaction.operator} {transaction.data}
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          {transaction.phone} · {formatDate(transaction.createdAt)}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.foreground }]}>
          -{formatAmount(transaction.amount)}
        </Text>
        <View style={[styles.badge, { backgroundColor: status.color + "18" }]}>
          <Feather name={status.icon} size={10} color={status.color} />
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  sub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
  },
  amount: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
});
