import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TransactionItem from "@/components/TransactionItem";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import type { Transaction } from "@/types";

type Filter = "all" | "success" | "pending" | "failed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "success", label: "Réussis" },
  { id: "pending", label: "En attente" },
  { id: "failed", label: "Échoués" },
];

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions } = useData();
  const [filter, setFilter] = useState<Filter>("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.status === filter);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, paddingTop: topPad + 16, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Historique</Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
        </Text>

        <View style={styles.filtersRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f.id ? colors.primary : colors.muted,
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

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={[styles.emptyState]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="inbox" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Aucune transaction
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {filter === "all"
                ? "Vos transactions apparaîtront ici"
                : `Aucune transaction "${FILTERS.find((f) => f.id === filter)?.label.toLowerCase()}"`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  pageTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 2 },
  pageSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  filtersRow: { flexDirection: "row", gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
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
});
