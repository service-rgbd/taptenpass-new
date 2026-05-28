import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import type { Transaction } from "@/types";

type Filter = "all" | "success" | "pending" | "failed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "success", label: "Réussis" },
  { id: "pending", label: "En cours" },
  { id: "failed", label: "Échoués" },
];

function formatDateLabel(iso: string) {
  const txDate = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const txKey = txDate.toDateString();
  if (txKey === today.toDateString()) return "Aujourd'hui";
  if (txKey === yesterday.toDateString()) return "Hier";
  return txDate.toLocaleDateString("fr-CI", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-CI", { hour: "2-digit", minute: "2-digit" });
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions } = useData();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.status === filter);
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const key = formatDateLabel(tx.createdAt);
      const list = map.get(key) ?? [];
      list.push(tx);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const statusColors = {
    success: colors.success,
    pending: colors.secondary,
    failed: colors.destructive,
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 14 }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Historique</Text>

        <View style={[styles.balanceStrip, { backgroundColor: colors.primary20 }]}>
          <Feather name="eye-off" size={18} color={colors.mutedForeground} />
          <Text style={[styles.balanceValue, { color: colors.foreground }]}>9 FCFA</Text>
          <Text style={[styles.balanceLabel, { color: colors.foreground }]}>Solde cumule</Text>
        </View>

        <View style={[styles.dateCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <Text style={[styles.dateText, { color: colors.foreground }]}>Date début : 25/04/2026</Text>
          <Text style={[styles.dateText, { color: colors.foreground }]}>Date fin : 26/05/2026</Text>
          <Feather name="calendar" size={18} color={colors.foreground} />
        </View>

        <View style={styles.filtersRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f.id ? colors.primary : colors.background,
                  borderColor: filter === f.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(f.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: filter === f.id ? "#FFF" : colors.mutedForeground },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {!grouped.length ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="inbox" size={34} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucune activité</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {filter === "all"
                ? "Vos transactions apparaîtront ici."
                : `Aucune transaction ${FILTERS.find((f) => f.id === filter)?.label.toLowerCase()}.`}
            </Text>
          </View>
        ) : (
          grouped.map(([label, items]) => (
            <View key={label} style={styles.dayGroup}>
              <Text style={[styles.dayLabel, { color: colors.foreground }]}>{label}</Text>

              {items.map((item, index) => {
                const statusColor = statusColors[item.status];
                const title = item.packageName ? "Achat de pass" : "Transaction";
                const emoji = item.packageName ? "📡" : "💸";

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.row,
                      index < items.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={() => setSelectedTx(item)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.rowIcon, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
                      <Text style={styles.rowEmoji}>{emoji}</Text>
                    </View>
                    <View style={styles.rowMain}>
                      <Text style={[styles.rowTitle, { color: colors.foreground }]}>{title}</Text>
                      <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                        {item.phone}
                        {item.data ? ` · ${item.data}` : ""}
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text
                        style={[
                          styles.rowAmount,
                          { color: item.status === "success" ? colors.success : item.status === "failed" ? colors.mutedForeground : colors.foreground },
                        ]}
                      >
                        {item.status === "success" ? "+" : "-"} {item.amount.toLocaleString("fr-CI")} Fcfa
                      </Text>
                      <View style={styles.rowMetaWrap}>
                        <Text style={[styles.rowTime, { color: colors.mutedForeground }]}>{formatTime(item.createdAt)}</Text>
                        {item.status === "failed" && (
                          <View style={[styles.statusBadge, { backgroundColor: "#FFE8E6" }]}>
                            <Text style={[styles.statusBadgeText, { color: colors.destructive }]}>Echec</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={!!selectedTx} transparent animationType="slide" onRequestClose={() => setSelectedTx(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.detailsSheet, { backgroundColor: colors.card }]}>
            <View style={styles.detailsHeader}>
              <Text style={[styles.detailsTitle, { color: colors.foreground }]}>Details de la transaction</Text>
              <TouchableOpacity onPress={() => setSelectedTx(null)} activeOpacity={0.7}>
                <Feather name="x" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {selectedTx && (
              <View style={styles.detailsContent}>
                {[
                  { label: "Reference", value: selectedTx.transactionReference || "--" },
                  { label: "Operateur", value: selectedTx.operator },
                  { label: "Numero", value: selectedTx.phone },
                  { label: "Forfait", value: selectedTx.packageName || selectedTx.data },
                  { label: "Montant", value: `${selectedTx.amount.toLocaleString("fr-CI")} FCFA` },
                  { label: "Paiement", value: selectedTx.paymentMethod },
                  { label: "Date", value: formatDateLabel(selectedTx.createdAt) },
                  { label: "Heure", value: formatTime(selectedTx.createdAt) },
                  {
                    label: "Statut",
                    value:
                      selectedTx.status === "success"
                        ? "Reussi"
                        : selectedTx.status === "pending"
                          ? "En cours"
                          : "Echoue",
                  },
                ].map((row, index, rows) => (
                  <View
                    key={row.label}
                    style={[
                      styles.detailRow,
                      index < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                    <Text style={[styles.detailValue, { color: colors.foreground }]}>{row.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  pageTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 2 },
  balanceStrip: {
    marginTop: 16,
    marginBottom: 14,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balanceValue: { fontSize: 16, fontFamily: "Inter_700Bold", flex: 1 },
  balanceLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  dateCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  dateText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  filtersRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 14,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  dayGroup: { marginBottom: 26 },
  dayLabel: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  rowIcon: {
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
  rowEmoji: { fontSize: 20, lineHeight: 24 },
  rowMain: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rowSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  rowRight: { alignItems: "flex-end", gap: 3 },
  rowAmount: { fontSize: 13, fontFamily: "Inter_700Bold" },
  rowMetaWrap: { alignItems: "flex-end", gap: 4 },
  rowTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.24)",
    justifyContent: "flex-end",
  },
  detailsSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "72%",
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  detailsTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  detailsContent: {
    borderRadius: 18,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  detailLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", maxWidth: "58%", textAlign: "right" },
});
