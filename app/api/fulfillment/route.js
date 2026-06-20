import { NextResponse } from "next/server";
import { fulfillPayment } from "@/lib/store";

export async function POST(req) {
  const body = await req.json();
  try {
    const result = fulfillPayment({
      orderId: body.orderId,
      paymentId: body.paymentId,
      providerId: body.providerId,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
