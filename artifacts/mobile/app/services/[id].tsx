import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMarketplaceService } from "@/constants/marketplace-services";
import { useColors } from "@/hooks/useColors";

export default function ServiceDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const service = getMarketplaceService(id ?? "");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  if (!service) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.foreground }}>Service introuvable</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{service.name}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomPad + 24 }}>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{service.description}</Text>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Prestataires</Text>

        {service.providers.map((provider) => (
          <View
            key={provider.id}
            style={[styles.providerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.providerTop}>
              <View style={[styles.avatar, { backgroundColor: colors.primary20 }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {provider.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.providerName, { color: colors.foreground }]}>{provider.name}</Text>
                <View style={styles.metaRow}>
                  <Feather name="star" size={12} color={colors.secondary} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{provider.rating.toFixed(1)}</Text>
                  <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>•</Text>
                  <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{provider.location}</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.providerDesc, { color: colors.mutedForeground }]}>{provider.description}</Text>
            <Text style={[styles.price, { color: colors.primary }]}>
              À partir de {provider.priceFromFcfa.toLocaleString("fr-CI")} FCFA
            </Text>
            <TouchableOpacity
              style={[styles.contactBtn, { backgroundColor: colors.muted }]}
              activeOpacity={0.8}
              onPress={() => {}}
            >
              <Text style={[styles.contactText, { color: colors.foreground }]}>Bientôt disponible</Text>
            </TouchableOpacity>
          </View>
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
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  providerCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  providerTop: { flexDirection: "row", gap: 12, marginBottom: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  providerName: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  metaDot: { fontSize: 12 },
  providerDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, marginBottom: 10 },
  price: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 12 },
  contactBtn: {
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
