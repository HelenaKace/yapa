"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/app/store-context";
import { formatMoney } from "@/lib/format";

export function Money({ all, className = "" }) {
  const { currency } = useStore();
  return <span className={className}>{formatMoney(all, currency)}</span>;
}

export function Pill({ children, className = "", grad }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        grad ? `${grad} text-white` : "bg-perx-ink/[0.04] text-perx-muted"
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function Section({ title, action, children, sub }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between px-0.5">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-perx-ink">{title}</h2>
          {sub && <p className="mt-0.5 text-sm text-perx-muted">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProgressRing({ value, max, size = 54 }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(22,19,31,0.07)" strokeWidth="6" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - pct) }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Elegant reward-reveal — replaces confetti. Soft glass card, gentle glow.
export function RewardReveal() {
  const { rocket } = useStore();
  return (
    <AnimatePresence>
      {rocket && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[100] grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-perx-ink/10 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -8 }}
            transition={{ type: "spring", damping: 18, stiffness: 240 }}
            className="relative flex flex-col items-center gap-3 rounded-3xl bg-white px-10 py-8 shadow-glow"
          >
            <div className="relative grid h-16 w-16 place-items-center rounded-full grad-grape text-2xl text-white">
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: "0 0 0 0 rgba(124,58,237,0.5)" }}
                animate={{ boxShadow: ["0 0 0 0 rgba(124,58,237,0.4)", "0 0 0 22px rgba(124,58,237,0)"] }}
                transition={{ duration: 1.4, repeat: 1 }}
              />
              {rocket.emoji || "✓"}
            </div>
            <p className="font-display text-lg font-bold text-perx-ink">{rocket.title}</p>
            {rocket.sub && <p className="-mt-1 text-sm text-perx-muted">{rocket.sub}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
// keep old name working
export const RocketOverlay = RewardReveal;

export function Toast() {
  const { toast } = useStore();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: 60, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0 }}
          className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2"
        >
          <div className="flex items-center gap-2 rounded-full bg-perx-ink px-5 py-3 text-sm font-medium text-white shadow-pop">
            <span className={`h-2 w-2 rounded-full ${toast.kind === "warn" ? "bg-perx-gold" : "bg-perx-emerald"}`} />
            {toast.text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AiBadge({ live }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        live ? "bg-perx-emerald/10 text-perx-emerald" : "bg-perx-ink/[0.05] text-perx-muted"
      }`}
      title={live ? "Powered by live Claude" : "Add ANTHROPIC_API_KEY for live AI"}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-perx-emerald" : "bg-perx-muted"}`} />
      {live ? "AI live" : "AI demo"}
    </span>
  );
}
