import { NextResponse } from "next/server";
import { createOrder } from "@/lib/store";
import { CURRENT_USER_ID } from "@/lib/seed";

export async function POST(req) {
  const body = await req.json();
  const order = createOrder({
    employeeId: body.employeeId || CURRENT_USER_ID,
    items: body.items || [],
    note: body.note || "",
  });
  return NextResponse.json({ order });
}
