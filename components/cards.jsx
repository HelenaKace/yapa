"use client";
import { motion } from "framer-motion";
import { useStore } from "@/app/store-context";
import { OFFER_MAP, PROVIDER_MAP, CATEGORY_MAP, PACKAGE_MAP, packagePriceALL, packageRawPriceALL } from "@/lib/seed";
import { Money, Pill } from "./ui";

// soft tinted icon tiles per category — premium, restrained
const CAT_TILE = {
  fitness: "bg-perx-indigo/10 text-perx-indigo",
  wellness: "bg-perx-emerald/10 text-perx-emerald",
  food: "bg-perx-purple/10 text-perx-purple",
  travel: "bg-perx-indigo/10 text-perx-indigo",
  learning: "bg-perx-purple/10 text-perx-purple",
  health: "bg-perx-emerald/10 text-perx-emerald",
  telecom: "bg-perx-indigo/10 text-perx-indigo",
  retail: "bg-perx-gold/15 text-perx-gold",
  transport: "bg-perx-violet/10 text-perx-violet",
};

export function OfferCard({ offerId, reason, compact }) {
  const { inCart, toggleCart } = useStore();
  const o = OFFER_MAP[offerId];
  if (!o) return null;
  const prov = PROVIDER_MAP[o.providerId];
  const cat = CATEGORY_MAP[o.category];
  const added = inCart("offer", o.id);

  return (
    <motion.div layout whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="card flex flex-col p-5 hover:shadow-pop-sm">
      <div className="mb-3 flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl text-xl ${CAT_TILE[o.category] || "bg-perx-ink/5"}`}>
          {prov?.emoji || cat?.emoji}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {o.popular && <Pill className="!bg-perx-gold/12 !text-perx-gold">Popular</Pill>}
          <span className="text-[11px] font-medium text-perx-muted">{cat?.en}</span>
        </div>
      </div>
      <h3 className="font-display text-[15px] font-bold leading-tight text-perx-ink">{o.title}</h3>
      <p className="mt-0.5 text-xs text-perx-muted">{prov?.name} · {prov?.city}</p>
      {!compact && <p className="mt-2 text-sm leading-relaxed text-perx-muted">{o.desc}</p>}
      {reason && (
        <div className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-perx-purple/8 px-2.5 py-1 text-[11px] font-semibold text-perx-purple">
          <span className="text-perx-purple">✦</span> {reason}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-perx-line pt-3">
        <span className="font-display text-lg font-bold text-perx-ink"><Money all={o.priceALL} /></span>
        <button
          onClick={() => toggleCart("offer", o.id)}
          className={`pop-btn px-4 py-2 text-sm ${added ? "bg-perx-ink text-white" : "grad-orange text-white shadow-pop-sm"}`}
        >
          {added ? "Added ✓" : "Add"}
        </button>
      </div>
    </motion.div>
  );
}

export function PackageCard({ packageId, large }) {
  const { inCart, toggleCart } = useStore();
  const pkg = PACKAGE_MAP[packageId];
  if (!pkg) return null;
  const price = packagePriceALL(pkg);
  const raw = packageRawPriceALL(pkg);
  const providers = [...new Set(pkg.offerIds.map((oid) => OFFER_MAP[oid]?.providerId))];
  const added = inCart("package", pkg.id);

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative overflow-hidden rounded-3xl border border-perx-line bg-white p-6 shadow-soft hover:shadow-pop-sm">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-perx-purple/[0.07] blur-2xl" />
      <div className="flex items-center justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-2xl grad-grape text-2xl">{pkg.emoji}</div>
        {pkg.seasonal && <Pill className="!bg-perx-gold/12 !text-perx-gold">✦ {pkg.seasonalLabel || "Limited drop"}</Pill>}
      </div>
      <h3 className="mt-3 font-display text-xl font-bold text-perx-ink">{pkg.title}</h3>
      <p className="text-sm text-perx-muted">{pkg.blurb}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {pkg.offerIds.map((oid) => (
          <span key={oid} className="rounded-full border border-perx-line bg-perx-bg px-2.5 py-1 text-[11px] font-medium text-perx-muted">
            {OFFER_MAP[oid]?.title}
          </span>
        ))}
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-perx-indigo">
        <span>⛓</span> spans {providers.length} providers · save 10%
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-perx-line pt-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-perx-ink"><Money all={price} /></span>
          <span className="text-sm text-perx-muted line-through"><Money all={raw} /></span>
        </div>
        <button
          onClick={() => toggleCart("package", pkg.id)}
          className={`pop-btn px-5 py-2.5 text-sm ${added ? "bg-perx-ink text-white" : "grad-grape text-white shadow-pop-sm"}`}
        >
          {added ? "Added ✓" : "Add bundle"}
        </button>
      </div>
    </motion.div>
  );
}
