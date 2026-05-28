import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import React from "react";
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
import OperatorLogo from "@/components/OperatorLogo";
import { APP_NAME } from "@/constants/branding";
import { OPERATOR_COLORS } from "@/constants/packages";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const OPERATORS = ["Orange", "MTN", "Moov"] as const;

const VALUE_PROPS = [
  { emoji: "⚡", title: "Instantané", desc: "Pass crédité en quelques secondes." },
  { emoji: "🔒", title: "Sécurisé", desc: "Paiement chiffré bout en bout." },
  { emoji: "✨", title: "Simple", desc: "3 clics pour acheter un forfait." },
];

const STATS = [
  { value: "10K+", label: "utilisateurs" },
  { value: "3", label: "opérateurs" },
  { value: "<30s", label: "par achat" },
];

export default function LandingScreen() {
  const { user, isLoading } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (user) return <Redirect href="/(tabs)" />;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 14, paddingBottom: bottomPad + 200 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={[styles.brandMark, { backgroundColor: colors.foreground }]}>
              <Text style={[styles.brandMarkText, { color: colors.background }]}>T</Text>
            </View>
            <Text style={[styles.brandName, { color: colors.foreground }]}>{APP_NAME}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.7}
            style={[styles.loginPill, { backgroundColor: colors.muted }]}
          >
            <Text style={[styles.loginPillText, { color: colors.foreground }]}>Connexion</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIllustration}>
            <View style={[styles.heroOrb, { backgroundColor: colors.primary20 }]}>
              <Text style={styles.heroEmoji}>📡</Text>
            </View>
            <View
              style={[
                styles.heroFloat,
                styles.heroFloatTopRight,
                { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
              ]}
            >
              <Text style={styles.heroFloatEmoji}>⚡</Text>
            </View>
            <View
              style={[
                styles.heroFloat,
                styles.heroFloatBottomLeft,
                { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
              ]}
            >
              <Text style={styles.heroFloatEmoji}>💳</Text>
            </View>
            <View
              style={[
                styles.heroFloat,
                styles.heroFloatBottomRight,
                { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
              ]}
            >
              <Text style={styles.heroFloatEmoji}>📱</Text>
            </View>
          </View>

          <View style={[styles.heroBadge, { backgroundColor: colors.muted }]}>
            <View style={[styles.heroBadgeDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.heroBadgeText, { color: colors.foreground }]}>
              Disponible en Côte d'Ivoire
            </Text>
          </View>

          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Achetez vos forfaits{"\n"}en <Text style={{ color: colors.primary }}>quelques secondes</Text>.
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Orange, MTN, Moov — une seule application claire et fiable pour gérer vos pass internet.
          </Text>

          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
              <React.Fragment key={s.label}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
                {i < STATS.length - 1 && (
                  <View style={[styles.statSep, { backgroundColor: colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.valuePropsRow}>
            {VALUE_PROPS.map((v) => (
              <View
                key={v.title}
                style={[styles.valueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={styles.valueEmoji}>{v.emoji}</Text>
                <Text style={[styles.valueTitle, { color: colors.foreground }]}>{v.title}</Text>
                <Text style={[styles.valueDesc, { color: colors.mutedForeground }]}>{v.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Opérateurs</Text>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Tous vos pass au même endroit
          </Text>
          <View style={styles.operatorsRow}>
            {OPERATORS.map((op) => (
              <View
                key={op}
                style={[styles.operatorCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <OperatorLogo operator={op} size={48} radius={14} />
                <Text style={[styles.operatorName, { color: colors.foreground }]}>{op}</Text>
                <View style={[styles.operatorPrefixPill, { backgroundColor: OPERATOR_COLORS[op] + "1A" }]}>
                  <Text style={[styles.operatorPrefixText, { color: OPERATOR_COLORS[op] }]}>
                    {op === "Orange" ? "07" : op === "MTN" ? "05" : "01"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.testimonial, { backgroundColor: colors.primary20 }]}>
            <Text style={styles.testimonialQuote}>“</Text>
            <Text style={[styles.testimonialText, { color: colors.foreground }]}>
              Je recharge mon forfait en moins de 30 secondes. C'est devenu mon application du quotidien.
            </Text>
            <View style={styles.testimonialFooter}>
              <View style={[styles.testimonialAvatar, { backgroundColor: colors.card }]}>
                <Text style={[styles.testimonialAvatarText, { color: colors.primary }]}>AD</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.testimonialName, { color: colors.foreground }]}>Aïcha D.</Text>
                <Text style={[styles.testimonialRole, { color: colors.foreground }]}>Abidjan · Orange</Text>
              </View>
              <View style={styles.testimonialStars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Text key={n} style={styles.testimonialStar}>⭐</Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.cta,
          {
            paddingBottom: bottomPad + 14,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.87}
        >
          <Text style={styles.ctaBtnText}>Commencer gratuitement</Text>
          <Feather name="arrow-right" size={17} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")} activeOpacity={0.7}>
          <Text style={[styles.ctaSub, { color: colors.mutedForeground }]}>
            Déjà inscrit ?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  brandName: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  loginPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  loginPillText: { fontSize: 12, fontFamily: "Inter_700Bold" },

  hero: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 28, alignItems: "center" },
  heroIllustration: {
    width: 180,
    height: 180,
    marginBottom: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  heroOrb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: { fontSize: 64, lineHeight: 72 },
  heroFloat: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  heroFloatEmoji: { fontSize: 24, lineHeight: 28 },
  heroFloatTopRight: { top: 4, right: 2 },
  heroFloatBottomLeft: { bottom: 6, left: 0 },
  heroFloatBottomRight: { bottom: 14, right: 8 },

  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 16,
  },
  heroBadgeDot: { width: 7, height: 7, borderRadius: 4 },
  heroBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  heroTitle: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    lineHeight: 38,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 320,
    marginBottom: 22,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statItem: { alignItems: "center", gap: 2 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  statSep: { width: StyleSheet.hairlineWidth, height: 28 },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionEyebrow: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 14, letterSpacing: -0.3 },

  valuePropsRow: { flexDirection: "row", gap: 10 },
  valueCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  valueEmoji: { fontSize: 24, lineHeight: 28 },
  valueTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  valueDesc: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },

  operatorsRow: { flexDirection: "row", gap: 10 },
  operatorCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  operatorName: { fontSize: 13, fontFamily: "Inter_700Bold" },
  operatorPrefixPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  operatorPrefixText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },

  testimonial: {
    borderRadius: 20,
    padding: 20,
    paddingTop: 8,
  },
  testimonialQuote: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    lineHeight: 56,
    color: "rgba(10, 79, 255, 0.45)",
    marginBottom: -16,
  },
  testimonialText: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 22, marginBottom: 16 },
  testimonialFooter: { flexDirection: "row", alignItems: "center", gap: 10 },
  testimonialAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  testimonialAvatarText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  testimonialName: { fontSize: 13, fontFamily: "Inter_700Bold" },
  testimonialRole: { fontSize: 11, fontFamily: "Inter_400Regular", opacity: 0.7 },
  testimonialStars: { flexDirection: "row", gap: 1 },
  testimonialStar: { fontSize: 10 },

  cta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
  },
  ctaBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  ctaSub: { textAlign: "center", fontSize: 14, fontFamily: "Inter_400Regular" },
});
