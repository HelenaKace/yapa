"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/app/store-context";
import { PROVIDERS, OFFERS, OFFER_MAP, PROVIDER_MAP, CATEGORY_MAP, PACKAGE_MAP } from "@/lib/seed";
import { Money, Pill, Section } from "./ui";

export function ProviderApp() {
  const { full } = useStore();
  const [providerId, setProviderId] = useState("p_gymflow");
  const prov = PROVIDER_MAP[providerId];
  const myOffers = OFFERS.filter((o) => o.providerId === providerId);
  const revenue = full?.providerRevenue?.[providerId] || 0;

  // bookings: approved orders that include one of my offers
  const bookings = [];
  for (const ord of full?.orders || []) {
    if (ord.status !== "approved") continue;
    for (const it of ord.items) {
      const offerIds = it.kind === "package" ? (PACKAGE_MAP[it.id]?.offerIds || []) : [it.id];
      for (const oid of offerIds) {
        if (OFFER_MAP[oid]?.providerId === providerId) {
          bookings.push({ orderId: ord.id, offerId: oid, ts: ord.decidedAt, amount: OFFER_MAP[oid].priceALL });
        }
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6">
      <div className="mb-6 overflow-hidden rounded-5xl grad-sun p-6 text-perx-ink shadow-pop">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Pill className="!bg-white/40">Provider portal</Pill>
            <h1 className="mt-2 font-display text-3xl font-bold">{prov?.emoji} {prov?.name}</h1>
            <p className="text-perx-ink/70">List your deals to thousands of employees across Albania.</p>
          </div>
          <select value={providerId} onChange={(e) => setProviderId(e.target.value)}
            className="rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-semibold outline-none">
            {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi emoji="💰" label="Revenue from PERX" value={<Money all={revenue} />} />
        <Kpi emoji="🎟️" label="Live offers" value={myOffers.length} />
        <Kpi emoji="✅" label="Bookings" value={bookings.length} />
        <Kpi emoji="📍" label="Location" value={prov?.city} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="Your offers" action={<button className="pop-btn grad-orange px-4 py-2 text-sm text-white shadow-pop-sm">+ New offer</button>}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {myOffers.map((o) => (
                <div key={o.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-perx-ink/40">{CATEGORY_MAP[o.category]?.emoji} {CATEGORY_MAP[o.category]?.en}</span>
                    {o.popular && <Pill grad="grad-sun">🔥 Popular</Pill>}
                  </div>
                  <p className="mt-2 font-display font-semibold">{o.title}</p>
                  <p className="text-xs text-perx-ink/50">{o.desc}</p>
                  <div className="mt-2 font-display text-lg font-bold"><Money all={o.priceALL} /></div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="card h-fit p-5">
          <h3 className="mb-3 font-display text-lg font-semibold">🧾 Incoming payments</h3>
          {bookings.length === 0 ? (
            <p className="text-sm text-perx-ink/50">No paid bookings yet. Approvals route money here instantly.</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-2xl bg-white/70 p-3 text-sm">
                  <span className="truncate">{OFFER_MAP[b.offerId]?.title}</span>
                  <span className="font-display font-semibold text-perx-blue">+<Money all={b.amount} /></span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, emoji }) {
  return (
    <div className="card p-4">
      <div className="text-xl">{emoji}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-perx-ink/50">{label}</div>
    </div>
  );
}
