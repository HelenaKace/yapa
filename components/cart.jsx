"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/app/store-context";
import { OFFER_MAP, PACKAGE_MAP, PROVIDER_MAP, packagePriceALL } from "@/lib/seed";
import { Money } from "./ui";

export function CartButton() {
  const { cart, role } = useStore();
  const [open, setOpen] = useState(false);
  if (role !== "employee") return null;
  return (
    <>
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ scale: 0, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 40 }}
            onClick={() => setOpen(true)}
            className="pop-btn fixed bottom-6 right-6 z-[70] flex items-center gap-2 grad-orange px-5 py-3.5 text-white shadow-pop"
          >
            <span className="text-lg">🛒</span>
            <span className="font-semibold">{cart.length}</span>
            <span className="hidden sm:inline">· <Money all={useCartTotal()} /></span>
          </motion.button>
        )}
      </AnimatePresence>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function useCartTotal() {
  const { cartTotal } = useStore();
  return cartTotal;
}

function CartDrawer({ open, onClose }) {
  const { cart, cartTotal, removeFromCart, submitSelection, me } = useStore();
  const overBudget = me && cartTotal > me.budgetLeftALL;
  const providers = new Set(
    cart.flatMap((c) =>
      c.kind === "package"
        ? (PACKAGE_MAP[c.id]?.offerIds || []).map((oid) => OFFER_MAP[oid]?.providerId)
        : [OFFER_MAP[c.id]?.providerId]
    )
  );

  async function submit() {
    await submitSelection();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[80] bg-perx-ink/30 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="fixed bottom-0 left-0 right-0 z-[90] mx-auto max-h-[85vh] max-w-lg overflow-hidden rounded-t-5xl bg-perx-cloud shadow-pop sm:bottom-4 sm:rounded-5xl"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            <div className="flex items-center justify-between p-5 pb-2">
              <h2 className="font-display text-xl font-bold">🛒 Your selection</h2>
              <button onClick={onClose} className="pop-btn grid h-8 w-8 place-items-center bg-perx-ink/5">✕</button>
            </div>

            <div className="no-scrollbar max-h-[45vh] space-y-2 overflow-y-auto px-5">
              {cart.length === 0 && <p className="py-8 text-center text-perx-ink/50">Nothing here yet — go find something good.</p>}
              {cart.map((c) => {
                const isPkg = c.kind === "package";
                const item = isPkg ? PACKAGE_MAP[c.id] : OFFER_MAP[c.id];
                const price = isPkg ? packagePriceALL(item) : item?.priceALL;
                return (
                  <div key={c.kind + c.id} className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-pop-sm">
                    <div className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${isPkg ? "grad-grape" : "grad-blue"} text-white`}>
                      {isPkg ? item?.emoji : PROVIDER_MAP[item?.providerId]?.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item?.title}</p>
                      <p className="text-xs text-perx-ink/50">{isPkg ? `Bundle · ${item?.offerIds.length} items` : PROVIDER_MAP[item?.providerId]?.name}</p>
                    </div>
                    <span className="font-display text-sm font-semibold"><Money all={price} /></span>
                    <button onClick={() => removeFromCart(c.kind, c.id)} className="text-perx-ink/30 hover:text-perx-pink">✕</button>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 p-5">
              {cart.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-perx-blue">
                  🔗 routes payment to {providers.size} provider{providers.size > 1 ? "s" : ""} on approval
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-perx-ink/60">Total</span>
                <span className="font-display text-2xl font-bold"><Money all={cartTotal} /></span>
              </div>
              {overBudget && (
                <p className="rounded-xl bg-perx-pink/10 px-3 py-2 text-xs font-semibold text-perx-pink">
                  Over your remaining budget — remove an item or ask your employer to top up.
                </p>
              )}
              <button
                onClick={submit}
                disabled={cart.length === 0 || overBudget}
                className="pop-btn w-full grad-orange py-3.5 text-base font-semibold text-white shadow-pop disabled:opacity-40"
              >
                🚀 Submit for approval
              </button>
              <p className="text-center text-[11px] text-perx-ink/40">
                Your employer approves, then we pay each provider directly. Money never touches your hands.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
