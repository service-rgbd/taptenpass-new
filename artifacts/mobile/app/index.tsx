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
import { useAuth } from "@/context/AuthContext";
import { OPERATOR_COLORS, PACKAGES } from "@/constants/packages";
import { useColors } from "@/hooks/useColors";

const FEATURED_PACKAGES = [
  PACKAGES.find((p) => p.id === "o2")!,
  PACKAGES.find((p) => p.id === "m2")!,
  PACKAGES.find((p) => p.id === "mv2")!,
  PACKAGES.find((p) => p.id === "o3")!,
  PACKAGES.find((p) => p.id === "m3")!,
  PACKAGES.find((p) => p.id === "mv3")!,
];

const FEATURES = [
  { icon: "zap" as const, title: "3 clics maximum", desc: "Achetez votre forfait en quelques secondes, sans démarche complexe." },
  { icon: "shield" as const, title: "Paiement sécurisé", desc: "Wave, Orange Money, MTN Money ou carte bancaire." },
  { icon: "clock" as const, title: "Historique complet", desc: "Suivez toutes vos transactions en temps réel." },
  { icon: "smartphone" as const, title: "Tous opérateurs", desc: "Orange, MTN et Moov — en un seul endroit." },
];

function formatPrice(price: number) {
  return price.toLocaleString("fr-CI");
}

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
      {/* Sticky top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <View style={styles.topBarBrand}>
          <View style={[styles.topLogo, { backgroundColor: colors.primary }]}>
            <Feather name="zap" size={14} color="#FFF" />
          </View>
          <Text style={[styles.topLogoText, { color: colors.foreground }]}>CHAP-CREDIT</Text>
        </View>
        <TouchableOpacity
          style={[styles.topLoginBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.8}
        >
          <Text style={[styles.topLoginText, { color: colors.primary }]}>Connexion</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroIcon}>
            <Feather name="zap" size={36} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Internet en{"\n"}quelques secondes</Text>
          <Text style={styles.heroSub}>
            Achetez vos forfaits mobile Orange, MTN et Moov directement depuis votre téléphone — rapide, simple, sécurisé.
          </Text>

          <View style={styles.operatorsRow}>
            {(["Orange", "MTN", "Moov"] as const).map((op) => (
              <View key={op} style={[styles.opPill, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                <View style={[styles.opDot, { backgroundColor: OPERATOR_COLORS[op] }]} />
                <Text style={styles.opPillText}>{op}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Forfaits populaires ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Forfaits populaires</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              À partir de 800 FCFA
            </Text>
          </View>

          <View style={styles.packagesGrid}>
            {FEATURED_PACKAGES.map((pkg) => {
              const opColor = OPERATOR_COLORS[pkg.operator];
              return (
                <TouchableOpacity
                  key={pkg.id}
                  style={[styles.pkgCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push("/(auth)/login")}
                  activeOpacity={0.8}
                >
                  <View style={[styles.pkgOperatorBadge, { backgroundColor: opColor + "18" }]}>
                    <View style={[styles.pkgOpDot, { backgroundColor: opColor }]} />
                    <Text style={[styles.pkgOperator, { color: opColor }]}>{pkg.operator}</Text>
                  </View>
                  <Text style={[styles.pkgData, { color: colors.foreground }]}>{pkg.data}</Text>
                  <Text style={[styles.pkgValidity, { color: colors.mutedForeground }]}>{pkg.validity}</Text>
                  <View style={[styles.pkgPriceRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.pkgPrice, { color: colors.primary }]}>
                      {formatPrice(pkg.price)}
                    </Text>
                    <Text style={[styles.pkgFcfa, { color: colors.mutedForeground }]}>FCFA</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.seeMoreBtn, { borderColor: colors.primary }]}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={[styles.seeMoreText, { color: colors.primary }]}>Voir tous les forfaits</Text>
            <Feather name="arrow-right" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Comment ça marche ── */}
        <View style={[styles.howSection, { backgroundColor: colors.primary + "08" }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 6 }]}>
            Comment ça marche ?
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, marginBottom: 24 }]}>
            Achetez en 3 étapes seulement
          </Text>
          {[
            { n: "1", label: "Choisissez votre opérateur", icon: "smartphone" as const },
            { n: "2", label: "Sélectionnez un forfait", icon: "wifi" as const },
            { n: "3", label: "Payez et profitez !", icon: "check-circle" as const },
          ].map((step, i) => (
            <View key={step.n} style={styles.stepRow}>
              <View style={[styles.stepCircle, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNum}>{step.n}</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepLabel, { color: colors.foreground }]}>{step.label}</Text>
              </View>
              {i < 2 && (
                <View style={[styles.stepConnector, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>

        {/* ── Avantages ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 4 }]}>
            Pourquoi CHAP-CREDIT ?
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, marginBottom: 20 }]}>
            L'application pensée pour vous
          </Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <View
                key={f.title}
                style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.featureIcon, { backgroundColor: colors.accent }]}>
                  <Feather name={f.icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>{f.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Modes de paiement ── */}
        <View style={[styles.paySection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.payTitle, { color: colors.foreground }]}>Modes de paiement acceptés</Text>
          {["Wave", "Orange Money", "MTN Money", "Carte bancaire"].map((m) => (
            <View key={m} style={styles.payRow}>
              <View style={[styles.payDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.payLabel, { color: colors.foreground }]}>{m}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View
        style={[
          styles.stickyBar,
          {
            backgroundColor: colors.background,
            paddingBottom: bottomPad + 12,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.ctaPrimary, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.87}
        >
          <Text style={styles.ctaPrimaryText}>Commencer gratuitement</Text>
          <Feather name="arrow-right" size={18} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.7}
        >
          <Text style={[styles.ctaSecondary, { color: colors.mutedForeground }]}>
            J'ai déjà un compte —{" "}
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
    paddingBottom: 12,
    zIndex: 10,
  },
  topBarBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
  topLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  topLogoText: { fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  topLoginBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  topLoginText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  hero: {
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 28,
    marginBottom: 28,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#FFF",
    lineHeight: 38,
    marginBottom: 14,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
    marginBottom: 24,
  },
  operatorsRow: { flexDirection: "row", gap: 8 },
  opPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  opDot: { width: 8, height: 8, borderRadius: 4 },
  opPillText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },

  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 19, fontFamily: "Inter_700Bold", marginBottom: 2 },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular" },

  packagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pkgCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  pkgOperatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  pkgOpDot: { width: 6, height: 6, borderRadius: 3 },
  pkgOperator: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  pkgData: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 2 },
  pkgValidity: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 12 },
  pkgPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  pkgPrice: { fontSize: 16, fontFamily: "Inter_700Bold" },
  pkgFcfa: { fontSize: 11, fontFamily: "Inter_500Medium" },

  seeMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 14,
  },
  seeMoreText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  howSection: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
  },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16, position: "relative" },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNum: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
  stepInfo: { flex: 1 },
  stepLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  stepConnector: { position: "absolute", left: 17, top: 40, width: 2, height: 14 },

  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  featureCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 4 },
  featureDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },

  paySection: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  payTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 14 },
  payRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  payDot: { width: 8, height: 8, borderRadius: 4 },
  payLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },

  stickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  ctaPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 16,
    shadowColor: "#0A4FFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaPrimaryText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  ctaSecondary: { textAlign: "center", fontSize: 14, fontFamily: "Inter_400Regular" },
});
