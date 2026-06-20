"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/app/store-context";
import { OFFER_MAP, PROVIDER_MAP } from "@/lib/seed";
import { Money, AiBadge } from "./ui";
import { Ico, ProviderIcon } from "./icons";

export function Concierge() {
  const { conciergeOpen, setConciergeOpen, lang, toggleCart, inCart, user, tc } = useStore();
  const SUGGESTIONS = tc.suggestions;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLive, setAiLive] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const history = [...messages, { role: "user", content }];
    setMessages(history);
    setLoading(true);
    try {
      const r = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: history.map(({ role, content }) => ({ role, content })), lang }),
      });
      const d = await r.json();
      setAiLive(!!d.ai);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: d.reply, recommendIds: d.recommendIds || [], bundle: d.bundle, vibe: d.vibe },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Hmm, I glitched. Try again?", recommendIds: [] }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {conciergeOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-perx-ink/30 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConciergeOpen(false)}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-md flex-col bg-perx-cloud shadow-pop"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
          >
            {/* header */}
            <div className="grad-grape p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ico name="sparkles" className="h-6 w-6" />
                  <div>
                    <h2 className="font-display text-lg font-bold leading-none">{tc.conciergeTitle}</h2>
                    <p className="text-xs text-white/70">{tc.conciergeSub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AiBadge live={aiLive} />
                  <button onClick={() => setConciergeOpen(false)} className="pop-btn grid h-8 w-8 place-items-center bg-white/20 text-white"><Ico name="close" className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="no-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="mt-4 text-center">
                  <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-3xl grad-grape text-white shadow-pop"><Ico name="wand" className="h-7 w-7" /></div>
                  <p className="font-display text-lg font-semibold">Hi {user?.name?.split(" ")[0]} — {tc.conciergeEmpty}</p>
                  <p className="text-sm text-perx-ink/50">I'll find perks that fit your vibe and budget.</p>
                  <div className="mt-4 flex flex-col gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => send(s)} className="rounded-2xl bg-white/80 px-4 py-2.5 text-left text-sm font-medium text-perx-ink/80 shadow-pop-sm transition hover:scale-[1.02]">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <Bubble key={i} m={m} toggleCart={toggleCart} inCart={inCart} />
              ))}

              {loading && (
                <div className="flex items-center gap-1.5 pl-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="h-2.5 w-2.5 rounded-full bg-perx-purple"
                      animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }} />
                  ))}
                </div>
              )}
            </div>

            {/* input */}
            <div className="border-t border-white/60 bg-white/60 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask for anything…"
                  className="flex-1 rounded-full border border-white bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-perx-purple/40"
                />
                <button onClick={() => send()} disabled={loading} className="pop-btn grid h-11 w-11 place-items-center grad-grape text-white shadow-pop-sm disabled:opacity-50">
                  <Ico name="send" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Bubble({ m, toggleCart, inCart }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-3xl rounded-br-lg grad-orange px-4 py-2.5 text-sm font-medium text-white shadow-pop-sm">
          {m.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="max-w-[88%] rounded-3xl rounded-bl-lg bg-white px-4 py-3 text-sm text-perx-ink shadow-pop-sm">
        {m.content}
      </div>
      {m.recommendIds?.length > 0 && (
        <div className="space-y-2 pl-1">
          {m.recommendIds.map((id) => {
            const o = OFFER_MAP[id];
            if (!o) return null;
            const added = inCart("offer", id);
            return (
              <div key={id} className="flex items-center gap-3 rounded-2xl bg-white/80 p-2.5 shadow-pop-sm">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl grad-blue text-white">
                  <ProviderIcon id={o.providerId} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{o.title}</p>
                  <p className="text-xs text-perx-ink/50"><Money all={o.priceALL} /> · {PROVIDER_MAP[o.providerId]?.name}</p>
                </div>
                <button onClick={() => toggleCart("offer", id)} className={`pop-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs ${added ? "bg-perx-ink text-white" : "grad-orange text-white"}`}>
                  {added ? <Ico name="check" className="h-3.5 w-3.5" /> : <><Ico name="plus" className="h-3.5 w-3.5" /> Add</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {m.bundle?.offerIds?.length >= 2 && <BundleCard bundle={m.bundle} toggleCart={toggleCart} inCart={inCart} />}
    </div>
  );
}

function BundleCard({ bundle, toggleCart, inCart }) {
  const price = bundle.offerIds.reduce((s, id) => s + (OFFER_MAP[id]?.priceALL || 0), 0);
  return (
    <div className="rounded-3xl grad-grape p-4 text-white shadow-pop">
      <div className="flex items-center gap-1.5 text-xs font-semibold opacity-90"><Ico name="sparkles" className="h-3.5 w-3.5" /> AI-built bundle</div>
      <h4 className="font-display text-lg font-bold">{bundle.title}</h4>
      <div className="mt-2 space-y-1">
        {bundle.offerIds.map((id) => (
          <div key={id} className="flex items-center justify-between text-sm">
            <span>{OFFER_MAP[id]?.title}</span>
            <span className="opacity-80"><Money all={OFFER_MAP[id]?.priceALL || 0} /></span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-2">
        <span className="font-display text-lg font-bold"><Money all={price} /></span>
        <button
          onClick={() => bundle.offerIds.forEach((id) => !inCart("offer", id) && toggleCart("offer", id))}
          className="pop-btn inline-flex items-center gap-1.5 bg-white px-4 py-2 text-sm font-semibold text-perx-purple"
        >
          <Ico name="check" className="h-4 w-4" /> Add all
        </button>
      </div>
    </div>
  );
}
