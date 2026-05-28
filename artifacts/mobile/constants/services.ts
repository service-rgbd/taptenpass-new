import type { ImageSourcePropType } from "react-native";

export interface HomeService {
  id: string;
  label: string;
  icon: ImageSourcePropType;
  onPressKey: "transfer" | "offers" | "payment" | "loan" | "hub" | "subscriptions";
}

export const HOME_SERVICES: HomeService[] = [
  {
    id: "transfer",
    label: "Transfert",
    icon: require("../assets/images/services/service-transfer.png"),
    onPressKey: "transfer",
  },
  {
    id: "offers",
    label: "Offres",
    icon: require("../assets/images/services/service-offers.png"),
    onPressKey: "offers",
  },
  {
    id: "payment",
    label: "Paiement",
    icon: require("../assets/images/services/service-payment.png"),
    onPressKey: "payment",
  },
  {
    id: "loan",
    label: "Prêt",
    icon: require("../assets/images/services/service-loan.png"),
    onPressKey: "loan",
  },
  {
    id: "services",
    label: "Services",
    icon: require("../assets/images/services/service-hub.png"),
    onPressKey: "hub",
  },
  {
    id: "subscriptions",
    label: "Abonnements",
    icon: require("../assets/images/services/service-loan.png"),
    onPressKey: "subscriptions",
  },
];
