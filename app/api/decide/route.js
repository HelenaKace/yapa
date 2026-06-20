import { NextResponse } from "next/server";
import { decideOrder } from "@/lib/store";

export async function POST(req) {
  const body = await req.json();
  try {
    const order = decideOrder({ orderId: body.orderId, decision: body.decision });
    return NextResponse.json({ order });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
