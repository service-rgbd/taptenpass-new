import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { ApiError, initiateWalletRecharge, verifyWalletRecharge } from "@/lib/api-client";
import { useColors } from "@/hooks/useColors";

const PRESETS = [5000, 10000, 20000, 50000];

function computeFee(amount: number) {
  return Math.ceil(amount * 0.01);
}

export default function RechargeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const params = useLocalSearchParams<{
    neededAmount?: string;
    returnTo?: string;
    operator?: string;
    phone?: string;
    packageId?: string;
    packageName?: string;
    data?: string;
    amount?: string;
    validity?: string;
  }>();

  const [amountText, setAmountText] = useState(params.neededAmount ?? "10000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  const amount = parseInt(amountText.replace(/\D/g, ""), 10) || 0;
  const fee = useMemo(() => computeFee(amount), [amount]);
  const total = amount + fee;
  const neededAmount = parseInt(params.neededAmount ?? "0", 10);

  async function handleRecharge() {
    if (amount < 500) {
      setError("Montant minimum : 500 FCFA.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const init = await initiateWalletRecharge(amount);

      if (init.authorizationUrl) {
        await WebBrowser.openBrowserAsync(init.authorizationUrl);
      }

      const result = await verifyWalletRecharge(init.reference);
      await refreshUser();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (params.returnTo === "buy" && params.packageId) {
        router.replace({
          pathname: "/payment",
          params: {
            operator: params.operator ?? "",
            phone: params.phone ?? "",
            packageId: params.packageId,
            packageName: params.packageName ?? "",
            data: params.data ?? "",
            amount: params.amount ?? "",
            validity: params.validity ?? "",
            paymentSource: "wallet",
          },
        });
        return;
      }

      router.replace({
        pathname: "/(tabs)",
        params: {
          recharged: String(result.amountFcfa),
        },
      });
    } catch (err) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err instanceof ApiError ? err.message : "Recharge impossible.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Recharger le solde</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomPad + 24 }}>
        <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>Solde actuel</Text>
          <Text style={[styles.balanceValue, { color: colors.foreground }]}>
            {user.walletBalance.toLocaleString("fr-CI")} FCFA
          </Text>
          {neededAmount > 0 && user.walletBalance < neededAmount ? (
            <Text style={[styles.balanceHint, { color: colors.primary }]}>
              Rechargez au moins {(neededAmount - user.walletBalance).toLocaleString("fr-CI")} FCFA pour continuer l'achat.
            </Text>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Montant à créditer</Text>
        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            value={amountText}
            onChangeText={(value) => setAmountText(value.replace(/\D/g, ""))}
            keyboardType="number-pad"
            placeholder="10000"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
          />
          <Text style={[styles.inputSuffix, { color: colors.mutedForeground }]}>FCFA</Text>
        </View>

        <View style={styles.presets}>
          {PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetBtn,
                {
                  backgroundColor: amount === preset ? colors.primary20 : colors.card,
                  borderColor: amount === preset ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setAmountText(String(preset))}
              activeOpacity={0.8}
            >
              <Text style={[styles.presetText, { color: amount === preset ? colors.primary : colors.foreground }]}>
                {preset.toLocaleString("fr-CI")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Montant crédité", value: `${amount.toLocaleString("fr-CI")} FCFA` },
            { label: "Frais (1 %)", value: `${fee.toLocaleString("fr-CI")} FCFA` },
            { label: "Total Paystack", value: `${total.toLocaleString("fr-CI")} FCFA` },
          ].map((row, index, rows) => (
            <View
              key={row.label}
              style={[
                styles.summaryRow,
                index < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.paystackNote, { backgroundColor: colors.primary20 }]}>
          <Feather name="credit-card" size={18} color={colors.primary} />
          <Text style={[styles.paystackText, { color: colors.foreground }]}>
            Paiement sécurisé via Paystack (Mobile Money, carte bancaire).
          </Text>
        </View>

        {error ? <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: loading || amount < 500 ? colors.muted : colors.primary }]}
          onPress={handleRecharge}
          disabled={loading || amount < 500}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>Payer {total.toLocaleString("fr-CI")} FCFA</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  balanceCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
  },
  balanceLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  balanceValue: { fontSize: 28, fontFamily: "Inter_700Bold" },
  balanceHint: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 8, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 22, fontFamily: "Inter_700Bold" },
  inputSuffix: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  presetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  presetText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  summaryCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 13, fontFamily: "Inter_700Bold" },
  paystackNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  paystackText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  errorText: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 12 },
  submitBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
});
