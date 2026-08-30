import {
  ShoppingCart, Apple, SprayCan, Wine, Home, Car, Utensils, HeartPulse, Gamepad2, GraduationCap,
  Receipt, Wallet, CircleEllipsis, Bus, Fuel, Shirt, Gift, Dog, Baby, Plane, Dumbbell, Smartphone,
  Wifi, Zap, Droplets, Tv, Coffee, Pizza, Beef, Milk, Pill, Scissors, Music, Ticket, Book, Briefcase,
  PiggyBank, TrendingUp, HandCoins, Landmark, Bike, ParkingCircle, Hammer, Sofa, Flower2, Cat, Cake,
  House, CupSoda, PartyPopper, Banknote, Tag,
  type LucideIcon,
} from "lucide-react";

/** Conjunto curado de ícones para categorias (nome kebab-case → componente). Inclui os padrões da API. */
export const ICONES: Record<string, LucideIcon> = {
  "shopping-cart": ShoppingCart,
  house: House,
  "cup-soda": CupSoda,
  "party-popper": PartyPopper,
  banknote: Banknote,
  tag: Tag,
  apple: Apple,
  "spray-can": SprayCan,
  wine: Wine,
  home: Home,
  car: Car,
  utensils: Utensils,
  "heart-pulse": HeartPulse,
  "gamepad-2": Gamepad2,
  "graduation-cap": GraduationCap,
  receipt: Receipt,
  wallet: Wallet,
  "circle-ellipsis": CircleEllipsis,
  bus: Bus,
  fuel: Fuel,
  shirt: Shirt,
  gift: Gift,
  dog: Dog,
  cat: Cat,
  baby: Baby,
  plane: Plane,
  dumbbell: Dumbbell,
  smartphone: Smartphone,
  wifi: Wifi,
  zap: Zap,
  droplets: Droplets,
  tv: Tv,
  coffee: Coffee,
  pizza: Pizza,
  beef: Beef,
  milk: Milk,
  pill: Pill,
  scissors: Scissors,
  music: Music,
  ticket: Ticket,
  book: Book,
  briefcase: Briefcase,
  "piggy-bank": PiggyBank,
  "trending-up": TrendingUp,
  "hand-coins": HandCoins,
  landmark: Landmark,
  bike: Bike,
  "parking-circle": ParkingCircle,
  hammer: Hammer,
  sofa: Sofa,
  "flower-2": Flower2,
  cake: Cake,
};

export const NOMES_ICONES = Object.keys(ICONES);

export const CORES_CATEGORIA = [
  "#0e9f6e", "#2fd6a2", "#16a34a", "#84cc16", "#eab308", "#f59e0b", "#f97316", "#ef4444",
  "#ec4899", "#d946ef", "#a855f7", "#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6",
  "#78716c", "#64748b",
];

export function obterIcone(nome: string | null | undefined): LucideIcon {
  return (nome && ICONES[nome]) || CircleEllipsis;
}
