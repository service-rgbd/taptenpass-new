import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Animated,
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
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type Step = "phone" | "password";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { checkPhone, login } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [checking, setChecking] = useState(false);
  const [logging, setLogging] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  function slideToPassword() {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
    setStep("password");
  }

  function slideBack() {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
    setStep("phone");
    setPassword("");
  }

  async function handleContinue() {
    const trimmed = phone.trim();
    if (!trimmed) {
      Alert.alert("Champs requis", "Veuillez entrer votre numéro de téléphone.");
      return;
    }
    setChecking(true);
    try {
      const exists = await checkPhone(trimmed);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (exists) {
        slideToPassword();
      } else {
        router.push({ pathname: "/(auth)/register", params: { phone: trimmed } });
      }
    } finally {
      setChecking(false);
    }
  }

  async function handleLogin() {
    if (!password) {
      Alert.alert("Champs requis", "Veuillez entrer votre mot de passe.");
      return;
    }
    setLogging(true);
    try {
      const ok = await login(phone.trim(), password);
      if (ok) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Mot de passe incorrect", "Veuillez réessayer.");
      }
    } finally {
      setLogging(false);
    }
  }

  const passwordTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 40, paddingBottom: bottomPad + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <Feather name="zap" size={26} color="#FFF" />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>CHAP-CREDIT</Text>
          <Text style={[styles.appTagline, { color: colors.mutedForeground }]}>
            Internet en quelques secondes
          </Text>
        </View>

        {/* — STEP: PHONE — */}
        <View>
          {step === "password" && (
            <TouchableOpacity style={styles.backRow} onPress={slideBack} activeOpacity={0.7}>
              <Feather name="arrow-left" size={16} color={colors.primary} />
              <Text style={[styles.backText, { color: colors.primary }]}>Changer de numéro</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.title, { color: colors.foreground }]}>
            {step === "phone" ? "Connexion" : "Mot de passe"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {step === "phone"
              ? "Entrez votre numéro pour continuer."
              : `Bienvenue ! Entrez votre mot de passe pour le\n${phone.trim()}`}
          </Text>

          {/* Phone field — always visible */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Numéro de téléphone</Text>
            <View
              style={[
                styles.flatInput,
                {
                  backgroundColor: colors.card,
                  opacity: step === "password" ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="phone" size={17} color={colors.primary} />
              <TextInput
                style={[styles.inputText, { color: colors.foreground }]}
                placeholder="+225 07 XX XX XX XX"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                editable={step === "phone"}
              />
              {step === "password" && (
                <Feather name="check-circle" size={16} color={colors.success} />
              )}
            </View>
          </View>

          {/* Password field — slides in when step = password */}
          {step === "password" && (
            <Animated.View
              style={[
                styles.fieldGroup,
                {
                  opacity: slideAnim,
                  transform: [{ translateY: passwordTranslate }],
                },
              ]}
            >
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Mot de passe</Text>
              <View style={[styles.flatInput, { backgroundColor: colors.card }]}>
                <Feather name="lock" size={17} color={colors.primary} />
                <TextInput
                  style={[styles.inputText, { color: colors.foreground }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoFocus
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Feather
                    name={showPass ? "eye-off" : "eye"}
                    size={17}
                    color={colors.mutedForeground}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotWrap}>
                <Text style={[styles.forgot, { color: colors.primary }]}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* CTA */}
          {step === "phone" ? (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: checking ? 0.75 : 1 }]}
              onPress={handleContinue}
              disabled={checking}
              activeOpacity={0.85}
            >
              {checking ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Continuer</Text>
                  <Feather name="arrow-right" size={18} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: logging ? 0.75 : 1 }]}
              onPress={handleLogin}
              disabled={logging}
              activeOpacity={0.85}
            >
              {logging ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Se connecter</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {step === "phone" && (
          <>
            {/* Separator */}
            <View style={styles.orRow}>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.orText, { color: colors.mutedForeground }]}>ou</Text>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Social */}
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: colors.card }]}
              onPress={() => Alert.alert("Google", "Connexion Google bientôt disponible.")}
              activeOpacity={0.8}
            >
              <Text style={styles.googleG}>G</Text>
              <Text style={[styles.socialBtnText, { color: colors.foreground }]}>
                Continuer avec Google
              </Text>
            </TouchableOpacity>

            {Platform.OS !== "android" && (
              <TouchableOpacity
                style={[styles.socialBtn, styles.appleBtn]}
                onPress={() => Alert.alert("Apple", "Connexion Apple bientôt disponible.")}
                activeOpacity={0.8}
              >
                <Feather name="smartphone" size={18} color="#FFF" />
                <Text style={styles.appleBtnText}>Continuer avec Apple</Text>
              </TouchableOpacity>
            )}

            <View style={styles.bottomRow}>
              <Text style={[styles.bottomLabel, { color: colors.mutedForeground }]}>
                Pas encore de compte ?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={[styles.bottomLink, { color: colors.primary }]}>Créer un compte</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 28 },
  brand: { alignItems: "center", marginBottom: 44 },
  logoBox: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#0A4FFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  appName: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  appTagline: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 32,
  },
  fieldGroup: { marginBottom: 18 },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  flatInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    height: 56,
    borderRadius: 16,
  },
  inputText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  forgotWrap: { alignSelf: "flex-end", marginTop: 10 },
  forgot: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 28,
    shadowColor: "#0A4FFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  googleG: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#4285F4" },
  socialBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  appleBtn: { backgroundColor: "#000" },
  appleBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  bottomLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  bottomLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
