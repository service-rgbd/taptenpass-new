import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PAYMENT_METHODS } from "@/constants/packages";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import type { Transaction } from "@/types";

type Stage = "choose" | "processing" | "success" | "failed";

export default function PaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { operator, phone, data, packageName, amount, validity } = useLocalSearchParams<{
    operator: string;
    phone: string;
    data: string;
    packageName: string;
    amount: string;
    validity: string;
  }>();
  const { user, updateUser } = useAuth();
  const { addTransaction } = useData();

  const [payMethod, setPayMethod] = useState<string>("wave");
  const [stage, setStage] = useState<Stage>("choose");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;
  const amountNum = parseInt(amount ?? "0", 10);

  async function handlePay() {
    setStage("processing");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await new Promise((r) => setTimeout(r, 2500));

    const success = Math.random() > 0.1;
    const ref = "CHC" + Date.now().toString().slice(-8);

    const tx: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      userId: user?.id ?? "",
      operator: operator ?? "",
      phone: phone ?? "",
      packageName: packageName ?? "",
      data: data ?? "",
      amount: amountNum,
      paymentMethod: payMethod,
      status: success ? "success" : "failed",
      transactionReference: ref,
      createdAt: new Date().toISOString(),
    };

    await addTransaction(tx);

    if (success) {
      if (user && user.walletBalance >= amountNum) {
        await updateUser({ walletBalance: user.walletBalance - amountNum });
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStage("success");
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStage("failed");
    }
  }

  function handleDone() {
    router.replace("/(tabs)");
  }

  function handleRetry() {
    setStage("choose");
  }

  if (stage === "processing") {
    return (
      <View style={[styles.centerScreen, { backgroundColor: colors.background }]}>
        <View style={[styles.processingCard, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.processingTitle, { color: colors.foreground }]}>Traitement en cours</Text>
          <Text style={[styles.processingText, { color: colors.mutedForeground }]}>
            Veuillez patienter...
          </Text>
        </View>
      </View>
    );
  }

  if (stage === "success") {
    return (
      <View style={[styles.centerScreen, { backgroundColor: colors.background, paddingBottom: bottomPad }]}>
        <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
          <View style={[styles.resultIcon, { backgroundColor: colors.success + "18" }]}>
            <Feather name="check-circle" size={48} color={colors.success} />
          </View>
          <Text style={[styles.resultTitle, { color: colors.foreground }]}>Paiement réussi</Text>
          <Text style={[styles.resultText, { color: colors.mutedForeground }]}>
            Votre forfait {data} {operator} a été activé avec succès.
          </Text>

          <View style={[styles.summaryBox, { backgroundColor: colors.background }]}>
            {[
              { label: "Opérateur", value: operator ?? "" },
              { label: "Numéro", value: phone ?? "" },
              { label: "Forfait", value: `${data} — ${validity}` },
              { label: "Montant payé", value: `${amountNum.toLocaleString("fr-CI")} FCFA` },
            ].map((row) => (
              <View key={row.label} style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>{row.value}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={handleDone}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (stage === "failed") {
    return (
      <View style={[styles.centerScreen, { backgroundColor: colors.background, paddingBottom: bottomPad }]}>
        <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
          <View style={[styles.resultIcon, { backgroundColor: colors.destructive + "18" }]}>
            <Feather name="x-circle" size={48} color={colors.destructive} />
          </View>
          <Text style={[styles.resultTitle, { color: colors.foreground }]}>Paiement échoué</Text>
          <Text style={[styles.resultText, { color: colors.mutedForeground }]}>
            Le paiement n'a pas pu être traité. Veuillez réessayer.
          </Text>
          <View style={styles.failedBtns}>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.primary }]}
              onPress={handleRetry}
              activeOpacity={0.85}
            >
              <Feather name="refresh-cw" size={16} color="#FFF" />
              <Text style={styles.retryBtnText}>Réessayer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.homeBtn, { backgroundColor: colors.muted }]}
              onPress={handleDone}
              activeOpacity={0.8}
            >
              <Text style={[styles.homeBtnText, { color: colors.foreground }]}>Accueil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Paiement</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <Text style={[styles.heroEyebrow, { color: colors.primary }]}>Confirmation</Text>
          <Text style={[styles.heroAmount, { color: colors.foreground }]}>{amountNum.toLocaleString("fr-CI")} FCFA</Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            {data} · {validity} · {operator}
          </Text>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Numero", value: phone ?? "" },
            { label: "Forfait", value: `${data}` },
            { label: "Validite", value: validity ?? "" },
            { label: "Visa envoye", value: `${amountNum.toLocaleString("fr-CI")} FCFA` },
            { label: "Frais", value: "0 FCFA" },
            { label: "Total", value: `${amountNum.toLocaleString("fr-CI")} FCFA` },
          ].map((row, index, rows) => (
            <View
              key={row.label}
              style={[
                styles.detailRow,
                index < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Methode de paiement</Text>

        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              {
                backgroundColor: payMethod === method.id ? colors.accent : colors.card,
                borderColor: payMethod === method.id ? colors.primary : colors.border,
                borderWidth: payMethod === method.id ? 2 : 1,
              },
            ]}
            onPress={() => {
              setPayMethod(method.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.methodIcon, { backgroundColor: payMethod === method.id ? colors.primary + "18" : colors.muted }]}>
              <Feather name={method.icon as never} size={18} color={payMethod === method.id ? colors.primary : colors.mutedForeground} />
            </View>
            <Text style={[styles.methodLabel, { color: colors.foreground }]}>{method.label}</Text>
            <View
              style={[
                styles.radio,
                {
                  borderColor: payMethod === method.id ? colors.primary : colors.border,
                  backgroundColor: payMethod === method.id ? colors.primary : "transparent",
                },
              ]}
            >
              {payMethod === method.id && <Feather name="check" size={10} color="#FFF" />}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.payNowBtn, { backgroundColor: colors.primary }]}
          onPress={handlePay}
          activeOpacity={0.85}
        >
          <Text style={styles.payNowText}>Confirmer le paiement</Text>
        </TouchableOpacity>

        <Text style={[styles.secureNote, { color: colors.mutedForeground }]}>
          Transaction 100% securisee
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centerScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 20 },
  heroCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  heroEyebrow: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  heroAmount: { fontSize: 30, fontFamily: "Inter_700Bold", marginBottom: 4 },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  detailsCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 22,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    shadowColor: "#0A4FFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  summaryCardTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  summaryCardAmount: { marginBottom: 16 },
  summaryAmountLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryAmount: { color: "#FFF", fontSize: 32, fontFamily: "Inter_700Bold", marginTop: 4 },
  summaryCardRows: { gap: 8 },
  cardRow: { flexDirection: "row", justifyContent: "space-between" },
  cardRowLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_400Regular" },
  cardRowValue: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 14 },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    gap: 14,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  methodLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  payNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#0A4FFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  payNowText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  secureNote: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular" },
  processingCard: {
    width: "100%",
    alignItems: "center",
    padding: 40,
    borderRadius: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  processingTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  processingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  resultCard: {
    width: "100%",
    alignItems: "center",
    padding: 28,
    borderRadius: 24,
    gap: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  resultIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  resultTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 8 },
  resultText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 24 },
  summaryBox: {
    width: "100%",
    borderRadius: 14,
    padding: 16,
    gap: 10,
    marginBottom: 24,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  doneBtn: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
  failedBtns: { flexDirection: "row", gap: 12, width: "100%", marginTop: 8 },
  retryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retryBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
  homeBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  homeBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
