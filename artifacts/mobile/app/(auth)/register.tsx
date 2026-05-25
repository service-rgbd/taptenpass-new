import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { phone: prefillPhone } = useLocalSearchParams<{ phone?: string }>();

  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState(prefillPhone ?? "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const comingFromCheck = !!prefillPhone;

  async function handleRegister() {
    if (!fullname.trim() || !phone.trim() || !password) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const ok = await register(fullname.trim(), phone.trim(), password);
      if (ok) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
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
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 28, paddingBottom: bottomPad + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <View style={[styles.backCircle, { backgroundColor: colors.card }]}>
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </View>
        </TouchableOpacity>

        {/* Brand */}
        <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
          <Feather name="zap" size={22} color="#FFF" />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Créer un compte</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {comingFromCheck
            ? `Le numéro ${phone} n'existe pas encore.\nComplétez votre profil pour commencer.`
            : "Votre numéro suffit pour commencer."}
        </Text>

        {/* Social buttons — only shown when arriving directly (not from phone check) */}
        {!comingFromCheck && (
          <>
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: colors.card }]}
              onPress={() => Alert.alert("Google", "Inscription Google bientôt disponible.")}
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
                onPress={() => Alert.alert("Apple", "Inscription Apple bientôt disponible.")}
                activeOpacity={0.8}
              >
                <Feather name="smartphone" size={18} color="#FFF" />
                <Text style={styles.appleBtnText}>Continuer avec Apple</Text>
              </TouchableOpacity>
            )}

            <View style={styles.orRow}>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.orText, { color: colors.mutedForeground }]}>ou avec votre numéro</Text>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
            </View>
          </>
        )}

        {/* Fields */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Nom complet</Text>
          <View style={[styles.flatInput, { backgroundColor: colors.card }]}>
            <Feather name="user" size={17} color={colors.primary} />
            <TextInput
              style={[styles.inputText, { color: colors.foreground }]}
              placeholder="Jean Dupont"
              placeholderTextColor={colors.mutedForeground}
              value={fullname}
              onChangeText={setFullname}
              autoCapitalize="words"
              autoFocus={comingFromCheck}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Numéro de téléphone</Text>
          <View
            style={[
              styles.flatInput,
              {
                backgroundColor: colors.card,
                opacity: comingFromCheck ? 0.7 : 1,
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
              editable={!comingFromCheck}
            />
            {comingFromCheck && (
              <Feather name="check-circle" size={16} color={colors.success} />
            )}
          </View>
        </View>

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
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Feather
                name={showPass ? "eye-off" : "eye"}
                size={17}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { backgroundColor: colors.primary, opacity: loading ? 0.75 : 1, marginTop: 8 },
          ]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Créer mon compte</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <Text style={[styles.bottomLabel, { color: colors.mutedForeground }]}>
            Déjà un compte ?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.bottomLink, { color: colors.primary }]}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 28 },
  backBtn: { marginBottom: 24 },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: "#0A4FFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 7,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 28 },
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
  orRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 24 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  fieldGroup: { marginBottom: 16 },
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
  primaryBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
  bottomRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  bottomLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  bottomLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
