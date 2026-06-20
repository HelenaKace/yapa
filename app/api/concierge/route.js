import { NextResponse } from "next/server";
import { aiEnabled, concierge, heuristicConcierge } from "@/lib/anthropic";
import { employeeView, fullState } from "@/lib/store";
import { catalogFromState } from "@/lib/catalog";
import { EMPLOYEE_MAP, CURRENT_USER_ID } from "@/lib/seed";

export async function POST(req) {
  const body = await req.json();
  const employeeId = body.employeeId || CURRENT_USER_ID;
  const me = employeeView(employeeId);
  const catalog = catalogFromState(fullState());
  const user = EMPLOYEE_MAP[employeeId];
  const history = (body.history || []).slice(-8);
  const lastUser = [...history].reverse().find((m) => m.role === "user");

  if (!aiEnabled()) {
    return NextResponse.json({
      ...heuristicConcierge({ text: lastUser?.content, budgetLeftALL: me.budgetLeftALL, catalog }),
      ai: false,
    });
  }
  try {
    const result = await concierge({
      history,
      budgetLeftALL: me.budgetLeftALL,
      catalog,
      lang: body.lang || "en",
      userName: user?.name?.split(" ")[0] || "there",
    });
    return NextResponse.json({ ...result, ai: true });
  } catch (e) {
    return NextResponse.json({
      ...heuristicConcierge({ text: lastUser?.content, budgetLeftALL: me.budgetLeftALL, catalog }),
      ai: false,
      error: String(e.message || e),
    });
  }
}
