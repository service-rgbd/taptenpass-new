import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { ApiError, fetchLoanStatus, requestDataLoan } from "@/lib/api-client";
import { useColors } from "@/hooks/useColors";

export default function LoanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loan, setLoan] = useState<Awaited<ReturnType<typeof fetchLoanStatus>> | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  useEffect(() => {
    loadLoan();
  }, []);

  const totalRecharged = loan?.totalRechargedFcfa ?? user?.totalRechargedFcfa ?? 0;
  const minRecharge = loan?.minRechargeFcfa ?? user?.loanMinRechargeFcfa ?? 10_000;
  const activeLoanGb = loan?.activeLoanGb ?? user?.activeLoanGb ?? 0;
  const eligible = loan?.eligible ?? user?.loanEligible ?? totalRecharged >= minRecharge;
  const remainingToEligible = loan?.remainingToEligible ?? Math.max(0, minRecharge - totalRecharged);

  async function loadLoan() {
    setLoading(true);
    try {
      const status = await fetchLoanStatus();
      setLoan(status);
      await refreshUser();
    } catch {
      setLoan(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestLoan() {
    if (!eligible) {
      router.push({
        pathname: "/recharge",
        params: { neededAmount: String(remainingToEligible || 10_000) },
      });
      return;
    }

    if (activeLoanGb > 0) {
      Alert.alert("Prêt actif", "Vous avez déjà un prêt en cours. Rechargez pour le rembourser.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestDataLoan();
      await refreshUser();
      await loadLoan();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Prêt activé", result.message);
    } catch (error) {
      Alert.alert(
        "Prêt indisponible",
        error instanceof ApiError ? error.message : "Impossible d'activer le prêt.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Prêt de données</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomPad + 24 }}>
          <View style={[styles.hero, { backgroundColor: colors.primary }]}>
            <Text style={styles.heroEyebrow}>TapTenPass Prêt</Text>
            <Text style={styles.heroTitle}>1 Go remboursable</Text>
            <Text style={styles.heroDesc}>
              Empruntez 1 Go lorsque votre connexion est épuisée. Remboursez en rechargeant votre solde.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Votre éligibilité</Text>
            {[
              {
                label: "Total rechargé",
                value: `${totalRecharged.toLocaleString("fr-CI")} FCFA`,
              },
              {
                label: "Minimum requis",
                value: `${minRecharge.toLocaleString("fr-CI")} FCFA`,
              },
              {
                label: "Prêt actif",
                value: activeLoanGb > 0 ? "1 Go en cours" : "Aucun",
              },
            ].map((row) => (
              <View key={row.label} style={styles.row}>
                <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text style={[styles.rowValue, { color: colors.foreground }]}>{row.value}</Text>
              </View>
            ))}
          </View>

          {!eligible ? (
            <View style={[styles.warning, { backgroundColor: colors.secondary + "18" }]}>
              <Feather name="info" size={18} color={colors.secondary} />
              <Text style={[styles.warningText, { color: colors.foreground }]}>
                Rechargez encore {remainingToEligible.toLocaleString("fr-CI")} FCFA pour débloquer le prêt.
              </Text>
            </View>
          ) : null}

          {activeLoanGb > 0 ? (
            <View style={[styles.warning, { backgroundColor: colors.primary20 }]}>
              <Feather name="clock" size={18} color={colors.primary} />
              <Text style={[styles.warningText, { color: colors.foreground }]}>
                Prêt en cours. Rechargez votre solde pour rembourser automatiquement.
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: eligible && activeLoanGb === 0 ? colors.primary : colors.muted,
              },
            ]}
            onPress={handleRequestLoan}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.actionText}>
                {eligible
                  ? activeLoanGb > 0
                    ? "Recharger pour rembourser"
                    : "Activer 1 Go"
                  : "Recharger pour débloquer"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  hero: { borderRadius: 20, padding: 20, marginBottom: 18 },
  heroEyebrow: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  heroTitle: { color: "#FFF", fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 8 },
  heroDesc: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  rowLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  rowValue: { fontSize: 13, fontFamily: "Inter_700Bold" },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  warningText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  actionBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
});
