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
import { APP_NAME, APP_TAGLINE, SUPPORT_EMAIL } from "@/constants/branding";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

interface MenuItemProps {
  emoji: string;
  label: string;
  desc?: string;
  onPress: () => void;
  destructive?: boolean;
  last?: boolean;
}

function MenuItem({ emoji, label, desc, onPress, destructive, last }: MenuItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
        <Text style={styles.menuEmoji}>{emoji}</Text>
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
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerTop, { paddingTop: topPad + 12, paddingHorizontal: 20 }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <View style={[styles.profileCard, { marginHorizontal: 20, backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.muted }]}>
            <Text style={[styles.avatarInitials, { color: colors.foreground }]}>{initials}</Text>
          </View>
          <View style={styles.profileMain}>
            <Text style={[styles.headerName, { color: colors.foreground }]}>{user.fullname}</Text>
            <Text style={[styles.headerPhone, { color: colors.foreground }]}>{user.phone}</Text>
          </View>
          <TouchableOpacity
            style={[styles.profileBtn, { backgroundColor: colors.background }]}
            onPress={() => {
              setEditName(user.fullname);
              setEditEmail(user.email);
              setEditModal(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.profileBtnText, { color: colors.foreground }]}>Mon profil</Text>
            <Feather name="chevron-right" size={16} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <View style={[styles.sponsorCard, { marginHorizontal: 20, backgroundColor: colors.primary20 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sponsorTitle, { color: colors.foreground }]}>
              Invitez vos proches et gagnez une surprise
            </Text>
            <Text style={[styles.sponsorCode, { color: colors.foreground }]}>
              Code parrainage: <Text style={{ fontFamily: "Inter_700Bold" }}>TPP{initials}</Text>
            </Text>
            <TouchableOpacity style={[styles.sponsorBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
              <Text style={styles.sponsorBtnText}>Parrainer un proche</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sponsorVisual}>
            <Text style={styles.sponsorEmoji}>🎁</Text>
          </View>
        </View>

        <View style={[styles.statsRow, { borderColor: colors.border, marginHorizontal: 20, backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{successCount}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Achats réussis</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{totalSpent.toLocaleString("fr-CI")}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>FCFA dépensés</Text>
          </View>
        </View>

        <View style={[styles.menuBlock, { marginHorizontal: 20 }]}>
          <MenuItem
            emoji="✏️"
            label="Paramètres"
            desc="Profil, email, mot de passe"
            onPress={() => {
              setEditName(user.fullname);
              setEditEmail(user.email);
              setEditModal(true);
            }}
          />
          <MenuItem
            emoji="🔔"
            label="Notifications"
            onPress={() => Alert.alert("Bientôt disponible", "Les notifications seront configurables bientôt.")}
          />
          <MenuItem
            emoji="🏪"
            label="Trouver une agence"
            onPress={() => Alert.alert("Bientôt", "La recherche d'agence sera ajoutée prochainement.")}
          />
          <MenuItem
            emoji="🎧"
            label="Aide et assistance"
            desc={SUPPORT_EMAIL}
            onPress={() => Alert.alert("Aide", `Contactez-nous à ${SUPPORT_EMAIL}`)}
          />
          <MenuItem
            emoji="💸"
            label="Tarifs"
            desc={`${APP_NAME} · v1.0.0`}
            onPress={() => Alert.alert(APP_NAME, `${APP_TAGLINE}\nVersion 1.0.0`)}
            last
          />
        </View>

        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.card }]} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={[styles.logoutText, { color: colors.foreground }]}>Se déconnecter</Text>
        </TouchableOpacity>
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
              <View style={[styles.editInput, { borderColor: colors.border }]}>
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
              <View style={[styles.editInput, { borderColor: colors.border }]}>
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
  headerTop: { marginBottom: 16 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontSize: 18, fontFamily: "Inter_700Bold" },
  profileMain: { flex: 1, marginLeft: 12 },
  headerName: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  headerPhone: { fontSize: 15, fontFamily: "Inter_500Medium" },
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },
  profileBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sponsorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,
  },
  sponsorTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", lineHeight: 22, marginBottom: 8 },
  sponsorCode: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 12 },
  sponsorBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  sponsorBtnText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_700Bold" },
  sponsorVisual: { marginLeft: 12 },
  sponsorEmoji: { fontSize: 52, lineHeight: 58 },
  statsRow: {
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: StyleSheet.hairlineWidth, alignSelf: "stretch" },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  menuBlock: { marginTop: 8 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 14,
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  menuEmoji: { fontSize: 20, lineHeight: 24 },
  menuLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  menuDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  logoutBtn: {
    alignSelf: "center",
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
  },
  logoutText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  editInput: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingHorizontal: 14, height: 50 },
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
