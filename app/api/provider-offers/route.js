import { NextResponse } from "next/server";
import { createProviderOffer } from "@/lib/store";

export async function POST(req) {
  const body = await req.json();
  try {
    const offer = createProviderOffer({
      providerId: body.providerId,
      title: body.title,
      desc: body.desc,
      category: body.category,
      priceALL: body.priceALL,
      tags: body.tags,
    });
    return NextResponse.json({ offer });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
