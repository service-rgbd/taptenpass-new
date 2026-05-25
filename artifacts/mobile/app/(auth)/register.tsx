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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  async function handleRegister() {
    if (!fullname || !phone || !email || !password) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const ok = await register(fullname, phone, email, password);
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
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.logoCircle}>
          <Feather name="zap" size={24} color={colors.primary} />
        </View>
        <Text style={styles.logoText}>CHAP-CREDIT</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.form, { paddingBottom: bottomPad + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>Créer un compte</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Rejoignez CHAP-CREDIT et simplifiez vos achats
          </Text>

          {/* Grouped identity card */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Informations personnelles</Text>
          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.inputRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
                <Feather name="user" size={15} color={colors.primary} />
              </View>
              <View style={styles.inputInner}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Nom complet</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="Jean Dupont"
                  placeholderTextColor={colors.mutedForeground}
                  value={fullname}
                  onChangeText={setFullname}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.inputRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
                <Feather name="phone" size={15} color={colors.primary} />
              </View>
              <View style={styles.inputInner}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Téléphone</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="+225 07 XX XX XX XX"
                  placeholderTextColor={colors.mutedForeground}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.inputRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
                <Feather name="mail" size={15} color={colors.primary} />
              </View>
              <View style={styles.inputInner}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Email</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="jean@gmail.com"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          {/* Grouped password card */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 20 }]}>Sécurité</Text>
          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
                />
              </View>
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Feather name={showPass ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.inputRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
                <Feather name="shield" size={15} color={colors.primary} />
              </View>
              <View style={styles.inputInner}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Confirmer le mot de passe</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedForeground}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPass}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1, marginTop: 28 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnText}>Créer mon compte</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={[styles.loginLabel, { color: colors.mutedForeground }]}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Se connecter</Text>
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
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: "relative",
  },
  back: {
    position: "absolute",
    left: 20,
    bottom: 28,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  form: { padding: 24, paddingTop: 28 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 28 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  inputCard: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
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
  inputInner: { flex: 1 },
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
  btnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  loginRow: { flexDirection: "row", justifyContent: "center" },
  loginLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  loginLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
