"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/app/store-context";
import { PROVIDERS, PROVIDER_MAP, CATEGORY_MAP, CATEGORIES, EMPLOYEE_MAP } from "@/lib/seed";
import { activeOffers, offerMapFor, packageMapFor } from "@/lib/catalog";
import { Money, Pill, Section, Blob } from "./ui";
import { Ico, ProviderIcon } from "./icons";

export function ProviderApp() {
  const {
    full,
    catalog,
    fulfillPayment,
    createProviderOffer,
    updateProviderOffer,
    archiveProviderOffer,
  } = useStore();
  const [providerId, setProviderId] = useState("p_gymflow");
  const prov = PROVIDER_MAP[providerId];
  const myOffers = activeOffers(catalog).filter((o) => o.providerId === providerId);
  const bookings = providerBookings(full?.orders || [], providerId, catalog);
  const ready = bookings.filter((b) => b.payment.fulfillmentStatus !== "fulfilled");
  const fulfilled = bookings.filter((b) => b.payment.fulfillmentStatus === "fulfilled");
  const revenue = bookings.reduce((sum, b) => sum + b.payment.amountALL, 0);
  const readyALL = ready.reduce((sum, b) => sum + b.payment.amountALL, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6">
      <div className="relative mb-6 overflow-hidden rounded-5xl p-6 text-perx-ink shadow-soft" style={{ backgroundColor: "#FBF3C9" }}>
        <Blob variant="splash" color="#F2B544" className="-bottom-8 -right-4 h-28 w-32 opacity-30" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <Pill className="!bg-white/40">Provider portal</Pill>
            <h1 className="mt-2 flex items-center gap-2.5 font-display text-3xl font-bold"><ProviderIcon id={providerId} className="h-7 w-7" /> {prov?.name}</h1>
            <p className="text-perx-ink/70">Track paid bookings, fulfill employee benefits, and reconcile payouts.</p>
          </div>
          <select value={providerId} onChange={(e) => setProviderId(e.target.value)}
            className="rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-semibold outline-none">
            {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi icon="wallet" label="Paid revenue" value={<Money all={revenue} />} />
        <Kpi icon="clock" label="Ready to fulfill" value={ready.length} />
        <Kpi icon="badge-check" label="Fulfilled" value={fulfilled.length} />
        <Kpi icon="ticket" label="Live offers" value={myOffers.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="Fulfillment queue" sub="Paid employee benefits waiting for provider completion">
            {ready.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-perx-emerald/10 text-perx-emerald">
                  <Ico name="check" className="h-6 w-6" />
                </div>
                <p className="mt-3 font-display text-lg font-semibold">Nothing waiting</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-perx-ink/50">Approved bookings for {prov?.name} will appear here as soon as employers route payment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ready.map((booking) => (
                  <BookingCard
                    key={booking.payment.id}
                    booking={booking}
                    onFulfill={() => fulfillPayment({
                      orderId: booking.order.id,
                      paymentId: booking.payment.id,
                      providerId,
                    })}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="Manage benefits" sub="Create and maintain the offers employees can request">
            <BenefitForm
              key={providerId}
              providerId={providerId}
              defaultCategory={prov?.category}
              onCreate={createProviderOffer}
            />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {myOffers.map((offer) => (
                <ProviderOfferCard
                  key={offer.id}
                  offer={offer}
                  providerId={providerId}
                  onUpdate={updateProviderOffer}
                  onArchive={archiveProviderOffer}
                />
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold"><Ico name="receipt" className="h-4 w-4 text-perx-purple" /> Payment ledger</h3>
            {bookings.length === 0 ? (
              <p className="text-sm text-perx-ink/50">No paid bookings yet. Employer approvals will route money here instantly.</p>
            ) : (
              <div className="space-y-2">
                {bookings.map((booking) => <LedgerRow key={booking.payment.id} booking={booking} />)}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold"><Ico name="chart" className="h-4 w-4 text-perx-purple" /> Reconciliation</h3>
            <div className="space-y-3">
              <MetricLine label="Ready value" value={<Money all={readyALL} />} />
              <MetricLine label="Provider city" value={prov?.city} />
              <MetricLine label="Payout records" value={bookings.length} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function providerBookings(orders, providerId, catalog) {
  const offers = offerMapFor(catalog);
  const packages = packageMapFor(catalog);
  return orders
    .filter((order) => order.status === "approved")
    .flatMap((order) =>
      (order.payments || [])
        .filter((payment) => payment.providerId === providerId)
        .map((payment) => ({
          order,
          payment,
          employee: EMPLOYEE_MAP[order.employeeId],
          offer: offers[payment.offerId],
          source: payment.sourceType === "package" ? packages[payment.sourceId] : null,
        }))
    )
    .sort((a, b) => {
      const aDone = a.payment.fulfillmentStatus === "fulfilled";
      const bDone = b.payment.fulfillmentStatus === "fulfilled";
      if (aDone !== bDone) return aDone ? 1 : -1;
      return (b.payment.processedAt || 0) - (a.payment.processedAt || 0);
    });
}

function BookingCard({ booking, onFulfill }) {
  const { employee, offer, payment, source } = booking;
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-perx-emerald/10 px-2.5 py-1 text-xs font-semibold text-perx-emerald">
              <Ico name="card" className="h-3.5 w-3.5" /> Paid
            </span>
            {source && <Pill className="!bg-perx-purple/10 !text-perx-purple">{source.title}</Pill>}
          </div>
          <p className="mt-2 font-display text-lg font-semibold">{offer?.title}</p>
          <p className="text-sm text-perx-ink/55">{employee?.name} - {employee?.role}</p>
          <p className="mt-2 truncate text-[11px] font-medium text-perx-ink/35">{payment.paymentRef}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-display text-xl font-bold text-perx-blue"><Money all={payment.amountALL} /></p>
          <button onClick={onFulfill} className="pop-btn mt-3 inline-flex items-center justify-center gap-1.5 grad-blue px-4 py-2.5 text-sm font-semibold text-white shadow-pop-sm">
            <Ico name="check" className="h-4 w-4" /> Mark fulfilled
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function LedgerRow({ booking }) {
  const { employee, offer, payment } = booking;
  const fulfilled = payment.fulfillmentStatus === "fulfilled";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/70 p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{offer?.title}</p>
          <p className="truncate text-xs text-perx-ink/45">{employee?.name}</p>
          <p className="mt-1 truncate text-[10px] font-medium text-perx-ink/35">{fulfilled ? payment.fulfillmentRef : payment.paymentRef}</p>
        </div>
        <div className="text-right">
          <span className="font-display font-semibold text-perx-blue">+<Money all={payment.amountALL} /></span>
          <p className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${fulfilled ? "bg-perx-emerald/10 text-perx-emerald" : "bg-perx-gold/15 text-perx-ink"}`}>
            {fulfilled ? "Fulfilled" : "Ready"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const emptyOffer = (category) => ({
  title: "",
  desc: "",
  category: category || "wellness",
  priceALL: "",
  tags: "",
});

function BenefitForm({ providerId, defaultCategory, onCreate }) {
  const [draft, setDraft] = useState(emptyOffer(defaultCategory));
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    const offer = await onCreate(providerId, draft);
    setSaving(false);
    if (offer) setDraft(emptyOffer(defaultCategory));
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-perx-line bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Benefit name">
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="field" placeholder="Weekend recovery pass" />
        </Field>
        <Field label="Price in ALL">
          <input type="number" min="100" step="100" value={draft.priceALL} onChange={(e) => setDraft({ ...draft, priceALL: e.target.value })} className="field" placeholder="4500" />
        </Field>
        <Field label="Category">
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="field">
            {CATEGORIES.map((cat) => <option key={cat.id} value={cat.id}>{cat.en}</option>)}
          </select>
        </Field>
        <Field label="Tags">
          <input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} className="field" placeholder="relax, recovery, self-care" />
        </Field>
      </div>
      <Field label="Description" className="mt-3">
        <textarea value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} className="field min-h-[86px] resize-none" placeholder="What the employee gets and how it works." />
      </Field>
      <div className="mt-3 flex justify-end">
        <button disabled={saving} className="pop-btn inline-flex items-center gap-1.5 grad-orange px-4 py-2.5 text-sm font-semibold text-white shadow-pop-sm disabled:opacity-50">
          <Ico name="plus" className="h-4 w-4" /> {saving ? "Saving..." : "Add benefit"}
        </button>
      </div>
    </form>
  );
}

function ProviderOfferCard({ offer, providerId, onUpdate, onArchive }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: offer.title,
    desc: offer.desc,
    category: offer.category,
    priceALL: String(offer.priceALL),
    tags: (offer.tags || []).join(", "),
  });
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setDraft({
      title: offer.title,
      desc: offer.desc,
      category: offer.category,
      priceALL: String(offer.priceALL),
      tags: (offer.tags || []).join(", "),
    });
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    const updated = await onUpdate(providerId, offer.id, draft);
    setSaving(false);
    if (updated) setEditing(false);
  }

  if (editing) {
    return (
      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3">
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="field" />
          <textarea value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} className="field min-h-[82px] resize-none" />
          <div className="grid grid-cols-2 gap-2">
            <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="field">
              {CATEGORIES.map((cat) => <option key={cat.id} value={cat.id}>{cat.en}</option>)}
            </select>
            <input type="number" min="100" step="100" value={draft.priceALL} onChange={(e) => setDraft({ ...draft, priceALL: e.target.value })} className="field" />
          </div>
          <input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} className="field" />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} disabled={saving} className="pop-btn flex-1 grad-blue py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          <button onClick={() => setEditing(false)} className="pop-btn bg-perx-ink/5 px-4 py-2.5 text-sm font-semibold text-perx-ink/60">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-perx-muted"><Ico name={offer.category} className="h-3.5 w-3.5" /> {CATEGORY_MAP[offer.category]?.en}</span>
        {offer.popular && <Pill className="!bg-perx-gold/12 !text-perx-gold"><Ico name="flame" className="h-3 w-3" /> Popular</Pill>}
      </div>
      <p className="mt-2 font-display font-semibold">{offer.title}</p>
      <p className="text-xs text-perx-ink/50">{offer.desc}</p>
      <div className="mt-2 font-display text-lg font-bold"><Money all={offer.priceALL} /></div>
      <div className="mt-3 flex gap-2 border-t border-perx-line pt-3">
        <button onClick={startEdit} className="pop-btn flex-1 bg-perx-ink/5 py-2 text-xs font-semibold text-perx-ink/70">Edit</button>
        <button onClick={() => onArchive(providerId, offer.id)} className="pop-btn bg-perx-pink/10 px-3 py-2 text-xs font-semibold text-perx-pink">Archive</button>
      </div>
    </div>
  );
}

function Field({ label, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-perx-muted">{label}</span>
      {children}
    </label>
  );
}

function MetricLine({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-sm">
      <span className="text-perx-ink/55">{label}</span>
      <span className="font-semibold text-perx-ink">{value}</span>
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
