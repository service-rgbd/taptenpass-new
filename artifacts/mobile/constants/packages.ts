import type { Package } from "@/types";

export const PACKAGES: Package[] = [
  { id: "o1", operator: "Orange", name: "1 Go", data: "1 Go", price: 1000, validity: "24 heures" },
  { id: "o2", operator: "Orange", name: "5 Go", data: "5 Go", price: 5000, validity: "7 jours" },
  { id: "o3", operator: "Orange", name: "20 Go", data: "20 Go", price: 15000, validity: "30 jours" },
  { id: "o4", operator: "Orange", name: "50 Go", data: "50 Go", price: 25000, validity: "30 jours" },
  { id: "m1", operator: "MTN", name: "1 Go", data: "1 Go", price: 900, validity: "24 heures" },
  { id: "m2", operator: "MTN", name: "5 Go", data: "5 Go", price: 4500, validity: "7 jours" },
  { id: "m3", operator: "MTN", name: "20 Go", data: "20 Go", price: 14000, validity: "30 jours" },
  { id: "m4", operator: "MTN", name: "50 Go", data: "50 Go", price: 24000, validity: "30 jours" },
  { id: "mv1", operator: "Moov", name: "1 Go", data: "1 Go", price: 800, validity: "24 heures" },
  { id: "mv2", operator: "Moov", name: "5 Go", data: "5 Go", price: 4000, validity: "7 jours" },
  { id: "mv3", operator: "Moov", name: "20 Go", data: "20 Go", price: 13000, validity: "30 jours" },
  { id: "mv4", operator: "Moov", name: "50 Go", data: "50 Go", price: 22000, validity: "30 jours" },
];

export const PAYMENT_METHODS = [
  {
    id: "wallet",
    label: "Mon solde TapTenPass",
    icon: "briefcase" as const,
  },
  {
    id: "wave",
    label: "Wave",
    logo: require("../assets/images/operators/icon-wave.png"),
  },
  {
    id: "orange_money",
    label: "Orange Money",
    logo: require("../assets/images/operators/orange.png"),
  },
  {
    id: "mtn_money",
    label: "MTN Money",
    logo: require("../assets/images/operators/mtn.png"),
  },
  {
    id: "card",
    label: "Carte bancaire",
    icon: "credit-card" as const,
  },
];

export const OPERATOR_COLORS: Record<string, string> = {
  Orange: "#FF6600",
  MTN: "#FFCC00",
  Moov: "#0055B3",
};
