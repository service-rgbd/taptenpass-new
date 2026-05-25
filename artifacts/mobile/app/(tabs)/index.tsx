import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
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
import WalletCard from "@/components/WalletCard";
import TransactionItem from "@/components/TransactionItem";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const QUICK_ACTIONS = [
  { id: "internet", label: "Forfait internet", icon: "wifi" as const, primary: true },
  { id: "credit", label: "Crédit téléphonique", icon: "phone" as const, primary: false },
  { id: "bill", label: "Payer facture", icon: "file-text" as const, primary: false },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { transactions } = useData();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const recent = transactions.slice(0, 5);

  function handleQuickAction(id: string) {
    if (id === "internet") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push("/(tabs)/buy");
    } else {
      Alert.alert("Bientôt disponible", "Cette fonctionnalité sera disponible prochainement.");
    }
  }

  if (!user) return null;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 20, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Bonjour,</Text>
          <Text style={[styles.username, { color: colors.foreground }]}>
            {user.fullname.split(" ")[0]}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <Feather name="bell" size={18} color={colors.foreground} />
          <View style={[styles.notifDot, { backgroundColor: colors.secondary }]} />
        </TouchableOpacity>
      </View>

      <WalletCard
        balance={user.walletBalance}
        phone={user.phone}
        name={user.fullname}
        onTopUp={() => Alert.alert("Recharge", "Fonctionnalité bientôt disponible.")}
      />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionCard,
                {
                  backgroundColor: action.primary ? colors.primary : colors.card,
                  borderColor: action.primary ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleQuickAction(action.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: action.primary
                      ? "rgba(255,255,255,0.2)"
                      : colors.accent,
                  },
                ]}
              >
                <Feather
                  name={action.icon}
                  size={20}
                  color={action.primary ? "#FFF" : colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.actionLabel,
                  { color: action.primary ? "#FFF" : colors.foreground },
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.historySection]}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Transactions récentes
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {recent.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Aucune transaction
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Votre historique apparaîtra ici
            </Text>
          </View>
        ) : (
          recent.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  username: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 2 },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  section: { paddingHorizontal: 20, marginTop: 28 },
  historySection: { marginTop: 8 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 16 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  actionsGrid: { flexDirection: "row", gap: 12 },
  actionCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  emptyTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
