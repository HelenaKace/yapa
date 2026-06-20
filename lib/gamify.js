// Pure, client-safe gamification logic derived from the user's order history.
import { OFFER_MAP, PACKAGE_MAP, CATEGORY_MAP, PROVIDER_MAP } from "./seed.js";

export const LEVELS = [
  { id: "Explorer", min: 0, emoji: "🧭", grad: "grad-blue" },
  { id: "Insider", min: 200, emoji: "🌟", grad: "grad-grape" },
  { id: "VIP", min: 500, emoji: "💎", grad: "grad-hero" },
  { id: "Legend", min: 1000, emoji: "👑", grad: "grad-sun" },
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
export function orderLines(orders, statuses = ["approved"]) {
  const lines = [];
  for (const o of orders) {
    if (!statuses.includes(o.status)) continue;
    for (const it of o.items) {
      const ids = it.kind === "package" ? (PACKAGE_MAP[it.id]?.offerIds || []) : [it.id];
      for (const oid of ids) if (OFFER_MAP[oid]) lines.push(OFFER_MAP[oid]);
    }
  }
  return lines;
}

export function summarize(orders) {
  const approved = orders.filter((o) => o.status === "approved");
  const lines = orderLines(orders);
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
  const hasPackage = approved.some((o) => o.items.some((i) => i.kind === "package"));
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
    topCat: topCat ? { category: topCat[0], amount: topCat[1], label: CATEGORY_MAP[topCat[0]]?.en, emoji: CATEGORY_MAP[topCat[0]]?.emoji } : null,
    topProvider: topProvider ? { name: PROVIDER_MAP[topProvider[0]]?.name, emoji: PROVIDER_MAP[topProvider[0]]?.emoji, amount: topProvider[1] } : null,
  };
}

export function achievements(orders, streakWeeks = 0) {
  const s = summarize(orders);
  const defs = [
    { id: "first", title: "First Benefit", emoji: "🎟️", desc: "Claim your first perk", unlocked: s.approvedCount >= 1 },
    { id: "bundle", title: "Bundle Master", emoji: "🎁", desc: "Approve a multi-provider bundle", unlocked: s.hasPackage },
    { id: "wellness", title: "Wellness Hero", emoji: "🧘", desc: "Enjoy 3 wellness perks", unlocked: s.wellnessCount >= 3 },
    { id: "savings", title: "Savings Expert", emoji: "💰", desc: "20,000 L+ in benefits", unlocked: s.total >= 20000 },
    { id: "travel", title: "Globetrotter", emoji: "✈️", desc: "Book a travel benefit", unlocked: s.cats.has("travel") },
    { id: "foodie", title: "Foodie", emoji: "🍷", desc: "Treat yourself to dining", unlocked: s.cats.has("food") },
    { id: "streak", title: "Streak Star", emoji: "🔥", desc: "Reach a 3-week streak", unlocked: streakWeeks >= 3 },
    { id: "explorer", title: "Category Explorer", emoji: "🧭", desc: "Explore 4 categories", unlocked: s.cats.size >= 4 },
  ];
  return defs;
}
