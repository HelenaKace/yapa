import { NextResponse } from "next/server";
import { aiEnabled, employerInsights, heuristicInsights } from "@/lib/anthropic";
import { fullState } from "@/lib/store";
import { CATEGORY_MAP, EMPLOYER, EMPLOYEES, PROVIDER_MAP } from "@/lib/seed";
import { catalogFromState, offerMapFor } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function computeStats() {
  const state = fullState();
  const offers = offerMapFor(catalogFromState(state));
  const approved = state.orders.filter((o) => o.status === "approved");
  const pending = state.orders.filter((o) => o.status === "pending");
  const byCategory = {};
  const byProvider = {};
  let totalSpend = 0;
  let fulfilledPayments = 0;
  let fulfilledSpend = 0;
  let readyPayments = 0;
  for (const ord of approved) {
    for (const payment of ord.payments || []) {
      const offer = offers[payment.offerId];
      if (!offer) continue;
      const cat = CATEGORY_MAP[offer.category]?.en || offer.category;
      byCategory[cat] = (byCategory[cat] || 0) + payment.amountALL;
      const pname = PROVIDER_MAP[payment.providerId]?.name || payment.providerId;
      byProvider[pname] = (byProvider[pname] || 0) + payment.amountALL;
      totalSpend += payment.amountALL;
      if (payment.fulfillmentStatus === "fulfilled") {
        fulfilledPayments += 1;
        fulfilledSpend += payment.amountALL;
      } else {
        readyPayments += 1;
      }
    }
  }
  const totalBudget = EMPLOYER.budgetPerEmployeeALL * EMPLOYEES.length;
  const activeEmployees = new Set(approved.map((o) => o.employeeId)).size;
  const pendingLiabilityALL = pending.reduce((sum, order) => sum + order.totalALL, 0);
  return {
    totalSpendALL: totalSpend,
    totalBudgetALL: totalBudget,
    utilisationPct: Math.round((totalSpend / totalBudget) * 100),
    pendingLiabilityALL,
    fulfilledPayments,
    fulfilledSpendALL: fulfilledSpend,
    readyPayments,
    byCategory,
    byProvider,
    activeEmployees,
    totalEmployees: EMPLOYEES.length,
    pendingApprovals: state.orders.filter((o) => o.status === "pending").length,
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "en";
  const stats = computeStats();
  let ai = false;
  let result;
  if (aiEnabled()) {
    try {
      result = await employerInsights({ stats, lang });
      ai = true;
    } catch {
      result = heuristicInsights({ stats });
    }
  } else {
    result = heuristicInsights({ stats });
  }
  return NextResponse.json({ stats, insights: result, ai });
}
