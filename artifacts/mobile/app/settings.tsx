import { Feather } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PAYMENT_METHODS } from "@/constants/packages";
import { SUPPORT_EMAIL } from "@/constants/branding";
import { useAuth } from "@/context/AuthContext";
import { loadAppSettings, saveAppSettings, type AppSettings } from "@/lib/settings-storage";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.fullname ?? "");
  const [editEmail, setEditEmail] = useState(user?.email ?? "");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    loadAppSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (user) {
      setEditName(user.fullname);
      setEditEmail(user.email);
    }
  }, [user]);

  async function toggleSetting(key: keyof AppSettings, value: boolean) {
    const next = await saveAppSettings({ [key]: value });
    setSettings(next);
  }

  async function handleContactsToggle(value: boolean) {
    if (value) {
      const permission = await Contacts.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission refusée", "Autorisez l'accès aux contacts dans les réglages du téléphone.");
        return;
      }
    }
    await toggleSetting("contactsImportEnabled", value);
  }

  async function handleSaveProfile() {
    if (!editName.trim()) return;
    await updateUser({ fullname: editName, email: editEmail });
    setEditModal(false);
  }

  if (!user || !settings) return null;

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
          <Text style={[styles.title, { color: colors.foreground }]}>Paramètres</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primary20 }]}>
            <Feather name="user" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>{user.fullname}</Text>
            <Text style={[styles.heroDesc, { color: colors.mutedForeground }]}>
              Solde : {user.walletBalance.toLocaleString("fr-CI")} FCFA
            </Text>
          </View>
        </View>

        <Text style={[styles.groupTitle, { color: colors.mutedForeground }]}>Compte</Text>
        <SettingsRow
          icon="user"
          label="Informations personnelles"
          desc={`${user.phone}${user.email ? ` · ${user.email}` : ""}`}
          onPress={() => setEditModal(true)}
          colors={colors}
        />
        <SettingsRow
          icon="lock"
          label="Mot de passe"
          desc="Contactez le support pour réinitialiser"
          onPress={() => Alert.alert("Mot de passe", `Écrivez à ${SUPPORT_EMAIL} pour changer votre mot de passe.`)}
          colors={colors}
        />

        <Text style={[styles.groupTitle, { color: colors.mutedForeground }]}>Notifications</Text>
        <ToggleRow
          title="Notifications actives"
          desc="Confirmations d'achat et alertes"
          value={settings.notificationsEnabled}
          onValueChange={(value) => toggleSetting("notificationsEnabled", value)}
          colors={colors}
        />
        <ToggleRow
          title="Alertes de transaction"
          desc="Reçus après chaque paiement"
          value={settings.transactionAlertsEnabled}
          onValueChange={(value) => toggleSetting("transactionAlertsEnabled", value)}
          colors={colors}
        />

        <Text style={[styles.groupTitle, { color: colors.mutedForeground }]}>Paiements</Text>
        <View style={[styles.methodsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PAYMENT_METHODS.filter((method) => method.id !== "wallet").map((method, index, rows) => (
            <View
              key={method.id}
              style={[
                styles.methodRow,
                index < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.methodLabel, { color: colors.foreground }]}>{method.label}</Text>
              <Text style={[styles.methodStatus, { color: colors.success }]}>Disponible</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.rechargeBtn}
            onPress={() => router.push("/recharge")}
            activeOpacity={0.8}
          >
            <Feather name="plus-circle" size={16} color={colors.primary} />
            <Text style={[styles.rechargeBtnText, { color: colors.primary }]}>Recharger via Paystack (+1 %)</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.groupTitle, { color: colors.mutedForeground }]}>Application</Text>
        <ToggleRow
          title="Contacts du téléphone"
          desc="Import rapide lors des achats"
          value={settings.contactsImportEnabled}
          onValueChange={handleContactsToggle}
          colors={colors}
        />
        <SettingsRow
          icon="help-circle"
          label="Centre d'aide"
          desc={SUPPORT_EMAIL}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          colors={colors}
        />
        <SettingsRow
          icon="shield"
          label="Confidentialité"
          desc="Vos données sont chiffrées et sécurisées"
          onPress={() => Alert.alert("Confidentialité", "TapTenPass ne partage pas vos données sans consentement.")}
          colors={colors}
        />
      </ScrollView>

      <Modal visible={editModal} transparent animationType="slide" onRequestClose={() => setEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Informations personnelles</Text>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Nom complet</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
            />
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Email</Text>
            <TextInput
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
            />
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveProfile}>
              <Text style={styles.saveBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  desc,
  onPress,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  desc: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <TouchableOpacity
      style={[styles.itemRow, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.itemIcon, { backgroundColor: colors.muted }]}>
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.itemDesc, { color: colors.mutedForeground }]}>{desc}</Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function ToggleRow({
  title,
  desc,
  value,
  onValueChange,
  colors,
}: {
  title: string;
  desc: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemLabel, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.itemDesc, { color: colors.mutedForeground }]}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.muted, true: colors.primary20 }}
        thumbColor={colors.primary}
      />
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
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },
  heroIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  heroDesc: { fontSize: 13, fontFamily: "Inter_400Regular" },
  groupTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  itemIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  itemLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  itemDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  methodsCard: {
    marginHorizontal: 20,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
    overflow: "hidden",
  },
  methodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  methodLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  methodStatus: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  rechargeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
  },
  rechargeBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
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
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
});
