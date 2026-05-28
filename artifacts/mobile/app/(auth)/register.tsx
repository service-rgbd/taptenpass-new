import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Dimensions,
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
import { APP_NAME, APP_TAGLINE } from "@/constants/branding";
import { formatPhoneInput, normalizePhone } from "@/constants/phone";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type Method = "google" | "apple" | "phone" | null;

const PHONE_STEPS = ["Prénom", "Nom", "Téléphone", "Mot de passe"];
const registerBackground = require("../../assets/images/back-ground.jpg");
const appLogo = require("../../assets/images/icon.png");
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { phone: prefillPhone } = useLocalSearchParams<{ phone?: string }>();

  const comingFromCheck = !!prefillPhone;
  const [method, setMethod] = useState<Method>(comingFromCheck ? "phone" : null);
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(prefillPhone ? formatPhoneInput(prefillPhone) : "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const progress = method === "phone" ? step / PHONE_STEPS.length : 0;

  function selectMethod(m: Method) {
    if (m === "google") {
      Alert.alert("Google", "Inscription via Google bientôt disponible.");
      return;
    }
    if (m === "apple") {
      Alert.alert("Apple", "Inscription via Apple bientôt disponible.");
      return;
    }
    setMethod("phone");
    setStep(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function canContinue(): boolean {
    if (step === 1) return firstName.trim().length >= 2;
    if (step === 2) return lastName.trim().length >= 2;
    if (step === 3) return normalizePhone(phone).length === 10;
    if (step === 4) return password.length >= 6;
    return false;
  }

  function goNext() {
    if (!canContinue()) return;
    if (step < 4) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(step + 1);
      return;
    }
    handleRegister();
  }

  async function handleRegister() {
    setLoading(true);
    try {
      const fullname = `${firstName.trim()} ${lastName.trim()}`;
      const ok = await register(fullname, normalizePhone(phone), password);
      if (ok) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Erreur", "Inscription impossible. Ce numéro est peut-être déjà utilisé.");
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Une erreur est survenue. Veuillez réessayer.";
      Alert.alert("Erreur", message);
    } finally {
      setLoading(false);
    }
  }

  const stepTitles = [
    "Quel est votre prénom ?",
    "Quel est votre nom ?",
    "Votre numéro de téléphone",
    "Créez votre mot de passe",
  ];
  const stepDescs = [
    "Identifiez-vous pour personnaliser votre expérience.",
    "Votre nom de famille pour votre profil.",
    comingFromCheck
      ? `Numéro ${phone} confirmé pour votre compte.`
      : "Numéro ivoirien à 10 chiffres (07, 05 ou 01).",
    "Minimum 6 caractères pour sécuriser votre compte.",
  ];

  return (
    <View style={styles.root}>
      <Image
        source={registerBackground}
        style={styles.backgroundImage}
        contentFit="cover"
        contentPosition="center"
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.16)", "rgba(0,0,0,0.62)"]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topPad + 18, paddingBottom: bottomPad + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backRow}
              onPress={() => {
                if (method === "phone" && step > 1) setStep(step - 1);
                else router.back();
              }}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={16} color="#FFF" />
              <Text style={styles.backText}>{method === "phone" && step > 1 ? "Étape précédente" : "Retour"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.brand}>
            <Image source={appLogo} style={styles.logoImage} contentFit="contain" />
            <Text style={styles.brandName}>{APP_NAME}</Text>
            <Text style={styles.brandTagline}>{APP_TAGLINE}</Text>
          </View>

          {method === "phone" && (
            <View style={styles.progressWrap}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Créer un compte</Text>
                <Text style={styles.progressCount}>{step}/{PHONE_STEPS.length}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
              </View>
              <View style={styles.stepsRow}>
                {PHONE_STEPS.map((label, i) => {
                  const n = i + 1;
                  const done = n < step;
                  const active = n === step;
                  return (
                    <View key={label} style={styles.stepChip}>
                      <View
                        style={[
                          styles.stepDot,
                          { backgroundColor: done || active ? colors.primary : "rgba(255,255,255,0.2)" },
                        ]}
                      >
                        {done ? (
                          <Feather name="check" size={10} color="#FFF" />
                        ) : (
                          <Text style={[styles.stepDotText, { color: active ? "#FFF" : "rgba(255,255,255,0.7)" }]}>
                            {n}
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.stepLabel, { color: active ? "#FFF" : "rgba(255,255,255,0.68)" }]}>
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {!method && !comingFromCheck && (
            <View style={styles.heroBlock}>
              <Text style={styles.heroTitle}>Créer votre compte</Text>
              <Text style={styles.heroSub}>
                Entrez dans l’app avec le meme style simple et direct que la connexion.
              </Text>
              <View style={styles.methodsCol}>
                {[
                  { id: "phone" as Method, label: "Créer avec mon téléphone", icon: "phone" as const },
                  { id: "google" as Method, label: "Continuer avec Google", icon: "globe" as const },
                  { id: "apple" as Method, label: "Continuer avec Apple", icon: "user" as const },
                ].map((btn) => (
                  <TouchableOpacity
                    key={btn.id}
                    style={[styles.methodRow, { backgroundColor: colors.card }]}
                    onPress={() => selectMethod(btn.id)}
                    activeOpacity={0.82}
                  >
                    <Feather name={btn.icon} size={18} color={colors.primary} />
                    <Text style={[styles.methodText, { color: colors.foreground }]}>{btn.label}</Text>
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {method === "phone" && (
            <View style={styles.formBlock}>
              <Text style={styles.stepTitle}>{stepTitles[step - 1]}</Text>
              <Text style={styles.stepDesc}>{stepDescs[step - 1]}</Text>

              {step === 1 && (
                <View style={[styles.inputWrap, { backgroundColor: colors.card }]}>
                  <Feather name="user" size={18} color={colors.primary} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="Ex. Jean"
                    placeholderTextColor={colors.mutedForeground}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    autoFocus
                  />
                </View>
              )}

              {step === 2 && (
                <View style={[styles.inputWrap, { backgroundColor: colors.card }]}>
                  <Feather name="users" size={18} color={colors.primary} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="Ex. Kouamé"
                    placeholderTextColor={colors.mutedForeground}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    autoFocus
                  />
                </View>
              )}

              {step === 3 && (
                <View style={[styles.inputWrap, { backgroundColor: colors.card, opacity: comingFromCheck ? 0.88 : 1 }]}>
                  <Feather name="phone" size={18} color={colors.primary} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="07 XX XX XX XX"
                    placeholderTextColor={colors.mutedForeground}
                    value={phone}
                    onChangeText={(v) => setPhone(formatPhoneInput(v))}
                    keyboardType="phone-pad"
                    editable={!comingFromCheck}
                    maxLength={14}
                    autoFocus={!comingFromCheck}
                  />
                  {comingFromCheck && <Feather name="check-circle" size={16} color={colors.success} />}
                </View>
              )}

              {step === 4 && (
                <View style={[styles.inputWrap, { backgroundColor: colors.card }]}>
                  <Feather name="lock" size={18} color={colors.primary} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.mutedForeground}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                    <Feather name={showPass ? "eye-off" : "eye"} size={17} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: canContinue() ? colors.primary : "rgba(255,255,255,0.22)" },
                ]}
                onPress={goNext}
                disabled={!canContinue() || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>{step === 4 ? "Créer mon compte" : "Continuer"}</Text>
                    {step < 4 && <Feather name="arrow-right" size={18} color="#FFF" />}
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomRow}>
            <Text style={styles.bottomLabel}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.bottomLink, { color: colors.primary }]}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  flex: { flex: 1 },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 28,
  },
  topBar: {
    marginBottom: 18,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  brand: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoImage: {
    width: 78,
    height: 78,
    marginBottom: 14,
  },
  brandName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  brandTagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    color: "rgba(255,255,255,0.9)",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  progressWrap: { marginBottom: 22 },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressTitle: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  progressCount: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_500Medium" },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 12,
  },
  progressFill: { height: "100%", borderRadius: 999 },
  stepsRow: { flexDirection: "row", justifyContent: "space-between" },
  stepChip: { alignItems: "center", gap: 5, flex: 1 },
  stepDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  stepDotText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  stepLabel: { fontSize: 9, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  heroBlock: { marginTop: 8 },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
    lineHeight: 21,
    color: "rgba(255,255,255,0.88)",
  },
  methodsCol: { gap: 10, marginBottom: 18 },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
  },
  methodText: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  formBlock: { marginTop: 4 },
  stepTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  stepDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    marginBottom: 24,
    color: "rgba(255,255,255,0.88)",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    height: 56,
    borderRadius: 16,
    marginBottom: 18,
  },
  input: { flex: 1, fontSize: 16, fontFamily: "Inter_400Regular" },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 16,
    marginTop: 8,
  },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFF" },
  bottomRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 28 },
  bottomLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.82)" },
  bottomLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
