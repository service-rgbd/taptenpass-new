import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const SETTINGS_GROUPS = [
  {
    title: "Compte",
    items: [
      { icon: "user", label: "Informations personnelles", desc: "Nom, email, numero" },
      { icon: "lock", label: "Mot de passe", desc: "Mise a jour et securite" },
      { icon: "shield", label: "Confidentialite", desc: "Permissions et donnees" },
    ],
  },
  {
    title: "Paiements",
    items: [
      { icon: "credit-card", label: "Methodes de paiement", desc: "Wave, Mobile Money, carte" },
      { icon: "bell", label: "Notifications de transaction", desc: "Recus et alertes" },
    ],
  },
  {
    title: "Application",
    items: [
      { icon: "smartphone", label: "Contacts du telephone", desc: "Import rapide de destinataires" },
      { icon: "help-circle", label: "Centre d'aide", desc: "Support et assistance" },
    ],
  },
];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 12, paddingBottom: bottomPad + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Parametres</Text>
          <View style={styles.backBtn} />
        </View>

        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
          ]}
        >
          <View style={[styles.heroIcon, { backgroundColor: colors.primary20 }]}>
            <Feather name="settings" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>Espace de configuration</Text>
            <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>
              Les parametres sont prepares pour les prochaines fonctionnalites.
            </Text>
          </View>
        </View>

        <View style={[styles.quickToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quickToggleTitle, { color: colors.foreground }]}>Notifications actives</Text>
            <Text style={[styles.quickToggleDesc, { color: colors.mutedForeground }]}>
              Recevoir les confirmations d'achat et alertes.
            </Text>
          </View>
          <Switch value onValueChange={() => {}} trackColor={{ false: colors.muted, true: colors.primary20 }} thumbColor={colors.primary} />
        </View>

        {SETTINGS_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={[styles.groupTitle, { color: colors.mutedForeground }]}>{group.title}</Text>
            <View style={styles.groupItems}>
              {group.items.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.itemRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                  activeOpacity={0.75}
                  onPress={() => {}}
                >
                  <View style={[styles.itemIcon, { backgroundColor: colors.muted }]}>
                    <Feather name={item.icon as never} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemLabel, { color: colors.foreground }]}>{item.label}</Text>
                    <Text style={[styles.itemDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
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
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  heroDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  quickToggle: {
    marginHorizontal: 20,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  quickToggleTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  quickToggleDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  group: { marginBottom: 18 },
  groupTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  groupItems: {
    paddingHorizontal: 20,
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  itemDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
