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
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 24 }]}>
        <View style={styles.logoCircle}>
          <Feather name="zap" size={28} color={colors.primary} />
        </View>
        <Text style={styles.logoText}>CHAP-CREDIT</Text>
        <Text style={styles.tagline}>Internet en quelques secondes</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.form, { paddingBottom: bottomPad + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>Connexion</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Bienvenue ! Connectez-vous à votre compte
          </Text>

          {/* Single grouped card for all inputs */}
          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Phone field */}
            <View style={styles.inputRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
                <Feather name="phone" size={15} color={colors.primary} />
              </View>
              <View style={styles.inputInner}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Téléphone</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="+225 XX XX XX XX XX"
                  placeholderTextColor={colors.mutedForeground}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Password field */}
            <View style={styles.inputRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
                <Feather name="lock" size={15} color={colors.primary} />
              </View>
              <View style={styles.inputInner}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Mot de passe</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoComplete="password"
                />
              </View>
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Feather name={showPass ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={[styles.forgot, { color: colors.primary }]}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={[styles.registerLabel, { color: colors.mutedForeground }]}>
              Pas encore de compte ?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    alignItems: "center",
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    color: "#FFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  tagline: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  form: {
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 28,
  },
  inputCard: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  inputInner: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  input: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
    margin: 0,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  eyeBtn: { padding: 4, flexShrink: 0 },
  forgotWrap: { alignSelf: "flex-end", marginBottom: 28, marginTop: 4 },
  forgot: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  btn: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#0A4FFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  registerLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
