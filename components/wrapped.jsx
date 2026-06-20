"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/app/store-context";
import { summarize, levelFor, achievements } from "@/lib/gamify";
import { CATEGORY_MAP } from "@/lib/seed";
import { Money } from "./ui";
import { Ico } from "./icons";

const SLIDE_MS = 4200;

export function Wrapped() {
  const { wrappedOpen, setWrappedOpen, me, user, catalog } = useStore();
  const orders = me?.orders || [];
  const g = me?.gamification || {};
  const s = useMemo(() => summarize(orders, catalog), [orders, catalog]);
  const lvl = levelFor(g.points || 0);
  const badges = achievements(orders, g.streakWeeks || 0, catalog).filter((a) => a.unlocked).length;
  const firstName = user?.name?.split(" ")[0] || "you";

  const slides = useMemo(() => buildSlides({ s, g, lvl, badges, firstName }), [s, g, lvl, badges, firstName]);
  const [i, setI] = useState(0);

  useEffect(() => { if (wrappedOpen) setI(0); }, [wrappedOpen]);
  useEffect(() => {
    if (!wrappedOpen) return;
    const t = setTimeout(() => setI((x) => (x < slides.length - 1 ? x + 1 : x)), SLIDE_MS);
    return () => clearTimeout(t);
  }, [wrappedOpen, i, slides.length]);

  if (!wrappedOpen) return null;
  const slide = slides[i];

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[120] grid place-items-center bg-black/70 p-4 backdrop-blur"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="relative w-full max-w-sm overflow-hidden rounded-4xl shadow-pop" style={{ aspectRatio: "9/16", maxHeight: "92vh" }}>
          {/* progress segments */}
          <div className="absolute inset-x-0 top-0 z-20 flex gap-1 p-3">
            {slides.map((_, idx) => (
              <div key={idx} className="h-1 flex-1 overflow-hidden rounded-full bg-perx-ink/15">
                <motion.div className="h-full bg-perx-ink"
                  initial={{ width: idx < i ? "100%" : "0%" }}
                  animate={{ width: idx < i ? "100%" : idx === i ? "100%" : "0%" }}
                  transition={{ duration: idx === i ? SLIDE_MS / 1000 : 0, ease: "linear" }} />
              </div>
            ))}
          </div>
          <button onClick={() => setWrappedOpen(false)} className="absolute right-3 top-6 z-30 grid h-8 w-8 place-items-center rounded-full bg-perx-ink/10 text-perx-ink"><Ico name="close" className="h-4 w-4" /></button>

          {/* tap zones */}
          <button className="absolute left-0 top-0 z-10 h-full w-1/3" onClick={() => setI((x) => Math.max(0, x - 1))} aria-label="prev" />
          <button className="absolute right-0 top-0 z-10 h-full w-1/3" onClick={() => setI((x) => Math.min(slides.length - 1, x + 1))} aria-label="next" />

          <AnimatePresence mode="wait">
            <motion.div key={i} className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center text-perx-ink" style={{ backgroundColor: slide.bg }}
              initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {slide.content}
            </motion.div>
          </AnimatePresence>

          {i === slides.length - 1 && (
            <button onClick={() => setWrappedOpen(false)} className="absolute inset-x-8 bottom-8 z-30 inline-flex items-center justify-center gap-2 rounded-full bg-perx-ink py-3 font-display text-sm font-bold text-white">
              Done — see you next week <Ico name="sparkles" className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Big({ children }) { return <div className="font-display text-6xl font-extrabold leading-none tracking-tight">{children}</div>; }
function Label({ children }) { return <p className="mt-4 max-w-[15rem] text-lg font-medium text-perx-ink/70">{children}</p>; }
function Kicker({ children }) { return <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-perx-ink/55">{children}</p>; }

function buildSlides({ s, g, lvl, badges, firstName }) {
  const slides = [];
  slides.push({
    bg: "#FCE7EE",
    content: (<><motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 12 }}><Ico name="gift" className="h-16 w-16" /></motion.div>
      <h2 className="mt-5 font-display text-3xl font-extrabold">Your Year<br />in Benefits</h2>
      <Label>A quick look back, {firstName}. Tap to continue.</Label></>),
  });
  slides.push({
    bg: "#ECE6FB",
    content: (<><Kicker>You enjoyed</Kicker><Big><Money all={s.total} /></Big>
      <Label>in perks — fully funded by your company. That's money that stayed in your pocket.</Label></>),
  });
  slides.push({
    bg: "#E4F2E7",
    content: (<><Kicker>You claimed</Kicker><Big>{s.lineCount}</Big>
      <Label>benefits across {s.cats.size} categor{s.cats.size === 1 ? "y" : "ies"}{s.hasPackage ? " — including a smart bundle." : "."}</Label></>),
  });
  if (s.topCat) slides.push({
    bg: "#FBF3C9",
    content: (<><Ico name={s.topCat.icon} className="h-16 w-16" /><Kicker>Your top vibe</Kicker>
      <h2 className="font-display text-4xl font-extrabold">{s.topCat.label}</h2>
      <Label>You spent the most here. Clearly your happy place.</Label></>),
  });
  slides.push({
    bg: "#DCEFE2",
    content: (<><Kicker>Wellness score</Kicker><Big>{s.wellnessScore}</Big>
      <Label>{s.wellnessScore >= 50 ? "A true Wellness Hero — your future self says thanks." : "Room to relax more next year — your spa day awaits."}</Label></>),
  });
  slides.push({
    bg: "#FDE7DE",
    content: (<><Ico name={lvl.current.icon} className="h-16 w-16" /><Kicker>You reached</Kicker>
      <h2 className="font-display text-4xl font-extrabold">{lvl.current.id}</h2>
      <div className="mt-4 flex items-center gap-4">
        <Stat n={g.points || 0} l="points" /><Stat n={g.streakWeeks || 0} l="week streak" /><Stat n={badges} l="badges" />
      </div></>),
  });
  return slides;
}

function Stat({ n, l }) {
  return (<div><div className="font-display text-2xl font-extrabold">{n}</div><div className="text-xs text-perx-ink/55">{l}</div></div>);
}
