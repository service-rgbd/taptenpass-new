export interface MarketplaceProvider {
  id: string;
  name: string;
  description: string;
  rating: number;
  location: string;
  priceFromFcfa: number;
}

export interface MarketplaceService {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: "tv" | "film" | "gift" | "shopping-bag" | "coffee" | "home";
  providers: MarketplaceProvider[];
}

export const MARKETPLACE_SERVICES: MarketplaceService[] = [
  {
    id: "canal-plus",
    name: "Canal+",
    category: "tv",
    description: "Abonnements TV, bouquets sport et divertissement.",
    icon: "tv",
    providers: [
      {
        id: "canal-default",
        name: "Canal+ Côte d'Ivoire",
        description: "Activation rapide des formules Access, Evasion et Tout Canal.",
        rating: 4.8,
        location: "Abidjan",
        priceFromFcfa: 5000,
      },
    ],
  },
  {
    id: "netflix",
    name: "Netflix",
    category: "streaming",
    description: "Abonnements Netflix avec renouvellement mensuel.",
    icon: "film",
    providers: [
      {
        id: "netflix-default",
        name: "Netflix Premium CI",
        description: "Formules Standard et Premium avec support local.",
        rating: 4.7,
        location: "National",
        priceFromFcfa: 4500,
      },
    ],
  },
  {
    id: "carte-cadeau",
    name: "Carte Cadeau",
    category: "gift",
    description: "Cartes cadeaux numériques pour vos proches.",
    icon: "gift",
    providers: [
      {
        id: "gift-default",
        name: "TapTenPass Gift",
        description: "Cartes cadeaux rechargeables et personnalisables.",
        rating: 4.9,
        location: "National",
        priceFromFcfa: 2000,
      },
    ],
  },
  {
    id: "pressing",
    name: "Pressing",
    category: "laundry",
    description: "Nettoyage et repassage avec livraison.",
    icon: "shopping-bag",
    providers: [
      {
        id: "pressing-cocody",
        name: "Pressing Cocody Express",
        description: "Collecte et livraison sous 24h.",
        rating: 4.5,
        location: "Cocody, Abidjan",
        priceFromFcfa: 1500,
      },
      {
        id: "pressing-plateau",
        name: "Pressing Plateau Pro",
        description: "Service premium pour chemises et costumes.",
        rating: 4.6,
        location: "Plateau, Abidjan",
        priceFromFcfa: 2500,
      },
    ],
  },
  {
    id: "restaurant",
    name: "Restaurant",
    category: "food",
    description: "Commandes et réservations auprès de restaurants partenaires.",
    icon: "coffee",
    providers: [
      {
        id: "resto-maquis",
        name: "Maquis Teranga",
        description: "Plats ivoiriens et livraison rapide.",
        rating: 4.4,
        location: "Marcory, Abidjan",
        priceFromFcfa: 3000,
      },
      {
        id: "resto-grill",
        name: "Grill City",
        description: "Grillades, burgers et menus familiaux.",
        rating: 4.3,
        location: "Yopougon, Abidjan",
        priceFromFcfa: 3500,
      },
    ],
  },
  {
    id: "femmes-de-menage",
    name: "Femmes de ménage",
    category: "home",
    description: "Ménage à domicile par des prestataires vérifiés.",
    icon: "home",
    providers: [
      {
        id: "menage-pro",
        name: "Ménage Pro CI",
        description: "Interventions ponctuelles ou abonnement hebdomadaire.",
        rating: 4.7,
        location: "Abidjan",
        priceFromFcfa: 8000,
      },
      {
        id: "menage-express",
        name: "Clean Express",
        description: "Nettoyage complet en 2 à 4 heures.",
        rating: 4.5,
        location: "Abidjan & Bingerville",
        priceFromFcfa: 6000,
      },
    ],
  },
];

export function getMarketplaceService(id: string) {
  return MARKETPLACE_SERVICES.find((service) => service.id === id);
}
