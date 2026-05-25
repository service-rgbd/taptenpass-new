import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { PACKAGES, OPERATOR_COLORS } from "@/constants/packages";
import { useColors } from "@/hooks/useColors";

type Operator = "Orange" | "MTN" | "Moov";

const OPERATORS: Operator[] = ["Orange", "MTN", "Moov"];

function formatPrice(n: number) {
  return n.toLocaleString("fr-CI");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CI", { day: "2-digit", month: "short" });
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { transactions } = useData();

  const [operator, setOperator] = useState<Operator>("Orange");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  if (!user) return null;

  const firstName = user.fullname.split(" ")[0];
  const initials = user.fullname
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const opColor = OPERATOR_COLORS[operator];
  const packages = PACKAGES.filter((p) => p.operator === operator);
  const recent = transactions.slice(0, 3);

  function handleBuy(pkgId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/(tabs)/buy", params: { packageId: pkgId, operator } });
  }

  const statusColors = {
    success: colors.success,
    pending: colors.secondary,
    failed: colors.destructive,
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 24, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingHorizontal: 24 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Bonjour,</Text>
          <Text style={[styles.username, { color: colors.foreground }]}>{firstName}</Text>
        </View>
        <TouchableOpacity
          style={[styles.avatar, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Balance ── */}
      <View style={[styles.balanceBlock, { paddingHorizontal: 24 }]}>
        <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>Solde disponible</Text>
        <View style={styles.balanceRow}>
          <Text style={[styles.balanceAmount, { color: colors.foreground }]}>
            {formatPrice(user.walletBalance)}
          </Text>
          <Text style={[styles.balanceCurrency, { color: colors.mutedForeground }]}>FCFA</Text>
        </View>
        <TouchableOpacity
          style={styles.rechargeBtn}
          onPress={() => Alert.alert("Recharge", "Fonctionnalité bientôt disponible.")}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={13} color={colors.primary} />
          <Text style={[styles.rechargeBtnText, { color: colors.primary }]}>Recharger le solde</Text>
        </TouchableOpacity>
      </View>

      {/* ── Séparateur ── */}
      <View style={[styles.sep, { backgroundColor: colors.border, marginHorizontal: 24 }]} />

      {/* ── Opérateurs ── */}
      <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Opérateur</Text>
        <View style={styles.operatorsRow}>
          {OPERATORS.map((op) => {
            const active = op === operator;
            const color = OPERATOR_COLORS[op];
            return (
              <TouchableOpacity
                key={op}
                style={[
                  styles.opPill,
                  {
                    backgroundColor: active ? color + "18" : "transparent",
                    borderBottomWidth: active ? 2 : 0,
                    borderBottomColor: active ? color : "transparent",
                  },
                ]}
                onPress={() => {
                  setOperator(op);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.opDot, { backgroundColor: color }]} />
                <Text
                  style={[
                    styles.opLabel,
                    { color: active ? color : colors.mutedForeground, fontFamily: active ? "Inter_700Bold" : "Inter_400Regular" },
                  ]}
                >
                  {op}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Forfaits ── */}
      <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Forfaits internet</Text>
          <Text style={[styles.opTag, { color: opColor }]}>{operator}</Text>
        </View>

        {packages.map((pkg, i) => (
          <TouchableOpacity
            key={pkg.id}
            style={[
              styles.pkgRow,
              i < packages.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
            onPress={() => handleBuy(pkg.id)}
            activeOpacity={0.7}
          >
            <View style={styles.pkgLeft}>
              <Text style={[styles.pkgData, { color: colors.foreground }]}>{pkg.data}</Text>
              <Text style={[styles.pkgValidity, { color: colors.mutedForeground }]}>{pkg.validity}</Text>
            </View>
            <View style={styles.pkgRight}>
              <Text style={[styles.pkgPrice, { color: colors.foreground }]}>
                {formatPrice(pkg.price)}{" "}
                <Text style={[styles.pkgFcfa, { color: colors.mutedForeground }]}>FCFA</Text>
              </Text>
              <View style={[styles.buyChip, { backgroundColor: opColor + "18" }]}>
                <Text style={[styles.buyChipText, { color: opColor }]}>Acheter</Text>
                <Feather name="arrow-right" size={11} color={opColor} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Séparateur ── */}
      <View style={[styles.sep, { backgroundColor: colors.border, marginHorizontal: 24 }]} />

      {/* ── Transactions récentes ── */}
      <View style={{ paddingHorizontal: 24 }}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Récentes</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/history")} activeOpacity={0.7}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {recent.length === 0 ? (
          <View style={styles.emptyRow}>
            <Feather name="inbox" size={18} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Aucune transaction pour l'instant
            </Text>
          </View>
        ) : (
          recent.map((tx, i) => {
            const opCol = OPERATOR_COLORS[tx.operator] ?? colors.primary;
            const sc = statusColors[tx.status];
            return (
              <View
                key={tx.id}
                style={[
                  styles.txRow,
                  i < recent.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.txIcon, { backgroundColor: opCol + "14" }]}>
                  <Feather name="wifi" size={15} color={opCol} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={[styles.txTitle, { color: colors.foreground }]}>
                    {tx.operator} {tx.data}
                  </Text>
                  <Text style={[styles.txSub, { color: colors.mutedForeground }]}>
                    {tx.phone} · {formatDate(tx.createdAt)}
                  </Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txAmount, { color: colors.foreground }]}>
                    -{formatPrice(tx.amount)} FCFA
                  </Text>
                  <View style={[styles.txBadge, { backgroundColor: sc + "16" }]}>
                    <View style={[styles.txDot, { backgroundColor: sc }]} />
                    <Text style={[styles.txBadgeText, { color: sc }]}>
                      {tx.status === "success" ? "Réussi" : tx.status === "pending" ? "En cours" : "Échoué"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 2 },
  username: { fontSize: 24, fontFamily: "Inter_700Bold" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_700Bold" },

  balanceBlock: { marginBottom: 28 },
  balanceLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  balanceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 10 },
  balanceAmount: { fontSize: 38, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  balanceCurrency: { fontSize: 16, fontFamily: "Inter_500Medium" },
  rechargeBtn: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start" },
  rechargeBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  sep: { height: StyleSheet.hairlineWidth, marginBottom: 28 },

  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  opTag: { fontSize: 12, fontFamily: "Inter_700Bold" },

  operatorsRow: { flexDirection: "row", gap: 0 },
  opPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  opDot: { width: 8, height: 8, borderRadius: 4 },
  opLabel: { fontSize: 14 },

  pkgRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  pkgLeft: { gap: 3 },
  pkgData: { fontSize: 17, fontFamily: "Inter_700Bold" },
  pkgValidity: { fontSize: 12, fontFamily: "Inter_400Regular" },
  pkgRight: { alignItems: "flex-end", gap: 6 },
  pkgPrice: { fontSize: 15, fontFamily: "Inter_700Bold" },
  pkgFcfa: { fontSize: 12, fontFamily: "Inter_400Regular" },
  buyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  buyChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  emptyRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 20 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },

  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: { flex: 1, gap: 3 },
  txTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  txSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  txRight: { alignItems: "flex-end", gap: 5 },
  txAmount: { fontSize: 13, fontFamily: "Inter_700Bold" },
  txBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  txDot: { width: 5, height: 5, borderRadius: 3 },
  txBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
