// Tiny file-persisted store. No DB needed for the demo, but state survives
// hot-reloads and page refreshes so the employee → employer → provider loop
// feels real during a live demo.
import fs from "fs";
import path from "path";
import {
  CATEGORY_MAP,
  EMPLOYER,
  EMPLOYEES,
  CURRENT_USER_ID,
  PROVIDER_MAP,
} from "./seed.js";
import { normalizeItems, payoutLinesForItems } from "./orders.js";
import { activeCatalog, catalogFromState, seedOffers, seedPackages } from "./catalog.js";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "state.json");
const STATE_VERSION = 3;

function seedState() {
  const now = Date.now();
  const offers = seedOffers();
  const packages = seedPackages();
  const catalog = { offers, packages };
  const orders = [
    seedOrder({
      id: "ord_seed_erisa",
      employeeId: "u_erisa",
      items: [{ type: "package", id: "pkg_reset" }],
      note: "A reset after launch week.",
      status: "pending",
      createdAt: now - 1000 * 60 * 38,
    }, catalog),
    seedOrder({
      id: "ord_seed_bledi",
      employeeId: "u_bledi",
      items: [
        { type: "offer", id: "o_skillup_ai" },
        { type: "offer", id: "o_vodafone_data" },
      ],
      note: "Career growth plus reliable remote data.",
      status: "pending",
      createdAt: now - 1000 * 60 * 60 * 4,
    }, catalog),
    seedOrder({
      id: "ord_seed_redon",
      employeeId: "u_redon",
      items: [{ type: "package", id: "pkg_riviera" }],
      note: "Client season travel recovery.",
      status: "approved",
      createdAt: now - 1000 * 60 * 60 * 31,
      decidedAt: now - 1000 * 60 * 60 * 27,
    }, catalog),
  ];
  return {
    schemaVersion: STATE_VERSION,
    employer: {
      id: EMPLOYER.id,
      budgetPerEmployeeALL: EMPLOYER.budgetPerEmployeeALL,
    },
    // per-employee gamification + budget usage
    employees: Object.fromEntries(
      EMPLOYEES.map((e) => [
        e.id,
        { id: e.id, points: e.id === CURRENT_USER_ID ? 240 : Math.floor(Math.random() * 300), streakWeeks: e.id === CURRENT_USER_ID ? 3 : 0, savedOfferIds: [] },
      ])
    ),
    offers,
    packages,
    orders,
    activity: [
      { id: "a_seed1", ts: now - 1000 * 60 * 38, type: "submitted", text: "Erisa requested Reset & Recharge" },
      { id: "a_seed2", ts: now - 1000 * 60 * 60 * 4, type: "submitted", text: "Bledi requested 2 benefits" },
      { id: "a_seed3", ts: now - 1000 * 60 * 60 * 27, type: "approved", text: "Redon's Riviera Escape was approved" },
      { id: "a_seed4", ts: now - 1000 * 60 * 60 * 34, type: "join", text: "Klea joined YAPA" },
    ],
    providerRevenue: providerRevenueFor(orders),
  };
}

function paymentRef(prefix) {
  return `YAPA-PAY-${prefix.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function fulfillmentRef(prefix) {
  return `YAPA-FUL-${prefix.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function paymentRecords(items, catalog, processedAt = Date.now()) {
  return payoutLinesForItems(items, catalog).map((line) => ({
    ...line,
    id: "pay_" + Math.random().toString(36).slice(2, 10),
    paymentRef: paymentRef(line.providerId),
    status: "paid",
    processedAt,
    fulfillmentStatus: "ready",
    fulfilledAt: null,
    fulfillmentRef: null,
  }));
}

function seedOrder({ id, employeeId, items, note, status, createdAt, decidedAt = null }, catalog) {
  const normalized = normalizeItems(items, catalog);
  const totalALL = normalized.reduce((sum, item) => sum + item.priceALL, 0);
  const approved = status === "approved";
  const payments = approved ? paymentRecords(normalized, catalog, decidedAt) : [];
  return {
    id,
    employeeId,
    items: normalized,
    totalALL,
    note,
    status,
    createdAt,
    decidedAt,
    payments,
    paymentBatch: approved
      ? { ref: paymentRef(id), status: "paid", totalALL, processedAt: decidedAt }
      : null,
  };
}

function providerRevenueFor(orders) {
  const revenue = {};
  for (const order of orders) {
    if (order.status !== "approved") continue;
    for (const payment of order.payments || []) {
      revenue[payment.providerId] = (revenue[payment.providerId] || 0) + payment.amountALL;
    }
  }
  return revenue;
}

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(seedState(), null, 2));
  }
}

export function readState() {
  ensure();
  try {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    if (state.schemaVersion !== STATE_VERSION) {
      return writeState(seedState());
    }
    return state;
  } catch {
    const s = seedState();
    fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
    return s;
  }
}

function writeState(s) {
  ensure();
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
  return s;
}

export function resetState() {
  ensure();
  return writeState(seedState());
}

function budgetUsed(state, employeeId) {
  return state.orders
    .filter((o) => o.employeeId === employeeId && o.status !== "declined")
    .reduce((sum, o) => sum + o.totalALL, 0);
}

export function employeeView(employeeId) {
  const state = readState();
  const used = budgetUsed(state, employeeId);
  return {
    budgetTotalALL: state.employer.budgetPerEmployeeALL,
    budgetUsedALL: used,
    budgetLeftALL: state.employer.budgetPerEmployeeALL - used,
    gamification: state.employees[employeeId] || { points: 0, streakWeeks: 0, savedOfferIds: [] },
    orders: state.orders.filter((o) => o.employeeId === employeeId),
  };
}

export function fullState() {
  const state = readState();
  return {
    ...state,
    budgetUsedByEmployee: Object.fromEntries(
      EMPLOYEES.map((e) => [e.id, budgetUsed(state, e.id)])
    ),
  };
}

export function createOrder({ employeeId, items, note }) {
  const state = readState();
  if (!state.employees[employeeId]) throw new Error("employee not found");
  const catalog = activeCatalog(catalogFromState(state));
  const normalized = normalizeItems(items, catalog);
  const totalALL = normalized.reduce((s, it) => s + it.priceALL, 0);
  if (normalized.length === 0) throw new Error("empty selection");
  if (budgetUsed(state, employeeId) + totalALL > state.employer.budgetPerEmployeeALL) {
    throw new Error("selection exceeds remaining budget");
  }
  const order = {
    id: "ord_" + Math.random().toString(36).slice(2, 9),
    employeeId,
    items: normalized,
    totalALL,
    note: note || "",
    status: "pending",
    createdAt: Date.now(),
    decidedAt: null,
    payments: [],
    paymentBatch: null,
  };
  state.orders.unshift(order);
  const emp = EMPLOYEES.find((e) => e.id === employeeId);
  state.activity.unshift({
    id: "a_" + Math.random().toString(36).slice(2, 8),
    ts: Date.now(),
    type: "submitted",
    text: `${emp?.name?.split(" ")[0] || "Someone"} requested ${normalized.length} benefit${normalized.length > 1 ? "s" : ""}`,
  });
  writeState(state);
  return order;
}

export function decideOrder({ orderId, decision }) {
  const state = readState();
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) throw new Error("order not found");
  if (order.status !== "pending") throw new Error("request already decided");
  if (!["approve", "decline"].includes(decision)) throw new Error("invalid decision");
  const decidedAt = Date.now();
  order.status = decision === "approve" ? "approved" : "declined";
  order.decidedAt = decidedAt;

  if (decision === "approve") {
    const payments = paymentRecords(order.items, catalogFromState(state), decidedAt);
    for (const payment of payments) {
      state.providerRevenue[payment.providerId] =
        (state.providerRevenue[payment.providerId] || 0) + payment.amountALL;
    }
    order.payments = payments;
    order.paymentBatch = {
      ref: paymentRef(order.id),
      status: "paid",
      totalALL: order.totalALL,
      processedAt: decidedAt,
    };

    const g = state.employees[order.employeeId];
    if (g) {
      g.points = (g.points || 0) + Math.round(order.totalALL / 100) + 50;
      g.streakWeeks = (g.streakWeeks || 0) + 1;
    }
    const emp = EMPLOYEES.find((e) => e.id === order.employeeId);
    state.activity.unshift({
      id: "a_" + Math.random().toString(36).slice(2, 8),
      ts: Date.now(),
      type: "approved",
      text: `${emp?.name?.split(" ")[0] || "Someone"}'s benefits were approved`,
    });
  } else {
    order.payments = [];
    order.paymentBatch = null;
  }
  writeState(state);
  return order;
}

function tagsFrom(input) {
  const values = Array.isArray(input) ? input : String(input || "").split(",");
  return [...new Set(values.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 8);
}

function cleanOffer(input, existing = {}) {
  const title = String(input.title ?? existing.title ?? "").trim();
  const desc = String(input.desc ?? existing.desc ?? "").trim();
  const category = String(input.category ?? existing.category ?? "").trim();
  const priceALL = Math.round(Number(input.priceALL ?? existing.priceALL ?? 0));
  if (title.length < 3) throw new Error("title is too short");
  if (desc.length < 8) throw new Error("description is too short");
  if (!CATEGORY_MAP[category]) throw new Error("invalid category");
  if (!Number.isFinite(priceALL) || priceALL < 100) throw new Error("invalid price");
  return {
    title,
    desc,
    category,
    priceALL,
    tags: tagsFrom(input.tags ?? existing.tags ?? []),
  };
}

export function createProviderOffer({ providerId, title, desc, category, priceALL, tags }) {
  const state = readState();
  if (!PROVIDER_MAP[providerId]) throw new Error("provider not found");
  const now = Date.now();
  const data = cleanOffer({ title, desc, category, priceALL, tags });
  const offer = {
    id: "o_provider_" + Math.random().toString(36).slice(2, 9),
    providerId,
    ...data,
    status: "active",
    popular: false,
    createdAt: now,
    updatedAt: now,
  };
  state.offers.unshift(offer);
  state.activity.unshift({
    id: "a_" + Math.random().toString(36).slice(2, 8),
    ts: now,
    type: "offer_created",
    text: `${PROVIDER_MAP[providerId].name} added ${offer.title}`,
  });
  writeState(state);
  return offer;
}

export function updateProviderOffer({ providerId, offerId, patch }) {
  const state = readState();
  const offer = state.offers.find((item) => item.id === offerId);
  if (!offer) throw new Error("offer not found");
  if (offer.providerId !== providerId) throw new Error("provider mismatch");
  if (offer.status === "archived") throw new Error("offer is archived");
  Object.assign(offer, cleanOffer(patch, offer), { updatedAt: Date.now() });
  writeState(state);
  return offer;
}

export function archiveProviderOffer({ providerId, offerId }) {
  const state = readState();
  const offer = state.offers.find((item) => item.id === offerId);
  if (!offer) throw new Error("offer not found");
  if (offer.providerId !== providerId) throw new Error("provider mismatch");
  offer.status = "archived";
  offer.updatedAt = Date.now();
  writeState(state);
  return offer;
}

export function fulfillPayment({ orderId, paymentId, providerId }) {
  const state = readState();
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) throw new Error("order not found");
  if (order.status !== "approved") throw new Error("request is not approved");
  const payment = (order.payments || []).find((p) => p.id === paymentId && p.providerId === providerId);
  if (!payment) throw new Error("payment not found");
  if (payment.fulfillmentStatus === "fulfilled") throw new Error("benefit already fulfilled");

  const fulfilledAt = Date.now();
  payment.fulfillmentStatus = "fulfilled";
  payment.fulfilledAt = fulfilledAt;
  payment.fulfillmentRef = fulfillmentRef(payment.id);

  const emp = EMPLOYEES.find((e) => e.id === order.employeeId);
  state.activity.unshift({
    id: "a_" + Math.random().toString(36).slice(2, 8),
    ts: fulfilledAt,
    type: "fulfilled",
    text: `${emp?.name?.split(" ")[0] || "Someone"}'s benefit was fulfilled`,
  });

  writeState(state);
  return { order, payment };
}
