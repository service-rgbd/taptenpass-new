import { Feather } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
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

const OPERATOR_LOGOS = {
  Orange: require("../assets/images/operators/orange.png"),
  MTN: require("../assets/images/operators/mtn.png"),
  Moov: require("../assets/images/operators/moov.png"),
};

const OPERATORS = ["Orange", "MTN", "Moov"] as const;

// One featured package per operator
const FEATURED = [
  PACKAGES.find((p) => p.id === "o1")!,
  PACKAGES.find((p) => p.id === "o2")!,
  PACKAGES.find((p) => p.id === "o3")!,
  PACKAGES.find((p) => p.id === "m1")!,
  PACKAGES.find((p) => p.id === "m2")!,
  PACKAGES.find((p) => p.id === "m3")!,
  PACKAGES.find((p) => p.id === "mv1")!,
  PACKAGES.find((p) => p.id === "mv2")!,
  PACKAGES.find((p) => p.id === "mv3")!,
];

function fmt(n: number) {
  return n.toLocaleString("fr-CI");
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
      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: topPad + 10 }]}>
        <View style={styles.brand}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Feather name="zap" size={13} color="#FFF" />
          </View>
          <Text style={[styles.brandName, { color: colors.foreground }]}>CHAP-CREDIT</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")} activeOpacity={0.7}>
          <Text style={[styles.loginLink, { color: colors.primary }]}>Connexion</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={[styles.hero, { paddingHorizontal: 24 }]}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Internet mobile{"\n"}
            <Text style={{ color: colors.primary }}>en 3 clics.</Text>
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Achetez vos forfaits Orange, MTN et Moov directement depuis votre téléphone.
          </Text>

          {/* Operator logos row */}
          <View style={styles.opRow}>
            {OPERATORS.map((op) => (
              <View key={op} style={styles.opItem}>
                <View style={[styles.opLogoWrap, { backgroundColor: OPERATOR_COLORS[op] + "14" }]}>
                  <Image
                    source={OPERATOR_LOGOS[op]}
                    style={styles.opLogoImg}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.opName, { color: colors.mutedForeground }]}>{op}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Séparateur ── */}
        <View style={[styles.sep, { backgroundColor: colors.border, marginHorizontal: 24 }]} />

        {/* ── Forfaits par opérateur ── */}
        <View style={{ paddingHorizontal: 24 }}>
          {OPERATORS.map((op) => {
            const opColor = OPERATOR_COLORS[op];
            const pkgs = FEATURED.filter((p) => p.operator === op);
            return (
              <View key={op} style={styles.opSection}>
                {/* Operator header */}
                <View style={styles.opHeader}>
                  <View style={[styles.opLogoSmall, { backgroundColor: opColor + "14" }]}>
                    <Image source={OPERATOR_LOGOS[op]} style={styles.opLogoSmallImg} resizeMode="contain" />
                  </View>
                  <Text style={[styles.opSectionName, { color: colors.foreground }]}>{op}</Text>
                  <View style={[styles.opDot, { backgroundColor: opColor }]} />
                </View>

                {/* Package rows */}
                {pkgs.map((pkg, i) => (
                  <TouchableOpacity
                    key={pkg.id}
                    style={[
                      styles.pkgRow,
                      i < pkgs.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                    ]}
                    onPress={() => router.push("/(auth)/login")}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pkgLeft}>
                      <Text style={[styles.pkgData, { color: colors.foreground }]}>{pkg.data}</Text>
                      <Text style={[styles.pkgValidity, { color: colors.mutedForeground }]}>{pkg.validity}</Text>
                    </View>
                    <View style={styles.pkgRight}>
                      <Text style={[styles.pkgPrice, { color: colors.foreground }]}>
                        {fmt(pkg.price)}{" "}
                        <Text style={[styles.pkgFcfa, { color: colors.mutedForeground }]}>FCFA</Text>
                      </Text>
                      <View style={[styles.buyTag, { backgroundColor: opColor + "14" }]}>
                        <Text style={[styles.buyTagText, { color: opColor }]}>Acheter</Text>
                        <Feather name="arrow-right" size={10} color={opColor} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Separator between operators */}
                <View style={[styles.opSep, { backgroundColor: colors.border }]} />
              </View>
            );
          })}
        </View>

        {/* ── Comment ça marche ── */}
        <View style={{ paddingHorizontal: 24, marginBottom: 40 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Comment ça marche ?</Text>

          {[
            { n: "01", label: "Choisissez un opérateur", icon: "smartphone" as const },
            { n: "02", label: "Sélectionnez votre forfait", icon: "wifi" as const },
            { n: "03", label: "Payez et profitez", icon: "check-circle" as const },
          ].map((step) => (
            <View key={step.n} style={styles.stepRow}>
              <Text style={[styles.stepNum, { color: colors.primary }]}>{step.n}</Text>
              <View style={styles.stepBody}>
                <Feather name={step.icon} size={16} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                <Text style={[styles.stepLabel, { color: colors.foreground }]}>{step.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Avantages ── */}
        <View style={{ paddingHorizontal: 24, marginBottom: 40 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pourquoi CHAP-CREDIT ?</Text>

          {[
            { icon: "zap" as const, label: "Achat en 3 clics, sans complication" },
            { icon: "shield" as const, label: "Paiements sécurisés — Wave, OM, MTN Money, carte" },
            { icon: "clock" as const, label: "Historique complet de vos transactions" },
            { icon: "users" as const, label: "Orange, MTN et Moov réunis" },
          ].map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <Feather name={f.icon} size={16} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.foreground }]}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Paiements ── */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Modes de paiement</Text>
          <View style={styles.payRow}>
            {["Wave", "Orange Money", "MTN Money", "Carte bancaire"].map((m) => (
              <View key={m} style={[styles.payChip, { backgroundColor: colors.card }]}>
                <Text style={[styles.payChipText, { color: colors.foreground }]}>{m}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View style={[styles.cta, { paddingBottom: bottomPad + 14, backgroundColor: colors.background }]}>
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
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoMark: { width: 26, height: 26, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  brandName: { fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  loginLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  hero: { paddingTop: 8, paddingBottom: 32 },
  heroTitle: { fontSize: 34, fontFamily: "Inter_700Bold", lineHeight: 42, marginBottom: 14 },
  heroSub: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 23, marginBottom: 28 },

  opRow: { flexDirection: "row", gap: 20 },
  opItem: { alignItems: "center", gap: 8 },
  opLogoWrap: { width: 64, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  opLogoImg: { width: 44, height: 44 },
  opName: { fontSize: 12, fontFamily: "Inter_500Medium" },

  sep: { height: StyleSheet.hairlineWidth, marginBottom: 32 },

  opSection: { marginBottom: 8 },
  opHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  opLogoSmall: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  opLogoSmallImg: { width: 22, height: 22 },
  opSectionName: { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1 },
  opDot: { width: 7, height: 7, borderRadius: 4 },
  opSep: { height: StyleSheet.hairlineWidth, marginTop: 8, marginBottom: 24 },

  pkgRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  pkgLeft: { gap: 3 },
  pkgData: { fontSize: 16, fontFamily: "Inter_700Bold" },
  pkgValidity: { fontSize: 12, fontFamily: "Inter_400Regular" },
  pkgRight: { alignItems: "flex-end", gap: 6 },
  pkgPrice: { fontSize: 14, fontFamily: "Inter_700Bold" },
  pkgFcfa: { fontSize: 11, fontFamily: "Inter_400Regular" },
  buyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  buyTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 20 },

  stepRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  stepNum: { fontSize: 13, fontFamily: "Inter_700Bold", width: 28 },
  stepBody: { flexDirection: "row", alignItems: "center", flex: 1 },
  stepLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },

  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 16 },
  featureText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 21 },

  payRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  payChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  payChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  cta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 14,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 16,
  },
  ctaBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  ctaSub: { textAlign: "center", fontSize: 14, fontFamily: "Inter_400Regular" },
});
