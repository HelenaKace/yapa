"use client";
import {
  Dumbbell, Flower2, Utensils, Plane, GraduationCap, Stethoscope, Smartphone,
  ShoppingBag, Car, Sparkles, Rocket, Check, Flame, Star, Trophy, Gem, Crown,
  Compass, Ticket, Gift, Wallet, PiggyBank, Wine, Link2, Clapperboard, Sun,
  ShoppingCart, Bell, RotateCcw, SendHorizontal, X, Wand2, Play, User, Building2,
  Store, BadgeCheck, Globe, Leaf, Target, Users, Laptop, Mountain, BookOpen,
  HeartPulse, Drama, Handshake, ChevronRight, ArrowRight, ArrowLeft, Heart, MapPin,
  Plus, CreditCard, Receipt, TrendingUp, BarChart3, Lightbulb, Clock, Hand, Building,
  Palette,
} from "lucide-react";

// Central registry — reference icons by stable string name so data files
// (seed, gamify) stay free of JSX.
const REGISTRY = {
  // categories
  fitness: Dumbbell,
  wellness: Flower2,
  food: Utensils,
  travel: Plane,
  learning: GraduationCap,
  health: Stethoscope,
  telecom: Smartphone,
  retail: ShoppingBag,
  transport: Car,
  family: Users,
  // ui / semantic
  sparkles: Sparkles,
  rocket: Rocket,
  check: Check,
  "badge-check": BadgeCheck,
  flame: Flame,
  star: Star,
  trophy: Trophy,
  gem: Gem,
  crown: Crown,
  compass: Compass,
  ticket: Ticket,
  gift: Gift,
  wallet: Wallet,
  savings: PiggyBank,
  wine: Wine,
  link: Link2,
  film: Clapperboard,
  sun: Sun,
  cart: ShoppingCart,
  bell: Bell,
  reset: RotateCcw,
  send: SendHorizontal,
  close: X,
  wand: Wand2,
  play: Play,
  user: User,
  employer: Building2,
  provider: Store,
  globe: Globe,
  leaf: Leaf,
  target: Target,
  users: Users,
  laptop: Laptop,
  mountain: Mountain,
  book: BookOpen,
  heart: HeartPulse,
  drama: Drama,
  handshake: Handshake,
  chevron: ChevronRight,
  arrow: ArrowRight,
  back: ArrowLeft,
  like: Heart,
  pin: MapPin,
  plus: Plus,
  card: CreditCard,
  receipt: Receipt,
  trending: TrendingUp,
  chart: BarChart3,
  insight: Lightbulb,
  clock: Clock,
  hand: Hand,
  building: Building,
  palette: Palette,
};

export function Ico({ name, className = "", size, strokeWidth = 2 }) {
  const Cmp = REGISTRY[name] || Sparkles;
  return <Cmp className={className} size={size} strokeWidth={strokeWidth} />;
}

// category id -> icon name (categories already share names with registry keys)
export function CategoryIcon({ id, className, size }) {
  return <Ico name={id} className={className} size={size} />;
}

// map a provider to its category icon
import { PROVIDER_MAP } from "@/lib/seed";
export function ProviderIcon({ id, className, size }) {
  const cat = PROVIDER_MAP[id]?.category || "retail";
  return <Ico name={cat} className={className} size={size} />;
}

// package theme -> icon name
const PKG_THEME = { wellness: "wellness", food: "wine", travel: "travel", learning: "book", family: "users" };
export function PackageIcon({ theme, className, size }) {
  return <Ico name={PKG_THEME[theme] || "gift"} className={className} size={size} />;
}
