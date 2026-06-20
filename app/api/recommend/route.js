import { NextResponse } from "next/server";
import { aiEnabled, recommendForUser, heuristicRecommend } from "@/lib/anthropic";
import { employeeView, fullState } from "@/lib/store";
import { catalogFromState } from "@/lib/catalog";
import { EMPLOYEE_MAP, CURRENT_USER_ID } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId") || CURRENT_USER_ID;
  const lang = searchParams.get("lang") || "en";
  const me = employeeView(employeeId);
  const catalog = catalogFromState(fullState());
  const baseUser = EMPLOYEE_MAP[employeeId];
  // quiz/profile overrides — personalize from onboarding answers
  const interestsOverride = (searchParams.get("interests") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const vibe = searchParams.get("vibe") || null;
  const user = interestsOverride.length ? { ...baseUser, interests: interestsOverride, vibe } : { ...baseUser, vibe };
  const ownedOfferIds = me.orders.flatMap((o) => o.items.map((i) => i.id));

  if (!aiEnabled()) {
    return NextResponse.json({ ...heuristicRecommend({ user, budgetLeftALL: me.budgetLeftALL, catalog }), ai: false });
  }
  try {
    const result = await recommendForUser({ user, budgetLeftALL: me.budgetLeftALL, ownedOfferIds, catalog, lang });
    return NextResponse.json({ ...result, ai: true });
  } catch (e) {
    return NextResponse.json({
      ...heuristicRecommend({ user, budgetLeftALL: me.budgetLeftALL, catalog }),
      ai: false,
      error: String(e.message || e),
    });
  }
}
