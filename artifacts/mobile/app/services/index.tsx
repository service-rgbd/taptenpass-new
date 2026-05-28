import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARKETPLACE_SERVICES } from "@/constants/marketplace-services";
import { useColors } from "@/hooks/useColors";

const ICONS = {
  tv: "tv",
  film: "film",
  gift: "gift",
  "shopping-bag": "shopping-bag",
  coffee: "coffee",
  home: "home",
} as const;

export default function ServicesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Services</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomPad + 24 }}>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Découvrez nos partenaires. L'inscription des prestataires se fera prochainement.
        </Text>

        {MARKETPLACE_SERVICES.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/services/${service.id}`)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.primary20 }]}>
              <Feather name={ICONS[service.icon]} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{service.name}</Text>
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{service.description}</Text>
              <Text style={[styles.cardMeta, { color: colors.primary }]}>
                {service.providers.length} prestataire{service.providers.length > 1 ? "s" : ""}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21, marginBottom: 18 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, marginBottom: 6 },
  cardMeta: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
