import { NextResponse } from "next/server";
import { createOrder } from "@/lib/store";
import { CURRENT_USER_ID } from "@/lib/seed";

export async function POST(req) {
  const body = await req.json();
  try {
    const order = createOrder({
      employeeId: body.employeeId || CURRENT_USER_ID,
      items: body.items || [],
      note: body.note || "",
    });
    return NextResponse.json({ order });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
