import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OperatorCard from "@/components/OperatorCard";
import PackageCard from "@/components/PackageCard";
import { OPERATOR_COLORS, PACKAGES } from "@/constants/packages";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import type { Package } from "@/types";

export default function BuyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [operator, setOperator] = useState<"Orange" | "MTN" | "Moov" | "">("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const availablePackages = PACKAGES.filter((p) => p.operator === operator);
  const opColor = operator ? OPERATOR_COLORS[operator] : colors.primary;

  function handleSelectOperator(op: "Orange" | "MTN" | "Moov") {
    setOperator(op);
    setSelectedPkg(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function goToStep2() {
    if (!operator) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
  }

  function goToStep3() {
    if (!phone.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(3);
  }

  function handleSelectPackage(pkg: Package) {
    setSelectedPkg(pkg);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handlePay() {
    if (!selectedPkg) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/payment",
      params: {
        operator,
        phone,
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        data: selectedPkg.data,
        amount: selectedPkg.price.toString(),
        validity: selectedPkg.validity,
      },
    });
  }

  function resetFlow() {
    setStep(1);
    setOperator("");
    setSelectedPkg(null);
  }

  const STEP_LABELS = ["Opérateur", "Numéro", "Forfait"];

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, paddingTop: topPad + 16, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerTop}>
          {step > 1 ? (
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: colors.muted }]}
              onPress={() => setStep(step - 1)}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={18} color={colors.foreground} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Acheter un forfait</Text>
          <TouchableOpacity onPress={resetFlow} style={{ width: 36, alignItems: "flex-end" }}>
            {step > 1 && <Feather name="refresh-cw" size={16} color={colors.mutedForeground} />}
          </TouchableOpacity>
        </View>

        <View style={styles.steps}>
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <React.Fragment key={n}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: done || active ? colors.primary : colors.muted,
                      },
                    ]}
                  >
                    {done ? (
                      <Feather name="check" size={12} color="#FFF" />
                    ) : (
                      <Text style={[styles.stepNum, { color: done || active ? "#FFF" : colors.mutedForeground }]}>
                        {n}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      { color: active ? colors.primary : done ? colors.success : colors.mutedForeground },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
                {i < 2 && (
                  <View
                    style={[
                      styles.stepLine,
                      { backgroundColor: n < step ? colors.primary : colors.border },
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              Choisir votre opérateur
            </Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Sélectionnez le réseau du destinataire
            </Text>
            <View style={styles.operatorsRow}>
              {(["Orange", "MTN", "Moov"] as const).map((op) => (
                <OperatorCard
                  key={op}
                  name={op}
                  color={OPERATOR_COLORS[op]}
                  selected={operator === op}
                  onPress={() => handleSelectOperator(op)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.nextBtn,
                {
                  backgroundColor: operator ? colors.primary : colors.muted,
                },
              ]}
              onPress={goToStep2}
              disabled={!operator}
              activeOpacity={0.85}
            >
              <Text style={[styles.nextBtnText, { color: operator ? "#FFF" : colors.mutedForeground }]}>
                Continuer
              </Text>
              <Feather name="arrow-right" size={18} color={operator ? "#FFF" : colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              Numéro destinataire
            </Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Entrez le numéro à recharger
            </Text>

            <View style={[styles.operatorBadge, { backgroundColor: opColor + "18", borderColor: opColor + "40" }]}>
              <View style={[styles.opDot, { backgroundColor: opColor }]} />
              <Text style={[styles.opBadgeText, { color: opColor }]}>{operator}</Text>
            </View>

            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="phone" size={18} color={colors.mutedForeground} style={{ marginRight: 12 }} />
              <TextInput
                style={[styles.phoneInput, { color: colors.foreground }]}
                placeholder="+225 07 XX XX XX XX"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[
                styles.nextBtn,
                { backgroundColor: phone.trim() ? colors.primary : colors.muted },
              ]}
              onPress={goToStep3}
              disabled={!phone.trim()}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.nextBtnText,
                  { color: phone.trim() ? "#FFF" : colors.mutedForeground },
                ]}
              >
                Continuer
              </Text>
              <Feather
                name="arrow-right"
                size={18}
                color={phone.trim() ? "#FFF" : colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Choisir un forfait</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              {operator} · {phone}
            </Text>

            <View style={styles.packagesList}>
              {availablePackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={selectedPkg?.id === pkg.id}
                  onPress={() => handleSelectPackage(pkg)}
                  operatorColor={opColor}
                />
              ))}
            </View>

            {selectedPkg && (
              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: colors.primary }]}
                onPress={handlePay}
                activeOpacity={0.85}
              >
                <Feather name="credit-card" size={18} color="#FFF" />
                <Text style={styles.payBtnText}>
                  Payer {selectedPkg.price.toLocaleString("fr-CI")} FCFA
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  steps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepItem: { alignItems: "center", gap: 6 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontSize: 12, fontFamily: "Inter_700Bold" },
  stepLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  stepLine: { width: 40, height: 2, borderRadius: 1, marginHorizontal: 6, marginBottom: 20 },
  content: { padding: 20 },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 6 },
  stepDesc: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 24 },
  operatorsRow: { flexDirection: "row", gap: 12, marginBottom: 32 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 16,
    shadowColor: "#0A4FFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  operatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  opDot: { width: 8, height: 8, borderRadius: 4 },
  opBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 58,
    marginBottom: 28,
  },
  phoneInput: { flex: 1, fontSize: 16, fontFamily: "Inter_400Regular" },
  packagesList: { marginBottom: 8 },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: "#0A4FFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  payBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
});
