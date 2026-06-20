"use client";
import { motion } from "framer-motion";
import { useStore } from "@/app/store-context";
import { OFFERS, PROVIDERS, OFFER_MAP, PROVIDER_MAP } from "@/lib/seed";
import { Money } from "./ui";

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, delay: d },
});

export function Landing() {
  const { setStage, skipToDemo } = useStore();
  const featured = ["o_saranda_wk", "o_gym_month", "o_skillup", "o_spa_day"];

  return (
    <div className="min-h-screen">
      {/* nav */}
      <nav className="sticky top-0 z-50 glass border-b border-perx-line">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-2xl grad-grape font-display text-base font-extrabold text-white">P</div>
            <span className="font-display text-lg font-extrabold tracking-tight">PERX</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setStage("auth")} className="pop-btn px-4 py-2 text-sm font-semibold text-perx-ink hover:bg-perx-ink/[0.04]">Log in</button>
            <button onClick={() => setStage("auth")} className="pop-btn grad-grape px-4 py-2 text-sm font-semibold text-white shadow-pop-sm">Sign up</button>
          </div>
        </div>
      </nav>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-perx-indigo/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-20 h-80 w-80 rounded-full bg-perx-purple/15 blur-3xl" />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-20 text-center">
          <motion.span {...fade()} className="inline-flex items-center gap-2 rounded-full border border-perx-line bg-white/70 px-4 py-1.5 text-sm font-semibold text-perx-purple">
            ✦ AI-native benefits · Built for Albania
          </motion.span>
          <motion.h1 {...fade(0.05)} className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-perx-ink md:text-6xl">
            The perks employees <span className="text-grad">actually want.</span>
          </motion.h1>
          <motion.p {...fade(0.1)} className="mx-auto mt-5 max-w-xl text-lg text-perx-muted">
            A benefits marketplace people open every week — not once a quarter. Your company funds it, you just pick what you love.
          </motion.p>
          <motion.div {...fade(0.15)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => setStage("auth")} className="pop-btn grad-grape px-7 py-3.5 text-base font-semibold text-white shadow-glow">
              Get started — it's 2 min
            </button>
            <button onClick={() => skipToDemo("employee")} className="pop-btn border border-perx-line bg-white px-7 py-3.5 text-base font-semibold text-perx-ink shadow-soft">
              ▶ Skip to live demo
            </button>
          </motion.div>
          <motion.p {...fade(0.2)} className="mt-4 text-xs text-perx-muted">Trusted by forward-thinking teams in Tirana · Albanian Lek · Shqip & English</motion.p>

          {/* floating featured strip */}
          <motion.div {...fade(0.25)} className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {featured.map((id, i) => {
              const o = OFFER_MAP[id];
              return (
                <motion.div key={id} animate={{ y: [0, -6, 0] }} transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                  className="card p-4 text-left">
                  <div className="text-2xl">{PROVIDER_MAP[o.providerId]?.emoji}</div>
                  <p className="mt-2 text-sm font-bold text-perx-ink">{o.title}</p>
                  <p className="text-xs text-perx-muted">{PROVIDER_MAP[o.providerId]?.name}</p>
                  <p className="mt-1 font-display text-sm font-bold text-perx-indigo"><Money all={o.priceALL} /></p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <motion.h2 {...fade()} className="text-center font-display text-3xl font-extrabold tracking-tight">How PERX works</motion.h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { n: "01", t: "Pick what you love", d: "Browse a marketplace of local deals and AI-built bundles. Add them to a selection.", icon: "🛍️" },
            { n: "02", t: "Your employer approves", d: "One tap funds it. The money never passes through your hands.", icon: "✅" },
            { n: "03", t: "Enjoy — we pay providers", d: "Payment routes directly to each gym, clinic, or travel agency. Done.", icon: "✨" },
          ].map((s, i) => (
            <motion.div key={s.n} {...fade(i * 0.08)} className="card p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-perx-indigo/10 text-2xl">{s.icon}</span>
                <span className="font-display text-2xl font-extrabold text-perx-line">{s.n}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-perx-muted">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* three audiences */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { t: "For employees", grad: "grad-grape", d: "Benefits you'll actually use. Personalized picks, streaks, rewards, and an AI concierge in your pocket.", points: ["AI concierge", "Smart bundles", "XP & rewards", "Year in Benefits"] },
            { t: "For employers", grad: "grad-blue", d: "Compete on what you offer your people. Approve in a tap, see what's loved, what goes unused.", points: ["1-tap approvals", "AI insights", "Budget control", "Team challenges"] },
            { t: "For providers", grad: "grad-emerald", d: "List your deals to thousands of employees. Get paid directly on approval.", points: ["Reach employees", "Manage offers", "Live analytics", "Instant payouts"] },
          ].map((a, i) => (
            <motion.div key={a.t} {...fade(i * 0.08)} className={`overflow-hidden rounded-3xl ${a.grad} p-6 text-white shadow-pop`}>
              <h3 className="font-display text-xl font-extrabold">{a.t}</h3>
              <p className="mt-2 text-sm text-white/80">{a.d}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {a.points.map((p) => <li key={p} className="flex items-center gap-2"><span>›</span>{p}</li>)}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI band */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <motion.div {...fade()} className="relative overflow-hidden rounded-4xl grad-hero p-10 text-center text-white shadow-glow">
          <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">✦ Powered by Claude</span>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            “Find me something relaxing under 5,000 L.”
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">Just talk to PERX. It understands your intent, respects your budget, and bundles offers from multiple providers into one perfect package.</p>
          <button onClick={() => setStage("auth")} className="pop-btn mt-7 bg-white px-7 py-3.5 text-base font-semibold text-perx-indigo shadow-pop-sm">Try the concierge</button>
        </motion.div>
      </section>

      {/* providers marquee */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-perx-muted">Local providers, ready to go</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {PROVIDERS.map((p) => (
            <span key={p.id} className="flex items-center gap-2 rounded-full border border-perx-line bg-white px-4 py-2 text-sm font-medium text-perx-ink shadow-soft">
              <span>{p.emoji}</span> {p.name}
            </span>
          ))}
        </div>
      </section>

      {/* footer cta */}
      <section className="mx-auto max-w-6xl px-5 pb-24 text-center">
        <motion.div {...fade()}>
          <h2 className="font-display text-3xl font-extrabold tracking-tight">Ready to actually enjoy your benefits?</h2>
          <button onClick={() => setStage("auth")} className="pop-btn mt-6 grad-grape px-8 py-4 text-base font-semibold text-white shadow-glow">Create your free account</button>
        </motion.div>
      </section>
    </div>
  );
}
