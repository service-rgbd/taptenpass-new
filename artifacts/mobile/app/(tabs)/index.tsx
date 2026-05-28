import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
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
import { OPERATOR_COLORS } from "@/constants/packages";
import { HOME_SERVICES } from "@/constants/services";
import ServiceTile from "@/components/ServiceTile";
import SideDrawer from "@/components/SideDrawer";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function formatPrice(n: number) {
  return n.toLocaleString("fr-CI");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CI", { day: "2-digit", month: "short" });
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser } = useAuth();
  const { transactions } = useData();
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  if (!user) return null;

  const initials = user.fullname
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const recent = transactions.slice(0, 4);

  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [refreshUser]),
  );

  function handleServicePress(key: (typeof HOME_SERVICES)[number]["onPressKey"]) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (key) {
      case "offers":
        router.push("/(tabs)/buy");
        break;
      case "transfer":
        Alert.alert("Bientôt", "Transfert d'argent bientôt disponible.");
        break;
      case "payment":
        Alert.alert("Bientôt", "Les paiements programmés arrivent bientôt.");
        break;
      case "loan":
        router.push("/loan");
        break;
      case "hub":
        router.push("/services");
        break;
      case "subscriptions":
        router.push("/services");
        break;
    }
  }

  const statusColors = {
    success: colors.success,
    pending: colors.secondary,
    failed: colors.destructive,
  };

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={{ paddingTop: topPad + 10, paddingBottom: bottomPad + 6 }}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.sideIcon, { backgroundColor: colors.background }]}
            activeOpacity={0.7}
            onPress={() => setMenuOpen(true)}
          >
            <Feather name="menu" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerBrand, { color: colors.primary }]}>TAPTENPASS</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.sideIcon, { backgroundColor: colors.background }]}
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.7}
          >
            <Text style={[styles.sideInitials, { color: colors.foreground }]}>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.walletCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.walletTop}>
          <Text style={[styles.walletLabel, { color: colors.mutedForeground }]}>Solde cumule</Text>
          <TouchableOpacity
            onPress={() => setBalanceHidden((v) => !v)}
            activeOpacity={0.7}
            style={[styles.eyeBtn, { backgroundColor: colors.muted }]}
          >
            <Feather name={balanceHidden ? "eye-off" : "eye"} size={15} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <View style={styles.walletAmountRow}>
          <Text style={[styles.walletAmount, { color: colors.foreground }]}>
            {balanceHidden ? "•••••" : formatPrice(user.walletBalance)}
          </Text>
          <Text style={[styles.walletUnit, { color: colors.foreground }]}>FCFA</Text>
        </View>
        <View style={styles.walletFooter}>
          <TouchableOpacity
            style={[styles.walletAction, { borderColor: colors.primary20 }]}
            onPress={() => router.push("/recharge")}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={15} color={colors.primary} />
            <Text style={[styles.walletActionText, { color: colors.primary }]}>Recharger</Text>
          </TouchableOpacity>
          <View style={[styles.walletRightBadge, { backgroundColor: colors.muted }]}>
            <Feather name="grid" size={18} color={colors.primary} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Services</Text>
        <View style={styles.servicesGrid}>
          {HOME_SERVICES.map((service) => (
            <ServiceTile
              key={service.id}
              service={service}
              onPress={() => handleServicePress(service.onPressKey)}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.promoCard,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.shadow,
          },
        ]}
        onPress={() => router.push("/(tabs)/buy")}
        activeOpacity={0.85}
      >
        <View style={styles.promoText}>
          <Text style={styles.promoEyebrow}>Promotion</Text>
          <Text style={styles.promoTitle}>
            Passez vos achats de pass{"\n"}plus rapidement
          </Text>
          <View style={styles.promoCtaInline}>
            <Text style={styles.promoCtaInlineText}>Voir les offres</Text>
            <Feather name="arrow-right" size={13} color="#FFF" />
          </View>
        </View>
        <View style={[styles.promoBadge, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
          <Feather name="wifi" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Historique</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/history")} activeOpacity={0.7}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {recent.length === 0 ? (
          <View style={[styles.emptyRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="inbox" size={18} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Aucune activité — lancez votre premier achat
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
                  i < recent.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.txIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={styles.txEmoji}>{tx.packageName ? "📡" : "💸"}</Text>
                </View>
                <View style={styles.txMain}>
                  <Text style={[styles.txTitle, { color: colors.foreground }]}>
                    {tx.packageName || tx.operator}
                  </Text>
                  <Text style={[styles.txSub, { color: colors.mutedForeground }]}>
                    {tx.phone} · {formatDate(tx.createdAt)}
                  </Text>
                </View>
                <View style={styles.txRight}>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: tx.status === "success" ? sc : colors.foreground },
                    ]}
                  >
                    {tx.status === "success" ? "-" : "-"}
                    {formatPrice(tx.amount)} FCFA
                  </Text>
                  <Text style={[styles.txStatus, { color: sc }]}>
                    {tx.status === "success" ? "Réussi" : tx.status === "pending" ? "En cours" : "Échoué"}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
      </ScrollView>

      <SideDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        initials={initials}
        onLogout={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  headerLeft: { width: 48, alignItems: "flex-start" },
  headerRight: { width: 48, alignItems: "flex-end" },
  sideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sideInitials: { fontSize: 13, fontFamily: "Inter_700Bold" },
  headerBrand: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  walletCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  walletTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  walletLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  eyeBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  walletAmountRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 14 },
  walletAmount: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  walletUnit: { fontSize: 16, fontFamily: "Inter_700Bold" },
  walletFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  walletAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  walletActionText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  walletRightBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 14 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 18,
  },
  promoCard: {
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 16,
    marginBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 5,
  },
  promoText: { flex: 1, gap: 6 },
  promoEyebrow: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#DCE8FF", textTransform: "uppercase", letterSpacing: 0.6 },
  promoTitle: { fontSize: 16, fontFamily: "Inter_700Bold", lineHeight: 22, color: "#FFF" },
  promoCtaInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  promoCtaInlineText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#FFF" },
  promoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  txEmoji: { fontSize: 19, lineHeight: 22 },
  txMain: { flex: 1, gap: 3 },
  txTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  txSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  txRight: { alignItems: "flex-end", gap: 3 },
  txAmount: { fontSize: 13, fontFamily: "Inter_700Bold" },
  txStatus: { fontSize: 11, fontFamily: "Inter_500Medium" },
});
