// Pure, client-safe gamification logic derived from the user's order history.
import { CATEGORY_MAP, PROVIDER_MAP } from "./seed.js";
import { offerMapFor } from "./catalog.js";
import { offerIdsForItem } from "./orders.js";

export const LEVELS = [
  { id: "Explorer", min: 0, icon: "compass", grad: "grad-blue" },
  { id: "Insider", min: 200, icon: "star", grad: "grad-grape" },
  { id: "VIP", min: 500, icon: "gem", grad: "grad-hero" },
  { id: "Legend", min: 1000, icon: "crown", grad: "grad-sun" },
];

export function levelFor(points = 0) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (points >= l.min) current = l;
  const idx = LEVELS.indexOf(current);
  const next = LEVELS[idx + 1] || null;
  const floor = current.min;
  const ceil = next ? next.min : current.min + 500;
  const pct = Math.max(0, Math.min(1, (points - floor) / (ceil - floor)));
  return { current, next, pct, toNext: next ? Math.max(0, next.min - points) : 0 };
}

// Expand an order into individual offer lines.
export function orderLines(orders, catalog, statuses = ["approved"]) {
  const offers = offerMapFor(catalog);
  const lines = [];
  for (const o of orders) {
    if (!statuses.includes(o.status)) continue;
    for (const it of o.items) {
      const ids = offerIdsForItem(it, catalog);
      for (const oid of ids) if (offers[oid]) lines.push(offers[oid]);
    }
  }
  return lines;
}

export function summarize(orders, catalog) {
  const approved = orders.filter((o) => o.status === "approved");
  const lines = orderLines(orders, catalog);
  const byCat = {};
  const byProvider = {};
  let total = 0;
  let wellnessCount = 0;
  const cats = new Set();
  for (const o of lines) {
    byCat[o.category] = (byCat[o.category] || 0) + o.priceALL;
    byProvider[o.providerId] = (byProvider[o.providerId] || 0) + o.priceALL;
    total += o.priceALL;
    cats.add(o.category);
    if (["wellness", "fitness", "health"].includes(o.category)) wellnessCount++;
  }
  const hasPackage = approved.some((o) => o.items.some((i) => i.type === "package"));
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  const topProvider = Object.entries(byProvider).sort((a, b) => b[1] - a[1])[0];
  const wellnessScore = lines.length ? Math.round((wellnessCount / lines.length) * 100) : 0;
  return {
    approvedCount: approved.length,
    lineCount: lines.length,
    total,
    cats,
    byCat,
    hasPackage,
    wellnessCount,
    wellnessScore,
    topCat: topCat ? { category: topCat[0], amount: topCat[1], label: CATEGORY_MAP[topCat[0]]?.en, icon: topCat[0] } : null,
    topProvider: topProvider ? { name: PROVIDER_MAP[topProvider[0]]?.name, icon: PROVIDER_MAP[topProvider[0]]?.category, amount: topProvider[1] } : null,
  };
}

export function achievements(orders, streakWeeks = 0, catalog) {
  const s = summarize(orders, catalog);
  const defs = [
    { id: "first", title: "First Benefit", icon: "ticket", desc: "Claim your first perk", unlocked: s.approvedCount >= 1 },
    { id: "bundle", title: "Bundle Master", icon: "gift", desc: "Approve a multi-provider bundle", unlocked: s.hasPackage },
    { id: "wellness", title: "Wellness Hero", icon: "wellness", desc: "Enjoy 3 wellness perks", unlocked: s.wellnessCount >= 3 },
    { id: "savings", title: "Savings Expert", icon: "savings", desc: "20,000 L+ in benefits", unlocked: s.total >= 20000 },
    { id: "travel", title: "Globetrotter", icon: "travel", desc: "Book a travel benefit", unlocked: s.cats.has("travel") },
    { id: "foodie", title: "Foodie", icon: "wine", desc: "Treat yourself to dining", unlocked: s.cats.has("food") },
    { id: "streak", title: "Streak Star", icon: "flame", desc: "Reach a 3-week streak", unlocked: streakWeeks >= 3 },
    { id: "explorer", title: "Category Explorer", icon: "compass", desc: "Explore 4 categories", unlocked: s.cats.size >= 4 },
  ];
  return defs;
}
