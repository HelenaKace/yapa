"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/app/store-context";
import { PROVIDERS, OFFERS, OFFER_MAP, PROVIDER_MAP, CATEGORY_MAP, PACKAGE_MAP } from "@/lib/seed";
import { Money, Pill, Section, Blob } from "./ui";
import { Ico, ProviderIcon } from "./icons";

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
      <div className="relative mb-6 overflow-hidden rounded-5xl p-6 text-perx-ink shadow-soft" style={{ backgroundColor: "#FBF3C9" }}>
        <Blob variant="splash" color="#F2B544" className="-bottom-8 -right-4 h-28 w-32 opacity-30" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <Pill className="!bg-white/40">Provider portal</Pill>
            <h1 className="mt-2 flex items-center gap-2.5 font-display text-3xl font-bold"><ProviderIcon id={providerId} className="h-7 w-7" /> {prov?.name}</h1>
            <p className="text-perx-ink/70">List your deals to thousands of employees across Albania.</p>
          </div>
          <select value={providerId} onChange={(e) => setProviderId(e.target.value)}
            className="rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-semibold outline-none">
            {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi icon="wallet" label="Revenue from PERX" value={<Money all={revenue} />} />
        <Kpi icon="ticket" label="Live offers" value={myOffers.length} />
        <Kpi icon="badge-check" label="Bookings" value={bookings.length} />
        <Kpi icon="pin" label="Location" value={prov?.city} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="Your offers" action={<button className="pop-btn inline-flex items-center gap-1.5 grad-orange px-4 py-2 text-sm text-white shadow-pop-sm"><Ico name="plus" className="h-4 w-4" /> New offer</button>}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {myOffers.map((o) => (
                <div key={o.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-perx-muted"><Ico name={o.category} className="h-3.5 w-3.5" /> {CATEGORY_MAP[o.category]?.en}</span>
                    {o.popular && <Pill className="!bg-perx-gold/12 !text-perx-gold"><Ico name="flame" className="h-3 w-3" /> Popular</Pill>}
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
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold"><Ico name="receipt" className="h-4 w-4 text-perx-purple" /> Incoming payments</h3>
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

function Kpi({ label, value, icon }) {
  return (
    <div className="card p-4">
      <Ico name={icon} className="h-5 w-5 text-perx-purple" />
      <div className="mt-1.5 font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-perx-ink/50">{label}</div>
    </div>
  );
}
