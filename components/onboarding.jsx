"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/app/store-context";
import { OFFER_MAP, PACKAGE_MAP, PROVIDER_MAP } from "@/lib/seed";
import { Money } from "./ui";
import { Ico, ProviderIcon, PackageIcon } from "./icons";

const INTERESTS = [
  { id: "fitness", label: "Fitness", icon: "fitness", cats: ["fitness"] },
  { id: "travel", label: "Travel", icon: "travel", cats: ["travel"] },
  { id: "wellness", label: "Wellness", icon: "wellness", cats: ["wellness"] },
  { id: "food", label: "Food", icon: "food", cats: ["food"] },
  { id: "learning", label: "Learning", icon: "learning", cats: ["learning"] },
  { id: "entertainment", label: "Entertainment", icon: "drama", cats: ["food", "travel"] },
  { id: "family", label: "Family", icon: "users", cats: ["retail", "health"] },
  { id: "technology", label: "Technology", icon: "laptop", cats: ["telecom", "learning"] },
];
const GOALS = [
  { id: "save", label: "Save money", icon: "savings" },
  { id: "health", label: "Improve health", icon: "heart" },
  { id: "skills", label: "Learn new skills", icon: "rocket" },
  { id: "travel", label: "Travel more", icon: "globe" },
  { id: "stress", label: "Reduce stress", icon: "leaf" },
  { id: "enjoy", label: "Enjoy life more", icon: "sparkles" },
];
const DISCOVERY = [
  { id: "personalized", label: "Personalized recommendations", icon: "target" },
  { id: "trending", label: "Trending now", icon: "flame" },
  { id: "friends", label: "Friend recommendations", icon: "handshake" },
  { id: "concierge", label: "AI concierge suggestions", icon: "sparkles" },
];
const VIBES = [
  { id: "Explorer", icon: "compass" },
  { id: "Achiever", icon: "trophy" },
  { id: "Wellness Seeker", icon: "wellness" },
  { id: "Adventurer", icon: "mountain" },
  { id: "Foodie", icon: "wine" },
  { id: "Learner", icon: "book" },
];

export function Onboarding() {
  const { account, completeOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState([]);
  const [goals, setGoals] = useState([]);
  const [discovery, setDiscovery] = useState([]);
  const [vibe, setVibe] = useState(null);
  const [picks, setPicks] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const total = 5;
  const firstName = account?.name?.split(" ")[0] || "there";

  const toggle = (arr, set, id) =>
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const derivedCats = [...new Set(interests.flatMap((i) => INTERESTS.find((x) => x.id === i)?.cats || []))];

  async function runAI() {
    setStep(5);
    setLoadingAi(true);
    try {
      const qs = new URLSearchParams({ interests: derivedCats.join(","), vibe: vibe || "" });
      const r = await fetch(`/api/recommend?${qs}`, { cache: "no-store" });
      const d = await r.json();
      setPicks(d.items || []);
    } catch {
      setPicks([]);
    } finally {
      setLoadingAi(false);
    }
  }

  function finish() {
    completeOnboarding({ interests, goals, discovery, vibe, cats: derivedCats });
  }

  const canNext =
    (step === 1 && interests.length > 0) ||
    (step === 2 && goals.length > 0) ||
    (step === 3 && discovery.length > 0) ||
    (step === 4 && vibe);

  return (
    <div className="min-h-screen">
      {/* progress */}
      {step > 0 && step <= total && (
        <div className="sticky top-0 z-40 glass border-b border-perx-line">
          <div className="mx-auto max-w-2xl px-5 py-3">
            <div className="flex items-center justify-between text-xs font-semibold text-perx-muted">
              <span>Step {Math.min(step, total)} of {total}</span>
              <span>~2 min</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-perx-ink/[0.06]">
              <motion.div className="h-full grad-grape" initial={false} animate={{ width: `${(Math.min(step, total) / total) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-2xl px-5 py-10">
        <AnimatePresence mode="wait">
          {/* welcome */}
          {step === 0 && (
            <Slide key="welcome">
              <div className="grid min-h-[60vh] place-items-center text-center">
                <div>
                  <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 14 }}
                    className="mx-auto grid h-20 w-20 place-items-center rounded-3xl grad-hero text-white shadow-glow"><Ico name="sparkles" className="h-9 w-9" /></motion.div>
                  <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight md:text-4xl">Welcome, {firstName}.</h1>
                  <p className="mx-auto mt-3 max-w-md text-lg text-perx-muted">Let's personalize your benefits experience. It takes about 2 minutes.</p>
                  <button onClick={() => setStep(1)} className="pop-btn mt-8 inline-flex items-center gap-2 grad-grape px-8 py-3.5 text-base font-semibold text-white shadow-glow">Let's go <Ico name="arrow" className="h-4 w-4" /></button>
                </div>
              </div>
            </Slide>
          )}

          {step === 1 && (
            <Slide key="interests">
              <Q title="What interests you most?" sub="Pick all that apply.">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {INTERESTS.map((o) => <Chip key={o.id} active={interests.includes(o.id)} onClick={() => toggle(interests, setInterests, o.id)} {...o} />)}
                </div>
              </Q>
            </Slide>
          )}
          {step === 2 && (
            <Slide key="goals">
              <Q title="What are your goals this year?" sub="Choose a few.">
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map((o) => <Chip key={o.id} active={goals.includes(o.id)} onClick={() => toggle(goals, setGoals, o.id)} {...o} wide />)}
                </div>
              </Q>
            </Slide>
          )}
          {step === 3 && (
            <Slide key="discovery">
              <Q title="How do you like discovering offers?" sub="Pick your style.">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {DISCOVERY.map((o) => <Chip key={o.id} active={discovery.includes(o.id)} onClick={() => toggle(discovery, setDiscovery, o.id)} {...o} wide />)}
                </div>
              </Q>
            </Slide>
          )}
          {step === 4 && (
            <Slide key="vibe">
              <Q title="Choose your vibe" sub="This shapes your profile.">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {VIBES.map((o) => <Chip key={o.id} active={vibe === o.id} onClick={() => setVibe(o.id)} label={o.id} icon={o.icon} />)}
                </div>
              </Q>
            </Slide>
          )}

          {/* AI summary */}
          {step === 5 && (
            <Slide key="ai">
              <div className="text-center">
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="mx-auto grid h-16 w-16 place-items-center rounded-3xl grad-hero text-white shadow-glow">
                  <Ico name={VIBES.find((v) => v.id === vibe)?.icon || "sparkles"} className="h-7 w-7" />
                </motion.div>
                <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight">You're a {vibe}.</h1>
                <p className="mx-auto mt-2 max-w-md text-perx-muted">
                  {loadingAi ? "Our AI is preparing experiences tailored just for you…" : "Based on your interests, we've prepared experiences tailored just for you."}
                </p>

                <div className="mt-7 space-y-3 text-left">
                  {loadingAi
                    ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)
                    : (picks || []).slice(0, 4).map((it, i) => <PickRow key={it.id} it={it} i={i} />)}
                </div>

                <button onClick={finish} disabled={loadingAi} className="pop-btn mt-8 inline-flex w-full items-center justify-center gap-2 grad-grape py-3.5 text-base font-semibold text-white shadow-glow disabled:opacity-50">
                  Enter PERX <Ico name="arrow" className="h-4 w-4" />
                </button>
              </div>
            </Slide>
          )}
        </AnimatePresence>

        {/* nav */}
        {step >= 1 && step <= 4 && (
          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 text-sm font-medium text-perx-muted hover:text-perx-ink"><Ico name="back" className="h-4 w-4" /> Back</button>
            <button
              onClick={() => (step === 4 ? runAI() : setStep(step + 1))}
              disabled={!canNext}
              className="pop-btn inline-flex items-center gap-1.5 grad-grape px-7 py-3 text-sm font-semibold text-white shadow-pop-sm disabled:opacity-40"
            >
              {step === 4 ? <>See my picks <Ico name="sparkles" className="h-4 w-4" /></> : "Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Slide({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );
}

function Q({ title, sub, children }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
      <p className="mt-1 text-perx-muted">{sub}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, label, icon, wide }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-2xl border-2 px-4 ${wide ? "py-3.5" : "flex-col py-5"} text-center transition-all ${
        active ? "border-perx-purple bg-perx-purple/[0.05] shadow-pop-sm" : "border-perx-line bg-white hover:border-perx-purple/40"
      }`}
    >
      <span className={`grid place-items-center rounded-xl ${wide ? "h-8 w-8" : "h-11 w-11"} ${active ? "bg-perx-purple/10 text-perx-purple" : "bg-perx-ink/[0.04] text-perx-muted"}`}>
        <Ico name={icon} className={wide ? "h-4 w-4" : "h-5 w-5"} />
      </span>
      <span className="text-sm font-semibold text-perx-ink">{label}</span>
    </motion.button>
  );
}

function PickRow({ it, i }) {
  const o = OFFER_MAP[it.id];
  const p = PACKAGE_MAP[it.id];
  const title = o?.title || p?.title;
  const price = o?.priceALL ?? (p ? p.offerIds.reduce((s, x) => s + (OFFER_MAP[x]?.priceALL || 0), 0) : 0);
  if (!title) return null;
  return (
    <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
      className="card flex items-center gap-3 p-3.5">
      <div className="grid h-11 w-11 place-items-center rounded-2xl grad-grape text-white">{o ? <ProviderIcon id={o.providerId} className="h-5 w-5" /> : <PackageIcon theme={p?.theme} className="h-5 w-5" />}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-perx-ink">{title}</p>
        {it.reason && <p className="flex items-center gap-1 truncate text-xs text-perx-purple"><Ico name="sparkles" className="h-3 w-3 flex-shrink-0" /> {it.reason}</p>}
      </div>
      <span className="font-display text-sm font-bold text-perx-ink"><Money all={price} /></span>
    </motion.div>
  );
}
