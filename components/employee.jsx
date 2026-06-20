"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/app/store-context";
import {
  OFFERS, PACKAGES, CATEGORIES, OFFER_MAP, PACKAGE_MAP, CATEGORY_MAP,
} from "@/lib/seed";
import { OfferCard, PackageCard } from "./cards";
import { Section, Money, Pill, AiBadge } from "./ui";
import { levelFor, achievements, LEVELS } from "@/lib/gamify";

const TABS = [
  { id: "discover", label: "Discover", emoji: "✨" },
  { id: "browse", label: "Browse", emoji: "🧭" },
  { id: "packages", label: "Packages", emoji: "🎁" },
  { id: "rewards", label: "Rewards", emoji: "🏆" },
  { id: "mybenefits", label: "My Benefits", emoji: "💖" },
];

export function EmployeeApp() {
  const [tab, setTab] = useState("discover");
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6">
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pop-btn whitespace-nowrap px-4 py-2 text-sm ${
              tab === t.id ? "grad-orange text-white shadow-pop-sm" : "bg-white/70 text-perx-ink/60"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "discover" && <Discover onBrowse={() => setTab("browse")} />}
          {tab === "browse" && <Browse />}
          {tab === "packages" && <Packages />}
          {tab === "rewards" && <Rewards />}
          {tab === "mybenefits" && <MyBenefits />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Discover ---------------- */
function Discover({ onBrowse }) {
  const { user, me, full, setConciergeOpen, profile } = useStore();
  const [recs, setRecs] = useState(null);
  const [aiLive, setAiLive] = useState(false);

  useEffect(() => {
    let on = true;
    const qs = new URLSearchParams();
    if (profile?.cats?.length) qs.set("interests", profile.cats.join(","));
    if (profile?.vibe) qs.set("vibe", profile.vibe);
    fetch(`/api/recommend?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (on) { setRecs(d.items || []); setAiLive(!!d.ai); } })
      .catch(() => on && setRecs([]));
    return () => { on = false; };
  }, [me?.budgetLeftALL, profile]);

  const trending = OFFERS.filter((o) => o.popular).slice(0, 4);
  const seasonal = PACKAGES.filter((p) => p.seasonal);

  return (
    <>
      {/* hero */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative mb-8 overflow-hidden rounded-5xl grad-hero p-8 text-white shadow-glow"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-perx-emerald/20 blur-3xl" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90">
          {greeting()} · {user?.role}
        </span>
        <h1 className="mt-3 max-w-xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight md:text-[2.6rem]">
          {greeting()}, {user?.name?.split(" ")[0]}.
        </h1>
        <p className="mt-2 max-w-md text-[15px] text-white/75">
          Your company has set aside benefits made for you. Spend them on what you actually love.
        </p>
        <div className="mt-6 flex flex-wrap items-stretch gap-3">
          <HeroStat label="Budget left" value={<Money all={me?.budgetLeftALL || 0} />} />
          <HeroStat label="PERX points" value={me?.gamification?.points ?? 0} />
          <HeroStat label="Streak" value={`${me?.gamification?.streakWeeks ?? 0} wks`} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <button onClick={() => setConciergeOpen(true)} className="pop-btn bg-white px-5 py-2.5 text-sm font-semibold text-perx-indigo shadow-pop-sm">
            ✦ Talk to the concierge
          </button>
          <button onClick={onBrowse} className="pop-btn border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15">
            Browse the marketplace
          </button>
        </div>
      </motion.div>

      {/* AI picks */}
      <Section
        title="Picked for you"
        sub="Personalized by AI from your interests & budget"
        action={<AiBadge live={aiLive} />}
      >
        {!recs ? (
          <SkeletonRow />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recs.map((it) =>
              PACKAGE_MAP[it.id] ? (
                <PackageCard key={it.id} packageId={it.id} />
              ) : (
                <OfferCard key={it.id} offerId={it.id} reason={it.reason} />
              )
            )}
          </div>
        )}
      </Section>

      {/* seasonal */}
      {seasonal.length > 0 && (
        <Section title="Seasonal drops" sub="Limited-time — gone when summer's gone">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {seasonal.map((p) => <PackageCard key={p.id} packageId={p.id} />)}
          </div>
        </Section>
      )}

      {/* trending + activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="Trending this week" sub="What your colleagues are loving">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {trending.map((o) => <OfferCard key={o.id} offerId={o.id} compact />)}
            </div>
          </Section>
        </div>
        <ActivityFeed activity={full?.activity || []} />
      </div>
    </>
  );
}

function ActivityFeed({ activity }) {
  return (
    <div className="card p-5">
      <h3 className="mb-3 font-display text-lg font-semibold">🔔 Live at TechNest</h3>
      <div className="space-y-3">
        {activity.slice(0, 7).map((a) => (
          <div key={a.id} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full grad-orange" />
            <div>
              <p className="text-perx-ink/80">{a.text}</p>
              <p className="text-[11px] text-perx-ink/35">{timeAgo(a.ts)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Browse ---------------- */
function Browse() {
  const [cat, setCat] = useState("all");
  const list = cat === "all" ? OFFERS : OFFERS.filter((o) => o.category === cat);
  return (
    <>
      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
        <CatChip active={cat === "all"} onClick={() => setCat("all")} emoji="🌈" label="All" />
        {CATEGORIES.map((c) => (
          <CatChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} emoji={c.emoji} label={c.en} />
        ))}
      </div>
      <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((o) => <OfferCard key={o.id} offerId={o.id} />)}
      </motion.div>
    </>
  );
}

function CatChip({ active, onClick, emoji, label }) {
  return (
    <button
      onClick={onClick}
      className={`pop-btn whitespace-nowrap px-4 py-2 text-sm ${active ? "bg-perx-ink text-white" : "bg-white/70 text-perx-ink/60"}`}
    >
      {emoji} {label}
    </button>
  );
}

/* ---------------- Packages ---------------- */
function Packages() {
  return (
    <>
      <div className="mb-6 rounded-4xl bg-white/60 p-5">
        <h2 className="font-display text-2xl font-semibold">🎁 Smart Packages</h2>
        <p className="text-perx-ink/60">Curated bundles that span several providers — one tap, one approval, 10% off.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {PACKAGES.map((p) => <PackageCard key={p.id} packageId={p.id} large />)}
      </div>
    </>
  );
}

/* ---------------- My Benefits ---------------- */
function MyBenefits() {
  const { me, setWrappedOpen } = useStore();
  if (!me) return <SkeletonRow />;
  const g = me.gamification || {};
  const orders = me.orders || [];
  const approved = orders.filter((o) => o.status === "approved");
  const lines = approved.flatMap((o) =>
    o.items.flatMap((it) =>
      it.kind === "package" ? (PACKAGE_MAP[it.id]?.offerIds || []) : [it.id]
    )
  );
  const categoriesUsed = new Set(lines.map((oid) => OFFER_MAP[oid]?.category).filter(Boolean));
  const totalSpent = approved.reduce((s, o) => s + o.totalALL, 0);

  return (
    <>
      {/* gamification strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard emoji="🔥" big={`${g.streakWeeks || 0} wk`} label="Wellness streak" grad="grad-orange" />
        <StatCard emoji="⭐️" big={`${g.points || 0}`} label="PERX points" grad="grad-grape" />
        <StatCard emoji="🎯" big={`${categoriesUsed.size}/${CATEGORIES.length}`} label="Categories explored" grad="grad-blue" />
        <StatCard emoji="✅" big={`${approved.length}`} label="Benefits claimed" grad="grad-sun" />
      </div>

      {/* year in benefits */}
      <button onClick={() => setWrappedOpen(true)}
        className="mb-6 block w-full overflow-hidden rounded-5xl grad-hero p-6 text-left text-white shadow-glow transition hover:brightness-105">
        <Pill className="!bg-white/20 !text-white">🎞️ Your Year in Benefits</Pill>
        <h3 className="mt-2 font-display text-2xl font-bold">
          {totalSpent > 0 ? <>You've enjoyed <Money all={totalSpent} /> in perks</> : "Your story starts with one tap"}
        </h3>
        <p className="mt-1 text-white/80">
          {categoriesUsed.size > 0
            ? `Across ${categoriesUsed.size} categories — tap to play your Wrapped recap ▶`
            : "Pick your first benefit to start building your highlight reel ▶"}
        </p>
      </button>

      <Section title="Your requests" sub="Track approvals & payments in real time">
        {orders.length === 0 ? (
          <div className="card p-8 text-center text-perx-ink/50">Nothing yet — go grab something good ✨</div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => <OrderRow key={o.id} order={o} />)}
          </div>
        )}
      </Section>
    </>
  );
}

function OrderRow({ order }) {
  const status = {
    pending: { t: "Awaiting approval", c: "bg-perx-yellow/30 text-perx-ink", e: "⏳" },
    approved: { t: "Approved & paid", c: "grad-blue text-white", e: "✅" },
    declined: { t: "Declined", c: "bg-perx-ink/10 text-perx-ink/60", e: "✋" },
  }[order.status];
  return (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {order.items.map((it) => {
            const title = it.kind === "package" ? PACKAGE_MAP[it.id]?.title : OFFER_MAP[it.id]?.title;
            const emoji = it.kind === "package" ? PACKAGE_MAP[it.id]?.emoji : "🎟️";
            return (
              <span key={it.id} className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium border border-white">
                {emoji} {title}
              </span>
            );
          })}
        </div>
        <p className="mt-1.5 text-[11px] text-perx-ink/40">{timeAgo(order.createdAt)}</p>
      </div>
      <div className="text-right">
        <div className="font-display text-lg font-semibold"><Money all={order.totalALL} /></div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.c}`}>
          {status.e} {status.t}
        </span>
      </div>
    </div>
  );
}

/* ---------------- Rewards ---------------- */
function Rewards() {
  const { me, setWrappedOpen, setConciergeOpen } = useStore();
  if (!me) return <SkeletonRow />;
  const g = me.gamification || {};
  const orders = me.orders || [];
  const lvl = levelFor(g.points || 0);
  const badges = achievements(orders, g.streakWeeks || 0);
  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <>
      {/* level card */}
      <div className={`relative mb-6 overflow-hidden rounded-5xl ${lvl.current.grad} p-7 text-white shadow-glow`}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Your level</span>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-4xl">{lvl.current.emoji}</span>
              <h2 className="font-display text-3xl font-extrabold">{lvl.current.id}</h2>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-extrabold">{g.points || 0}</div>
            <div className="text-xs text-white/70">PERX points</div>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs font-medium text-white/80">
            <span>{lvl.current.id}</span>
            <span>{lvl.next ? `${lvl.toNext} pts to ${lvl.next.id} ${lvl.next.emoji}` : "Max level reached 👑"}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
            <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: `${lvl.pct * 100}%` }} transition={{ duration: 0.9 }} />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <span key={l.id} className={`rounded-full px-3 py-1 text-xs font-semibold ${l.min <= (g.points || 0) ? "bg-white/25" : "bg-white/10 text-white/60"}`}>
              {l.emoji} {l.id}
            </span>
          ))}
        </div>
      </div>

      {/* stat strip */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard emoji="🔥" big={`${g.streakWeeks || 0} wk`} label="Streak" />
        <StatCard emoji="🏅" big={`${unlocked}/${badges.length}`} label="Badges" />
        <button onClick={() => setWrappedOpen(true)} className="card p-4 text-left transition hover:shadow-pop-sm">
          <div className="text-xl">🎞️</div>
          <div className="mt-1 font-display text-base font-bold text-perx-ink">Year in Benefits</div>
          <div className="text-xs text-perx-purple">Play recap ▶</div>
        </button>
      </div>

      {/* seasonal event */}
      <div className="mb-6 flex flex-col items-start gap-3 overflow-hidden rounded-4xl border border-perx-line bg-white p-5 shadow-soft sm:flex-row sm:items-center">
        <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl grad-sun text-2xl">☀️</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold">Summer Wellness Week</h3>
            <Pill className="!bg-perx-gold/12 !text-perx-gold">Live now</Pill>
          </div>
          <p className="text-sm text-perx-muted">Complete a wellness benefit this week to earn 2× points and a limited badge.</p>
        </div>
        <button onClick={() => setConciergeOpen(true)} className="pop-btn grad-grape px-4 py-2 text-sm font-semibold text-white shadow-pop-sm">Join challenge</button>
      </div>

      {/* achievements */}
      <Section title="Achievements" sub={`${unlocked} of ${badges.length} unlocked`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {badges.map((b) => (
            <motion.div key={b.id} whileHover={{ y: -3 }}
              className={`flex flex-col items-center rounded-3xl border p-4 text-center ${b.unlocked ? "border-perx-line bg-white shadow-soft" : "border-dashed border-perx-line bg-perx-bg"}`}>
              <span className={`text-3xl ${b.unlocked ? "" : "opacity-30 grayscale"}`}>{b.emoji}</span>
              <span className={`mt-2 text-sm font-bold ${b.unlocked ? "text-perx-ink" : "text-perx-muted"}`}>{b.title}</span>
              <span className="mt-0.5 text-[11px] text-perx-muted">{b.unlocked ? "Unlocked" : b.desc}</span>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur">
      <div className="text-[11px] font-medium uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-0.5 font-display text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function StatCard({ emoji, big, label }) {
  return (
    <div className="card p-4">
      <div className="text-xl">{emoji}</div>
      <div className="mt-1 font-display text-2xl font-bold text-perx-ink">{big}</div>
      <div className="text-xs text-perx-muted">{label}</div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton h-48 rounded-3xl" />
      ))}
    </div>
  );
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
