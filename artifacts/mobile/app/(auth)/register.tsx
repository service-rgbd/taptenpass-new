import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

type Method = "google" | "apple" | "phone" | null;

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { phone: prefillPhone } = useLocalSearchParams<{ phone?: string }>();

  const [method, setMethod] = useState<Method>(prefillPhone ? "phone" : null);
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState(prefillPhone ?? "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const formAnim = useRef(new Animated.Value(prefillPhone ? 1 : 0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const comingFromCheck = !!prefillPhone;

  function selectMethod(m: Method) {
    if (m === "google") {
      Alert.alert("Google", "Inscription via Google bientôt disponible.");
      return;
    }
    if (m === "apple") {
      Alert.alert("Apple", "Inscription via Apple bientôt disponible.");
      return;
    }
    setMethod(m);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(formAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
  }

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

  const METHOD_BTNS: { id: Method; label: string; icon: React.ReactNode }[] = [
    {
      id: "google",
      label: "Google",
      icon: <Text style={styles.googleG}>G</Text>,
    },
    {
      id: "apple",
      label: "Apple",
      icon: <Feather name="smartphone" size={18} color={method === "apple" ? "#FFF" : colors.foreground} />,
    },
    {
      id: "phone",
      label: "Téléphone",
      icon: <Feather name="phone" size={18} color={method === "phone" ? "#FFF" : colors.foreground} />,
    },
  ];

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

        {/* Back */}
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={16} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Retour</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.foreground }]}>Créer un compte</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {comingFromCheck
            ? `Numéro ${phone} non trouvé. Complétez votre inscription.`
            : "Choisissez votre méthode d'inscription"}
        </Text>

        {/* 3 method selectors */}
        {!comingFromCheck && (
          <View style={styles.methodsRow}>
            {METHOD_BTNS.map((btn) => {
              const active = method === btn.id;
              return (
                <TouchableOpacity
                  key={btn.id as string}
                  style={[
                    styles.methodBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      shadowColor: active ? colors.primary : "transparent",
                    },
                  ]}
                  onPress={() => selectMethod(btn.id)}
                  activeOpacity={0.8}
                >
                  {btn.icon}
                  <Text
                    style={[
                      styles.methodLabel,
                      { color: active ? "#FFF" : colors.foreground },
                    ]}
                  >
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Form — appears after phone is selected */}
        {method === "phone" && (
          <Animated.View
            style={{
              opacity: formAnim,
              transform: [
                {
                  translateY: formAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
              ],
            }}
          >
            <View style={[styles.divider, { backgroundColor: colors.border }]}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>
                Vos informations
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

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
                  autoFocus={!comingFromCheck}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Numéro de téléphone</Text>
              <View style={[styles.flatInput, { backgroundColor: colors.card, opacity: comingFromCheck ? 0.7 : 1 }]}>
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
                  <Feather name={showPass ? "eye-off" : "eye"} size={17} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.75 : 1, marginTop: 8 }]}
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
          </Animated.View>
        )}

        <View style={styles.bottomRow}>
          <Text style={[styles.bottomLabel, { color: colors.mutedForeground }]}>Déjà un compte ? </Text>
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
  brand: { alignItems: "center", marginBottom: 36 },
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
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 28 },

  methodsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  methodBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  methodLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  googleG: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#4285F4" },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontFamily: "Inter_500Medium" },

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
  bottomRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8 },
  bottomLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  bottomLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
