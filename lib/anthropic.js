// Real Claude integration for YAPA. Server-only (uses the API key).
// Every AI feature funnels through here. If the key is missing or a call fails,
// we degrade to a deterministic local heuristic so the demo never dies — but
// the primary, intended path is genuine Claude reasoning over the live catalog.
import Anthropic from "@anthropic-ai/sdk";
import { activeOffers, catalogForAI, offerMapFor, packageMapFor } from "./catalog.js";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export function aiEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let _client = null;
function client() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

function extractJSON(text) {
  if (!text) return null;
  // strip code fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function callClaude({ system, messages, max_tokens = 1100 }) {
  const resp = await client().messages.create({
    model: MODEL,
    max_tokens,
    system,
    messages,
  });
  const text = resp.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return text;
}

function catalogBlock(catalog) {
  const { offers, packages } = catalogForAI(catalog);
  return `OFFERS (id | title | category | price | provider | tags):\n${offers.join(
    "\n"
  )}\n\nPACKAGES (id | title | price | includes):\n${packages.join("\n")}`;
}

// ---------------------------------------------------------------------------
// 1) CONVERSATIONAL CONCIERGE
// ---------------------------------------------------------------------------
export async function concierge({ history, budgetLeftALL, catalog, lang = "en", userName = "there" }) {
  const system = `You are the YAPA Concierge — a warm, witty benefits buddy for employees in Albania. YAPA is a workplace benefits marketplace: the company funds the budget, the employee just picks what they love, and payment goes straight to providers.

Speak like a sharp, friendly colleague — short, upbeat, a little playful, never corporate. ${
    lang === "sq" ? "Reply in Albanian (Shqip)." : "Reply in English."
  } The employee's name is ${userName}. Their remaining welfare budget is ${budgetLeftALL} ALL — never recommend beyond it, and call out great value.

You can ONLY recommend items that exist in this catalog. Use exact ids.
${catalogBlock(catalog)}

Return ONLY a JSON object, no prose outside it:
{
  "reply": "1-3 sentences, conversational, addressed to the user",
  "recommendIds": ["o_... or pkg_...", up to 4, best first],
  "bundle": { "title": "short catchy name", "offerIds": ["o_...", ...] } | null,
  "vibe": "one of: relax | active | social | growth | escape | everyday | treat"
}
Only include a bundle when the user would benefit from combining 2-3 offers from different providers. Keep recommendIds tight and relevant to what they actually asked.`;

  const messages = history.map((m) => ({ role: m.role, content: m.content }));
  const text = await callClaude({ system, messages, max_tokens: 900 });
  const json = extractJSON(text);
  if (!json) throw new Error("concierge: no JSON");
  return sanitizeRecommendation(json, catalog);
}

// ---------------------------------------------------------------------------
// 2) PERSONALIZED HOME RECOMMENDATIONS
// ---------------------------------------------------------------------------
export async function recommendForUser({ user, budgetLeftALL, ownedOfferIds = [], catalog, lang = "en" }) {
  const system = `You are YAPA's personalization engine. Pick benefits an employee is most likely to love and explain why in one delightful line each.

Employee: ${user.name}, ${user.role}.${user.vibe ? ` Self-described vibe: ${user.vibe}.` : ""} Stated interests: ${user.interests.join(", ")}. Remaining budget: ${budgetLeftALL} ALL. Already chosen (avoid repeating): ${ownedOfferIds.join(", ") || "none"}.
${lang === "sq" ? "Write reasons in Albanian." : "Write reasons in English."}

Catalog:
${catalogBlock(catalog)}

Return ONLY JSON:
{
  "items": [ { "id": "o_... or pkg_...", "reason": "<=8 words, playful, personal" }, ... 4-6 items, best first ]
}
Mix categories, respect budget, prefer variety over repetition.`;
  const text = await callClaude({
    system,
    messages: [{ role: "user", content: "Give me my picks for this week." }],
    max_tokens: 700,
  });
  const json = extractJSON(text);
  if (!json || !Array.isArray(json.items)) throw new Error("recommend: bad JSON");
  const offers = offerMapFor(catalog);
  const packages = packageMapFor(catalog);
  json.items = json.items.filter((it) => offers[it.id] || packages[it.id]).slice(0, 6);
  return json;
}

// ---------------------------------------------------------------------------
// 3) SMART BUNDLE BUILDER (multi-provider package from a goal)
// ---------------------------------------------------------------------------
export async function buildBundle({ goal, budgetALL, catalog, lang = "en" }) {
  const system = `You are YAPA's smart bundler. Compose ONE package of 2-4 offers from DIFFERENT providers that together fulfil the user's goal within budget (${budgetALL} ALL). ${
    lang === "sq" ? "Use Albanian for text." : "Use English for text."
  }

Catalog:
${catalogBlock(catalog)}

Return ONLY JSON:
{
  "title": "catchy package name",
  "emoji": "single emoji",
  "pitch": "one sentence on why these go together",
  "offerIds": ["o_...", ...]
}
Only use offer ids (not package ids). Prefer offers from different providers. Stay within budget.`;
  const text = await callClaude({
    system,
    messages: [{ role: "user", content: `Build me a package for: ${goal}` }],
    max_tokens: 500,
  });
  const json = extractJSON(text);
  if (!json) throw new Error("bundle: no JSON");
  const offers = offerMapFor(catalog);
  json.offerIds = (json.offerIds || []).filter((id) => offers[id]).slice(0, 4);
  if (json.offerIds.length === 0) throw new Error("bundle: empty");
  json.priceALL = json.offerIds.reduce((s, id) => s + offers[id].priceALL, 0);
  return json;
}

// ---------------------------------------------------------------------------
// 4) EMPLOYER INSIGHTS
// ---------------------------------------------------------------------------
export async function employerInsights({ stats, lang = "en" }) {
  const system = `You are YAPA's analytics co-pilot for People Ops. Turn raw benefit-usage stats into 3 sharp, decision-ready insights. ${
    lang === "sq" ? "Write in Albanian." : "Write in English."
  } Be specific, reference categories/numbers, and suggest one concrete action per insight.

Return ONLY JSON:
{
  "headline": "one-line summary of how the program is doing",
  "insights": [ { "title": "short", "detail": "1 sentence with a number + a recommendation" }, x3 ]
}`;
  const text = await callClaude({
    system,
    messages: [{ role: "user", content: `Usage stats:\n${JSON.stringify(stats, null, 2)}` }],
    max_tokens: 600,
  });
  const json = extractJSON(text);
  if (!json) throw new Error("insights: no JSON");
  return json;
}

// ---------------------------------------------------------------------------
// helpers + fallbacks (so a missing key never breaks the demo flow)
// ---------------------------------------------------------------------------
function sanitizeRecommendation(json, catalog) {
  const offers = offerMapFor(catalog);
  const packages = packageMapFor(catalog);
  json.recommendIds = (json.recommendIds || [])
    .filter((id) => offers[id] || packages[id])
    .slice(0, 4);
  if (json.bundle) {
    json.bundle.offerIds = (json.bundle.offerIds || []).filter((id) => offers[id]).slice(0, 4);
    if (json.bundle.offerIds.length < 2) json.bundle = null;
  }
  return json;
}

// Deterministic fallback recommender used only when AI is unavailable.
export function heuristicRecommend({ user, budgetLeftALL, catalog }) {
  const cap = budgetLeftALL > 0 ? budgetLeftALL : Infinity;
  const offers = activeOffers(catalog);
  const affordable = offers.filter((o) => o.priceALL <= cap);
  const pool = affordable.length >= 4 ? affordable : offers;
  const scored = pool
    .map((o) => ({
      o,
      score:
        (user.interests.includes(o.category) ? 3 : 0) + (o.popular ? 1 : 0) + Math.random(),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  return {
    items: scored.map(({ o }) => ({
      id: o.id,
      reason: o.popular ? "Loved by your team" : `Great for ${o.tags[0]}`,
    })),
  };
}

export function heuristicConcierge({ text, budgetLeftALL, catalog }) {
  const q = (text || "").toLowerCase();
  const wants = (kw) => kw.some((k) => q.includes(k));
  let vibe = "everyday";
  if (wants(["relax", "calm", "stress", "tired", "unwind", "spa"])) vibe = "relax";
  else if (wants(["fit", "gym", "active", "workout", "strong"])) vibe = "active";
  else if (wants(["learn", "course", "grow", "skill", "career"])) vibe = "growth";
  else if (wants(["travel", "trip", "sea", "escape", "weekend"])) vibe = "escape";
  else if (wants(["food", "eat", "dinner", "lunch", "restaurant"])) vibe = "social";
  const cap = budgetLeftALL > 0 ? budgetLeftALL : Infinity; // never return empty when budget is tight
  const offers = activeOffers(catalog);
  let picks = offers.filter((o) => o.tags.includes(vibe) && o.priceALL <= cap);
  if (!picks.length) picks = offers.filter((o) => o.tags.includes(vibe));
  if (!picks.length) picks = offers.filter((o) => o.priceALL <= cap);
  if (!picks.length) picks = offers;
  const pool = picks.slice(0, 3);
  return {
    reply: `Here are a few ${vibe} ideas that fit your budget. (Add your ANTHROPIC_API_KEY to unlock the full conversational concierge.)`,
    recommendIds: pool.map((o) => o.id),
    bundle: null,
    vibe,
  };
}

export function heuristicInsights({ stats }) {
  const top = Object.entries(stats.byCategory || {}).sort((a, b) => b[1] - a[1])[0];
  const pending = stats.pendingLiabilityALL || 0;
  return {
    headline: pending > 0
      ? "Your team has pending benefit requests ready for approval."
      : "Your benefits program is live and being used.",
    insights: [
      { title: "Most-loved category", detail: `${top ? top[0] : "Wellness"} leads on committed spend; add one nearby offer next.` },
      { title: "Budget utilisation", detail: `${stats.utilisationPct || 0}% of welfare budget is committed this cycle.` },
      { title: "Approval focus", detail: pending > 0 ? `${pending} L is waiting in the queue for payout approval.` : "Promote a seasonal package to re-engage employees who have not picked yet." },
    ],
  };
}
