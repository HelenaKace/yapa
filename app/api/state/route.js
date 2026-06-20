import { NextResponse } from "next/server";
import { employeeView, fullState } from "@/lib/store";
import { CURRENT_USER_ID } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get("employeeId") || CURRENT_USER_ID;
  return NextResponse.json({
    me: employeeView(employeeId),
    full: fullState(),
  });
}
