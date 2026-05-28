import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const DRAWER_WIDTH = Math.min(Dimensions.get("window").width * 0.82, 320);

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  user: { fullname: string; phone: string };
  initials: string;
  onLogout: () => void;
}

export default function SideDrawer({
  visible,
  onClose,
  user,
  initials,
  onLogout,
}: SideDrawerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(slide, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, slide, fade]);

  const items = [
    { icon: "home", label: "Accueil", onPress: onClose },
    {
      icon: "shopping-bag",
      label: "Acheter un forfait",
      onPress: () => {
        onClose();
        router.push("/(tabs)/buy");
      },
    },
    {
      icon: "clock",
      label: "Historique",
      onPress: () => {
        onClose();
        router.push("/(tabs)/history");
      },
    },
    {
      icon: "settings",
      label: "Paramètres",
      onPress: () => {
        onClose();
        router.push("/settings");
      },
    },
    {
      icon: "help-circle",
      label: "Aide",
      onPress: () => {
        onClose();
        router.push("/(tabs)/profile");
      },
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            {
              width: DRAWER_WIDTH,
              paddingTop: insets.top + 18,
              paddingBottom: insets.bottom + 20,
              backgroundColor: colors.card,
              shadowColor: colors.shadow,
              transform: [{ translateX: slide }],
            },
          ]}
        >
          <View style={[styles.brandStrip, { backgroundColor: colors.primary }]}>
            <Text style={styles.brandText}>TAPTENPASS</Text>
          </View>

          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
              <Text style={[styles.avatarText, { color: colors.foreground }]}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.foreground }]}>{user.fullname}</Text>
              <Text style={[styles.phone, { color: colors.mutedForeground }]}>{user.phone}</Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.background }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Feather name="x" size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={styles.items}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.item, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={item.onPress}
                activeOpacity={0.75}
              >
                <View style={[styles.itemIcon, { backgroundColor: colors.card }]}>
                  <Feather name={item.icon as never} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.itemLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.logout, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "30" }]}
            onPress={onLogout}
            activeOpacity={0.75}
          >
            <Feather name="log-out" size={16} color={colors.destructive} />
            <Text style={[styles.logoutText, { color: colors.destructive }]}>Se déconnecter</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
  },
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 16,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 12,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  brandStrip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 18,
  },
  brandText: {
    color: "#FFF",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  name: { fontSize: 16, fontFamily: "Inter_700Bold" },
  phone: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  items: { gap: 10, flex: 1 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 14,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  logout: {
    marginTop: 12,
    borderRadius: 14,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  logoutText: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
