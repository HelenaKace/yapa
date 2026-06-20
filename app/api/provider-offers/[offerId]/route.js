import { NextResponse } from "next/server";
import { archiveProviderOffer, updateProviderOffer } from "@/lib/store";

export async function PATCH(req, { params }) {
  const body = await req.json();
  try {
    const offer = updateProviderOffer({
      providerId: body.providerId,
      offerId: params.offerId,
      patch: body,
    });
    return NextResponse.json({ offer });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const { searchParams } = new URL(req.url);
  try {
    const offer = archiveProviderOffer({
      providerId: searchParams.get("providerId"),
      offerId: params.offerId,
    });
    return NextResponse.json({ offer });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
