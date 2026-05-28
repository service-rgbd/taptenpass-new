import { Feather } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import {
  detectOperator,
  formatPhoneInput,
  normalizePhone,
  OPERATOR_PREFIXES,
  phoneError,
  phoneHint,
  validatePhoneForOperator,
  type OperatorName,
} from "@/constants/phone";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import type { Package } from "@/types";

export default function BuyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [operator, setOperator] = useState<OperatorName | "">("");
  const [phone, setPhone] = useState(user?.phone ? formatPhoneInput(user.phone) : "");
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [contactsVisible, setContactsVisible] = useState(false);
  const [contacts, setContacts] = useState<Array<{ id: string; name: string; phone: string }>>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const availablePackages = PACKAGES.filter((p) => p.operator === operator);
  const opColor = operator ? OPERATOR_COLORS[operator] : colors.primary;
  const phoneValid = operator ? validatePhoneForOperator(phone, operator) : false;
  const phoneDigits = normalizePhone(phone);
  const selectedIndex = selectedPkg ? availablePackages.findIndex((pkg) => pkg.id === selectedPkg.id) : -1;

  function handleSelectOperator(op: OperatorName) {
    setOperator(op);
    setSelectedPkg(null);
    if (phoneDigits.length >= 2) {
      const prefix = phoneDigits.slice(0, 2);
      if (prefix !== OPERATOR_PREFIXES[op]) {
        setPhone("");
      }
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handlePhoneChange(value: string) {
    const formatted = formatPhoneInput(value);
    setPhone(formatted);
    const detected = detectOperator(formatted);
    if (detected && detected !== operator) {
      setOperator(detected);
      setSelectedPkg(null);
    }
  }

  function goToStep2() {
    if (!operator) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
  }

  function goToStep3() {
    if (!phoneValid || !operator) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(3);
  }

  function handleSelectPackage(pkg: Package) {
    setSelectedPkg(pkg);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handlePay() {
    if (!selectedPkg || !operator) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/payment",
      params: {
        operator,
        phone: normalizePhone(phone),
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        data: selectedPkg.data,
        amount: selectedPkg.price.toString(),
        validity: selectedPkg.validity,
      },
    });
  }

  async function importContacts() {
    setLoadingContacts(true);
    try {
      const permission = await Contacts.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission refusee", "Autorisez l'acces aux contacts pour importer un numero.");
        return;
      }

      const result = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
        pageSize: 20,
      });

      const entries =
        result.data
          ?.map((contact) => {
            const rawPhone = contact.phoneNumbers?.[0]?.number ?? "";
            const normalized = normalizePhone(rawPhone);
            if (!normalized) return null;
            return {
              id: contact.id,
              name: contact.name || "Sans nom",
              phone: formatPhoneInput(normalized),
            };
          })
          .filter((item): item is { id: string; name: string; phone: string } => Boolean(item))
          .slice(0, 12) ?? [];

      setContacts(entries);
      setContactsVisible(true);
    } finally {
      setLoadingContacts(false);
    }
  }

  function selectContact(contactPhone: string) {
    const formatted = formatPhoneInput(contactPhone);
    const detected = detectOperator(formatted);
    if (detected) {
      setOperator(detected);
    }
    setPhone(formatted);
    setSelectedPkg(null);
    setContactsVisible(false);
  }

  function resetFlow() {
    setStep(1);
    setOperator("");
    setSelectedPkg(null);
    setPhone(user?.phone ? formatPhoneInput(user.phone) : "");
  }

  const STEP_LABELS = ["Opérateur", "Numéro", "Forfait"];
  const progress = step / STEP_LABELS.length;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          {step > 1 ? (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.background }]}
              onPress={() => setStep(step - 1)}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={18} color={colors.foreground} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconBtnSpacer} />
          )}
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Acheter un forfait</Text>
            <Text style={[styles.headerStep, { color: colors.mutedForeground }]}>Choisissez un pass</Text>
          </View>
          <TouchableOpacity onPress={resetFlow} style={styles.iconBtnSpacer} activeOpacity={0.7}>
            {step > 1 && <Feather name="refresh-cw" size={16} color={colors.mutedForeground} />}
          </TouchableOpacity>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
        </View>

        <View style={styles.steps}>
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <View key={n} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor: done || active ? colors.primary : colors.card,
                    },
                  ]}
                >
                  {done ? (
                    <Feather name="check" size={10} color="#FFF" />
                  ) : (
                    <Text style={[styles.stepNum, { color: active ? "#FFF" : colors.mutedForeground }]}>{n}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: active ? colors.primary : done ? colors.foreground : colors.mutedForeground },
                  ]}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Operateur</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{operator || "A choisir"}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Numero</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{phone || "-- -- -- -- --"}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Forfait</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{selectedPkg?.data || "A choisir"}</Text>
            </View>
          </View>
        </View>

        {step === 1 && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Choisir votre operateur</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>Selectionnez un reseau avant de continuer.</Text>
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
              style={[styles.nextBtn, { backgroundColor: operator ? colors.primary : colors.muted }]}
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

        {step === 2 && operator && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Numero</Text>
            <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
              Numero {operator} — commence par {phoneHint(operator).slice(0, 2)}
            </Text>

            <View style={[styles.operatorBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.opDot, { backgroundColor: opColor }]} />
              <Text style={[styles.opBadgeText, { color: opColor }]}>{operator}</Text>
              <Text style={[styles.prefixHint, { color: colors.mutedForeground }]}>
                {phoneHint(operator)}
              </Text>
            </View>

            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: colors.card,
                  borderColor: phoneDigits.length > 1 && !phoneValid ? colors.destructive : colors.border,
                },
              ]}
            >
              <Feather name="phone" size={18} color={colors.primary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.phoneInput, { color: colors.foreground }]}
                placeholder={phoneHint(operator)}
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={14}
                autoFocus
              />
              {phoneValid && <Feather name="check-circle" size={18} color={colors.success} />}
              <TouchableOpacity onPress={importContacts} disabled={loadingContacts}>
                <Feather name="users" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {phoneDigits.length > 1 && !phoneValid && (
              <Text style={[styles.errorText, { color: colors.destructive }]}>{phoneError(operator)}</Text>
            )}

            <TouchableOpacity
              style={[styles.contactsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={importContacts}
              activeOpacity={0.75}
            >
              <View style={[styles.contactsIcon, { backgroundColor: colors.muted }]}>
                <Feather name="users" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactsTitle, { color: colors.foreground }]}>Importer depuis mes contacts</Text>
                <Text style={[styles.contactsDesc, { color: colors.mutedForeground }]}>
                  Selection rapide d'un numero depuis le mobile
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: phoneValid ? colors.primary : colors.muted }]}
              onPress={goToStep3}
              disabled={!phoneValid}
              activeOpacity={0.85}
            >
              <Text style={[styles.nextBtnText, { color: phoneValid ? "#FFF" : colors.mutedForeground }]}>
                Continuer
              </Text>
              <Feather name="arrow-right" size={18} color={phoneValid ? "#FFF" : colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && operator && (
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
              <View style={[styles.selectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.selectionTop}>
                  <Text style={[styles.selectionTitle, { color: colors.foreground }]}>Selection actuelle</Text>
                  <Text style={[styles.selectionBadge, { color: colors.primary }]}>Forfait #{selectedIndex + 1}</Text>
                </View>
                <Text style={[styles.selectionData, { color: colors.foreground }]}>{selectedPkg.data}</Text>
                <Text style={[styles.selectionMeta, { color: colors.mutedForeground }]}>
                  {selectedPkg.validity} · {selectedPkg.price.toLocaleString("fr-CI")} FCFA
                </Text>
              </View>
            )}

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

      <Modal visible={contactsVisible} transparent animationType="slide" onRequestClose={() => setContactsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.contactsSheet, { backgroundColor: colors.card }]}>
            <View style={styles.contactsHeader}>
              <Text style={[styles.contactsSheetTitle, { color: colors.foreground }]}>Mes contacts</Text>
              <TouchableOpacity onPress={() => setContactsVisible(false)} activeOpacity={0.7}>
                <Feather name="x" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {contacts.length === 0 ? (
                <Text style={[styles.contactsEmpty, { color: colors.mutedForeground }]}>
                  Aucun contact avec numero disponible.
                </Text>
              ) : (
                contacts.map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={[styles.contactRow, { borderBottomColor: colors.border }]}
                    onPress={() => selectContact(contact.phone)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.contactAvatar, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.contactAvatarText, { color: colors.foreground }]}>
                        {contact.name.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.contactName, { color: colors.foreground }]}>{contact.name}</Text>
                      <Text style={[styles.contactPhone, { color: colors.mutedForeground }]}>{contact.phone}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  headerStep: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnSpacer: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  progressTrack: { height: 6, borderRadius: 999, marginBottom: 14, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  steps: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 },
  stepItem: { alignItems: "center", gap: 4, flex: 1 },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepNum: { fontSize: 11, fontFamily: "Inter_700Bold" },
  stepLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  summaryCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center", gap: 4 },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  summaryValue: { fontSize: 13, fontFamily: "Inter_700Bold", textAlign: "center" },
  summaryDivider: { width: StyleSheet.hairlineWidth, alignSelf: "stretch" },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
  stepDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 18 },
  operatorsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
  },
  nextBtnText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  operatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  opDot: { width: 8, height: 8, borderRadius: 4 },
  opBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  prefixHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 8,
  },
  phoneInput: { flex: 1, fontSize: 16, fontFamily: "Inter_400Regular", letterSpacing: 0.5 },
  errorText: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 16 },
  contactsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  contactsIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  contactsTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  contactsDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  packagesList: { marginBottom: 8 },
  selectionCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  selectionTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  selectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  selectionBadge: { fontSize: 12, fontFamily: "Inter_700Bold" },
  selectionData: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 2 },
  selectionMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    borderRadius: 14,
    marginTop: 8,
  },
  payBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "flex-end",
  },
  contactsSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
  },
  contactsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  contactsSheetTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  contactsEmpty: { fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 24, textAlign: "center" },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contactAvatarText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  contactName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  contactPhone: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
