import { NextResponse } from "next/server";
import { aiEnabled, employerInsights, heuristicInsights } from "@/lib/anthropic";
import { fullState } from "@/lib/store";
import { OFFER_MAP, PACKAGE_MAP, CATEGORY_MAP, EMPLOYER, EMPLOYEES, PROVIDER_MAP } from "@/lib/seed";

export const dynamic = "force-dynamic";

function computeStats() {
  const state = fullState();
  const approved = state.orders.filter((o) => o.status === "approved");
  const byCategory = {};
  const byProvider = {};
  let totalSpend = 0;
  for (const ord of approved) {
    for (const it of ord.items) {
      const offers = it.kind === "package" ? (PACKAGE_MAP[it.id]?.offerIds || []) : [it.id];
      for (const oid of offers) {
        const o = OFFER_MAP[oid];
        if (!o) continue;
        const cat = CATEGORY_MAP[o.category]?.en || o.category;
        byCategory[cat] = (byCategory[cat] || 0) + o.priceALL;
        const pname = PROVIDER_MAP[o.providerId]?.name || o.providerId;
        byProvider[pname] = (byProvider[pname] || 0) + o.priceALL;
        totalSpend += o.priceALL;
      }
    }
  }
  const totalBudget = EMPLOYER.budgetPerEmployeeALL * EMPLOYEES.length;
  const activeEmployees = new Set(approved.map((o) => o.employeeId)).size;
  return {
    totalSpendALL: totalSpend,
    totalBudgetALL: totalBudget,
    utilisationPct: Math.round((totalSpend / totalBudget) * 100),
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
