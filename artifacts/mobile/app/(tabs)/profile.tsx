import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

interface MenuItemProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  desc?: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuItem({ icon, label, desc, onPress, destructive }: MenuItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.menuIcon, { backgroundColor: destructive ? colors.destructive + "18" : colors.accent }]}>
        <Feather name={icon} size={18} color={destructive ? colors.destructive : colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, { color: destructive ? colors.destructive : colors.foreground }]}>
          {label}
        </Text>
        {desc && <Text style={[styles.menuDesc, { color: colors.mutedForeground }]}>{desc}</Text>}
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();
  const { transactions } = useData();
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.fullname ?? "");
  const [editEmail, setEditEmail] = useState(user?.email ?? "");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const successCount = transactions.filter((t) => t.status === "success").length;
  const totalSpent = transactions.filter((t) => t.status === "success").reduce((s, t) => s + t.amount, 0);

  const initials = (user?.fullname ?? "??")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    await updateUser({ fullname: editName, email: editEmail });
    setEditModal(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  if (!user) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 24 }]}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.secondary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.headerName}>{user.fullname}</Text>
          <Text style={styles.headerPhone}>{user.phone}</Text>
          <Text style={styles.headerEmail}>{user.email}</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Achats réussis", value: successCount.toString(), icon: "check-circle" as const },
            {
              label: "Total dépensé",
              value: totalSpent.toLocaleString("fr-CI") + " F",
              icon: "trending-up" as const,
            },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Feather name={stat.icon} size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>MON COMPTE</Text>
          <MenuItem
            icon="edit-2"
            label="Modifier mon profil"
            desc="Nom, email"
            onPress={() => {
              setEditName(user.fullname);
              setEditEmail(user.email);
              setEditModal(true);
            }}
          />
          <MenuItem
            icon="lock"
            label="Changer le mot de passe"
            onPress={() => Alert.alert("Bientôt disponible", "Cette fonctionnalité sera disponible prochainement.")}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SUPPORT</Text>
          <MenuItem
            icon="help-circle"
            label="Centre d'aide"
            onPress={() => Alert.alert("Aide", "Contactez-nous à support@chap-credit.ci")}
          />
          <MenuItem
            icon="info"
            label="À propos"
            desc="Version 1.0.0"
            onPress={() => Alert.alert("CHAP-CREDIT", "Internet en quelques secondes\nVersion 1.0.0")}
          />
        </View>

        <View style={[styles.section, { marginBottom: 0 }]}>
          <MenuItem icon="log-out" label="Se déconnecter" onPress={handleLogout} destructive />
        </View>
      </ScrollView>

      <Modal visible={editModal} transparent animationType="slide" onRequestClose={() => setEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Modifier le profil</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={styles.editField}>
              <Text style={[styles.editLabel, { color: colors.mutedForeground }]}>Nom complet</Text>
              <View style={[styles.editInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  style={[styles.editTextInput, { color: colors.foreground }]}
                  placeholder="Votre nom"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>

            <View style={styles.editField}>
              <Text style={[styles.editLabel, { color: colors.mutedForeground }]}>Email</Text>
              <View style={[styles.editInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                  value={editEmail}
                  onChangeText={setEditEmail}
                  style={[styles.editTextInput, { color: colors.foreground }]}
                  placeholder="votre@email.com"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveEdit}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: -28,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: { color: "#FFF", fontSize: 28, fontFamily: "Inter_700Bold" },
  headerName: { color: "#FFF", fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  headerPhone: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_400Regular" },
  headerEmail: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 12, marginHorizontal: 20, marginTop: 48, marginBottom: 8 },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  section: { marginHorizontal: 20, marginTop: 24, gap: 10 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 4 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  menuDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  editField: { marginBottom: 16 },
  editLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 8, textTransform: "uppercase" },
  editInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 50 },
  editTextInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", height: 50 },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
});
