import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  async function handleLogin() {
    if (!phone || !password) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const ok = await login(phone, password);
      if (ok) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Erreur", "Numéro ou mot de passe incorrect.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 32, paddingBottom: bottomPad + 32 }]}
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

        {/* Title */}
        <Text style={[styles.title, { color: colors.foreground }]}>Connexion</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Bon retour ! Entrez votre numéro pour continuer.
        </Text>

        {/* Phone */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Numéro de téléphone</Text>
          <View style={[styles.flatInput, { backgroundColor: colors.card }]}>
            <Feather name="phone" size={17} color={colors.primary} />
            <TextInput
              style={[styles.inputText, { color: colors.foreground }]}
              placeholder="+225 07 XX XX XX XX"
              placeholderTextColor={colors.mutedForeground}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
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
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Feather name={showPass ? "eye-off" : "eye"} size={17} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.forgotWrap}>
          <Text style={[styles.forgot, { color: colors.primary }]}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.75 : 1 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Se connecter</Text>
          )}
        </TouchableOpacity>

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
          <Text style={[styles.socialBtnText, { color: colors.foreground }]}>Continuer avec Google</Text>
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

        {/* Register link */}
        <View style={styles.bottomRow}>
          <Text style={[styles.bottomLabel, { color: colors.mutedForeground }]}>
            Pas encore de compte ?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={[styles.bottomLink, { color: colors.primary }]}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 28 },
  brand: { alignItems: "center", marginBottom: 40 },
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
  appName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  appTagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
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
  inputText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  forgotWrap: { alignSelf: "flex-end", marginBottom: 28, marginTop: -6 },
  forgot: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  primaryBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: "#0A4FFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
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
  googleG: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#4285F4",
  },
  socialBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  appleBtn: { backgroundColor: "#000" },
  appleBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  bottomLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  bottomLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
