// Tiny file-persisted store. No DB needed for the demo, but state survives
// hot-reloads and page refreshes so the employee → employer → provider loop
// feels real during a live demo.
import fs from "fs";
import path from "path";
import {
  EMPLOYER,
  EMPLOYEES,
  CURRENT_USER_ID,
} from "./seed.js";
import { normalizeItems, payoutLinesForItems } from "./orders.js";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "state.json");

function seedState() {
  const now = Date.now();
  const orders = [
    seedOrder({
      id: "ord_seed_erisa",
      employeeId: "u_erisa",
      items: [{ type: "package", id: "pkg_reset" }],
      note: "A reset after launch week.",
      status: "pending",
      createdAt: now - 1000 * 60 * 38,
    }),
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
    }),
    seedOrder({
      id: "ord_seed_redon",
      employeeId: "u_redon",
      items: [{ type: "package", id: "pkg_riviera" }],
      note: "Client season travel recovery.",
      status: "approved",
      createdAt: now - 1000 * 60 * 60 * 31,
      decidedAt: now - 1000 * 60 * 60 * 27,
    }),
  ];
  return {
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

function mockRef(prefix) {
  return `YAPA-MOCK-${prefix.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function mockPayments(items, processedAt = Date.now()) {
  return payoutLinesForItems(items).map((line) => ({
    ...line,
    paymentRef: mockRef(line.providerId),
    status: "mock_paid",
    processedAt,
  }));
}

function seedOrder({ id, employeeId, items, note, status, createdAt, decidedAt = null }) {
  const normalized = normalizeItems(items);
  const totalALL = normalized.reduce((sum, item) => sum + item.priceALL, 0);
  const approved = status === "approved";
  const payments = approved ? mockPayments(normalized, decidedAt) : [];
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
      ? { ref: mockRef(id), status: "mock_paid", totalALL, processedAt: decidedAt }
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
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
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
  const normalized = normalizeItems(items);
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
    const payments = mockPayments(order.items, decidedAt);
    for (const payment of payments) {
      state.providerRevenue[payment.providerId] =
        (state.providerRevenue[payment.providerId] || 0) + payment.amountALL;
    }
    order.payments = payments;
    order.paymentBatch = {
      ref: mockRef(order.id),
      status: "mock_paid",
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
