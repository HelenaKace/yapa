"use client";
import { motion } from "framer-motion";
import { useStore } from "@/app/store-context";
import { LANGS } from "@/lib/i18n";
import { CURRENCIES } from "@/lib/format";
import { Money, ProgressRing } from "./ui";

const ROLES = [
  { id: "employee", label: "Employee" },
  { id: "employer", label: "Employer" },
  { id: "provider", label: "Provider" },
];

export function TopBar() {
  const { role, setRole, lang, setLang, currency, setCurrency, me, setConciergeOpen, resetDemo } = useStore();

  return (
    <header className="sticky top-0 z-50 glass border-b border-perx-line">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-2xl grad-grape font-display text-base font-extrabold text-white shadow-pop-sm">
            P
          </div>
          <div className="leading-none">
            <div className="font-display text-lg font-extrabold tracking-tight text-perx-ink">PERX</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-perx-muted">Tirana</div>
          </div>
        </div>

        {/* role switch */}
        <div className="ml-3 hidden items-center gap-1 rounded-2xl bg-perx-ink/[0.04] p-1 sm:flex">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`pop-btn px-3.5 py-1.5 text-sm ${
                role === r.id ? "bg-white text-perx-ink shadow-soft" : "text-perx-muted hover:text-perx-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-2xl bg-perx-ink/[0.04] p-1">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`pop-btn px-2 py-1 text-xs ${lang === l.code ? "bg-white shadow-soft" : "text-perx-muted"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-2xl border border-perx-line bg-white px-2.5 py-1.5 text-xs font-semibold text-perx-muted outline-none"
          >
            {Object.values(CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>

          {role === "employee" && (
            <>
              <button
                onClick={() => setConciergeOpen(true)}
                className="pop-btn hidden items-center gap-1.5 grad-grape px-3.5 py-2 text-sm text-white shadow-pop-sm md:flex"
              >
                ✦ Ask PERX
              </button>
              {me && (
                <div className="hidden items-center gap-2 rounded-2xl border border-perx-line bg-white py-1 pl-3 pr-1.5 shadow-soft sm:flex">
                  <div className="text-right leading-none">
                    <div className="text-[10px] font-medium text-perx-muted">Budget left</div>
                    <div className="font-display text-sm font-bold text-perx-ink"><Money all={me.budgetLeftALL} /></div>
                  </div>
                  <ProgressRing value={me.budgetLeftALL} max={me.budgetTotalALL} size={36} />
                </div>
              )}
            </>
          )}
          <button
            onClick={resetDemo}
            title="Reset demo data"
            className="pop-btn grid h-9 w-9 place-items-center bg-perx-ink/[0.04] text-perx-muted hover:text-perx-ink"
          >
            ↺
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-4 pb-2 sm:hidden">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`pop-btn flex-1 py-1.5 text-xs ${role === r.id ? "bg-white text-perx-ink shadow-soft" : "bg-perx-ink/[0.04] text-perx-muted"}`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </header>
  );
}
