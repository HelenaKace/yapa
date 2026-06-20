// Tiny file-persisted store. No DB needed for the demo, but state survives
// hot-reloads and page refreshes so the employee → employer → provider loop
// feels real during a live demo.
import fs from "fs";
import path from "path";
import {
  EMPLOYER,
  EMPLOYEES,
  CURRENT_USER_ID,
  OFFER_MAP,
  PACKAGE_MAP,
  packagePriceALL,
} from "./seed.js";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "state.json");

function seedState() {
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
    orders: [], // selections submitted by employees
    activity: [
      { id: "a_seed1", ts: Date.now() - 1000 * 60 * 60 * 26, type: "join", text: "Klea joined YAPA" },
      { id: "a_seed2", ts: Date.now() - 1000 * 60 * 60 * 5, type: "approved", text: "Redon's Riviera Escape was approved" },
    ],
    providerRevenue: {}, // providerId -> ALL paid
  };
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

function priceForItem(item) {
  if (item.kind === "package") {
    const pkg = PACKAGE_MAP[item.id];
    return pkg ? packagePriceALL(pkg) : 0;
  }
  const o = OFFER_MAP[item.id];
  return o ? o.priceALL : 0;
}

// items: [{ kind: 'offer'|'package', id }]
export function createOrder({ employeeId, items, note }) {
  const state = readState();
  const normalized = items
    .map((it) => ({ kind: it.kind, id: it.id, priceALL: priceForItem(it) }))
    .filter((it) => it.priceALL > 0);
  const totalALL = normalized.reduce((s, it) => s + it.priceALL, 0);
  const order = {
    id: "ord_" + Math.random().toString(36).slice(2, 9),
    employeeId,
    items: normalized,
    totalALL,
    note: note || "",
    status: "pending",
    createdAt: Date.now(),
    decidedAt: null,
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
  order.status = decision === "approve" ? "approved" : "declined";
  order.decidedAt = Date.now();

  if (decision === "approve") {
    // simulate routing payment to each provider
    const payments = [];
    for (const it of order.items) {
      let lines = [];
      if (it.kind === "package") {
        const pkg = PACKAGE_MAP[it.id];
        lines = (pkg?.offerIds || []).map((oid) => OFFER_MAP[oid]).filter(Boolean);
      } else {
        const o = OFFER_MAP[it.id];
        if (o) lines = [o];
      }
      for (const o of lines) {
        state.providerRevenue[o.providerId] =
          (state.providerRevenue[o.providerId] || 0) + o.priceALL;
        payments.push({ providerId: o.providerId, offerId: o.id, amountALL: o.priceALL });
      }
    }
    order.payments = payments;

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
  }
  writeState(state);
  return order;
}
