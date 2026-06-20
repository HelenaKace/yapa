"use client";
import { motion } from "framer-motion";
import { useStore } from "@/app/store-context";
import { OFFERS, PROVIDERS, OFFER_MAP, PROVIDER_MAP } from "@/lib/seed";
import { Money } from "./ui";
import { Ico, ProviderIcon } from "./icons";

// Distinct pastel section bands (Juno-style) — each part of the page is its own color.
const BAND = {
  pink: "#FCE7EE",
  cream: "#FBF3C9",
  mint: "#E4F2E7",
  coral: "#F8875A",
  lilac: "#ECE6FB",
  white: "#FFFFFF",
};

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, delay: d },
});

function Blob({ variant, color, className = "", style = {} }) {
  const shape =
    variant === "bowtie"
      ? { clipPath: "polygon(0 0, 100% 0, 38% 50%, 100% 100%, 0 100%, 62% 50%)" }
      : { borderRadius: "42% 58% 57% 43% / 53% 44% 56% 47%" };
  return <div aria-hidden className={`pointer-events-none absolute ${className}`} style={{ backgroundColor: color, ...shape, ...style }} />;
}

export function Landing() {
  const { setStage, skipToDemo, tc } = useStore();
  const featured = ["o_saranda_wk", "o_gym_month", "o_skillup", "o_spa_day"];

  return (
    <div className="min-h-screen">
      {/* nav — solid, not glassy */}
      <nav className="sticky top-0 z-50 border-b border-perx-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-perx-ink font-display text-base font-extrabold text-white">P</div>
            <span className="font-display text-lg font-extrabold tracking-tight">YAPA</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setStage("auth")} className="pop-btn px-4 py-2 text-sm font-semibold text-perx-ink hover:bg-perx-ink/[0.05]">Log in</button>
            <button onClick={() => setStage("auth")} className="pop-btn bg-perx-ink px-4 py-2 text-sm font-semibold text-white">Sign up</button>
          </div>
        </div>
      </nav>

      {/* HERO — pink band */}
      <section className="relative overflow-hidden" style={{ backgroundColor: BAND.pink }}>
        <Blob variant="bowtie" color="#F7D14B" className="left-6 top-28 h-16 w-12 rotate-12 md:left-16" />
        <Blob variant="splash" color="#7ED0A0" className="right-8 top-40 h-20 w-24 md:right-24" />
        <Blob variant="splash" color="#C9B8F2" className="-bottom-6 left-1/4 h-16 w-20 opacity-80" />
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-20 text-center">
          <motion.span {...fade()} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-perx-ink shadow-sm">
            <Ico name="sparkles" className="h-4 w-4 text-perx-indigo" /> {tc.landingBadge}
          </motion.span>
          <motion.h1 {...fade(0.05)} className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-perx-ink md:text-6xl">
            {tc.heroLead} <span className="text-grad">{tc.heroEmph}</span>
          </motion.h1>
          <motion.p {...fade(0.1)} className="mx-auto mt-5 max-w-xl text-lg text-perx-ink/70">
            {tc.heroSub}
          </motion.p>
          <motion.div {...fade(0.15)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => setStage("auth")} className="pop-btn bg-perx-ink px-7 py-3.5 text-base font-semibold text-white">
              {tc.ctaPrimary}
            </button>
            <button onClick={() => skipToDemo("employee")} className="pop-btn inline-flex items-center gap-2 bg-white px-7 py-3.5 text-base font-semibold text-perx-ink shadow-sm">
              <Ico name="play" className="h-4 w-4" /> {tc.ctaSecondary}
            </button>
          </motion.div>
          <motion.p {...fade(0.2)} className="mt-4 text-xs font-medium text-perx-ink/50">Trusted by forward-thinking teams in Tirana · Albanian Lek · Shqip &amp; English</motion.p>

          <motion.div {...fade(0.25)} className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {featured.map((id) => {
              const o = OFFER_MAP[id];
              return (
                <div key={id} className="rounded-3xl border border-black/5 bg-white p-4 text-left">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-perx-indigo/10 text-perx-indigo"><ProviderIcon id={o.providerId} className="h-5 w-5" /></div>
                  <p className="mt-3 text-sm font-bold text-perx-ink">{o.title}</p>
                  <p className="text-xs text-perx-ink/50">{PROVIDER_MAP[o.providerId]?.name}</p>
                  <p className="mt-1 font-display text-sm font-bold text-perx-indigo"><Money all={o.priceALL} /></p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS — white band */}
      <section style={{ backgroundColor: BAND.white }}>
        <div className="mx-auto max-w-6xl px-5 py-20">
          <motion.h2 {...fade()} className="text-center font-display text-3xl font-extrabold tracking-tight md:text-4xl">{tc.howTitle}</motion.h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {tc.steps.map((s, i) => (
              <motion.div key={i} {...fade(i * 0.08)} className="rounded-4xl border border-perx-line bg-white p-7">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl text-white" style={{ backgroundColor: ["#F2683C", "#2DB390", "#9F7AEA"][i] }}><Ico name={["cart", "badge-check", "sparkles"][i]} className="h-6 w-6" /></span>
                  <span className="font-display text-3xl font-extrabold text-perx-line">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-perx-ink/60">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCES — mint band */}
      <section className="relative overflow-hidden" style={{ backgroundColor: BAND.mint }}>
        <Blob variant="bowtie" color="#F7D14B" className="right-10 top-12 h-14 w-10 -rotate-12" />
        <div className="mx-auto max-w-6xl px-5 py-20">
          <motion.h2 {...fade()} className="text-center font-display text-3xl font-extrabold tracking-tight md:text-4xl">One platform, three ways in</motion.h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { t: "For employees", color: "#F2683C", icon: "user", d: "Benefits you'll actually use. Personalized picks, streaks, rewards, and an AI concierge in your pocket.", points: ["AI concierge", "Smart bundles", "XP & rewards", "Year in Benefits"] },
              { t: "For employers", color: "#2DB390", icon: "employer", d: "Compete on what you offer your people. Approve in a tap, see what's loved, what goes unused.", points: ["1-tap approvals", "AI insights", "Budget control", "Team challenges"] },
              { t: "For providers", color: "#9F7AEA", icon: "provider", d: "List your deals to thousands of employees. Get paid directly on approval.", points: ["Reach employees", "Manage offers", "Live analytics", "Instant payouts"] },
            ].map((a, i) => (
              <motion.div key={a.t} {...fade(i * 0.08)} className="rounded-4xl border border-black/5 bg-white p-7">
                <span className="grid h-12 w-12 place-items-center rounded-2xl text-white" style={{ backgroundColor: a.color }}><Ico name={a.icon} className="h-6 w-6" /></span>
                <h3 className="mt-4 font-display text-xl font-extrabold">{a.t}</h3>
                <p className="mt-2 text-sm text-perx-ink/60">{a.d}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {a.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-perx-ink/80"><Ico name="check" className="h-4 w-4" style={{ color: a.color }} />{p}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI — coral band */}
      <section style={{ backgroundColor: BAND.coral }}>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center text-white">
          <motion.span {...fade()} className="inline-flex items-center gap-2 rounded-full bg-white/25 px-3 py-1 text-xs font-bold uppercase tracking-wide"><Ico name="sparkles" className="h-3.5 w-3.5" /> {tc.aiKicker}</motion.span>
          <motion.h2 {...fade(0.05)} className="mx-auto mt-5 max-w-2xl font-display text-3xl font-extrabold tracking-tight md:text-5xl">{tc.aiQuote}</motion.h2>
          <motion.p {...fade(0.1)} className="mx-auto mt-4 max-w-xl text-white/90">{tc.aiSub}</motion.p>
          <motion.button {...fade(0.15)} onClick={() => setStage("auth")} className="pop-btn mt-8 bg-perx-ink px-7 py-3.5 text-base font-semibold text-white">{tc.aiCta}</motion.button>
        </div>
      </section>

      {/* PROVIDERS — white band */}
      <section style={{ backgroundColor: BAND.white }}>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-center text-sm font-bold uppercase tracking-wide text-perx-ink/50">{tc.providersKicker}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {PROVIDERS.map((p) => (
              <span key={p.id} className="flex items-center gap-2 rounded-full border border-perx-line bg-white px-4 py-2 text-sm font-semibold text-perx-ink">
                <ProviderIcon id={p.id} className="h-4 w-4 text-perx-indigo" /> {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA — cream band */}
      <section className="relative overflow-hidden" style={{ backgroundColor: BAND.cream }}>
        <Blob variant="splash" color="#7ED0A0" className="left-10 top-10 h-16 w-20" />
        <Blob variant="bowtie" color="#F2683C" className="bottom-10 right-12 h-14 w-10 rotate-6 opacity-90" />
        <div className="mx-auto max-w-6xl px-5 py-24 text-center">
          <motion.h2 {...fade()} className="font-display text-3xl font-extrabold tracking-tight md:text-5xl">{tc.footerTitle}</motion.h2>
          <motion.button {...fade(0.1)} onClick={() => setStage("auth")} className="pop-btn mt-8 bg-perx-ink px-8 py-4 text-base font-semibold text-white">{tc.footerCta}</motion.button>
        </div>
      </section>
    </div>
  );
}
