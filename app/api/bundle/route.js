import { NextResponse } from "next/server";
import { aiEnabled, buildBundle } from "@/lib/anthropic";
import { employeeView, fullState } from "@/lib/store";
import { catalogFromState } from "@/lib/catalog";
import { CURRENT_USER_ID } from "@/lib/seed";

export async function POST(req) {
  const body = await req.json();
  const employeeId = body.employeeId || CURRENT_USER_ID;
  const me = employeeView(employeeId);
  const catalog = catalogFromState(fullState());
  if (!aiEnabled()) {
    return NextResponse.json({ error: "AI not configured. Add ANTHROPIC_API_KEY." }, { status: 503 });
  }
  try {
    const bundle = await buildBundle({
      goal: body.goal || "a nice mix of benefits",
      budgetALL: Math.min(me.budgetLeftALL, body.budgetALL || me.budgetLeftALL),
      catalog,
      lang: body.lang || "en",
    });
    return NextResponse.json({ bundle, ai: true });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
