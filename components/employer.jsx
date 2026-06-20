"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/app/store-context";
import { OFFER_MAP, PACKAGE_MAP, PROVIDER_MAP, EMPLOYEE_MAP, EMPLOYEES, EMPLOYER } from "@/lib/seed";
import { Money, Pill, AiBadge, Section } from "./ui";
import { Ico, PackageIcon } from "./icons";

export function EmployerApp() {
  const { full, decide, lang } = useStore();
  const [insights, setInsights] = useState(null);
  const [aiLive, setAiLive] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingAi, setLoadingAi] = useState(true);

  const pending = (full?.orders || []).filter((o) => o.status === "pending");
  const decided = (full?.orders || []).filter((o) => o.status !== "pending");

  function loadInsights() {
    setLoadingAi(true);
    fetch(`/api/insights?lang=${lang}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setInsights(d.insights); setStats(d.stats); setAiLive(!!d.ai); })
      .finally(() => setLoadingAi(false));
  }
  useEffect(() => { loadInsights(); /* eslint-disable-next-line */ }, [full?.orders?.length, lang]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6">
      <div className="mb-6 overflow-hidden rounded-5xl grad-blue p-6 text-white shadow-pop">
        <Pill className="!bg-white/20 !text-white"><Ico name="employer" className="h-3.5 w-3.5" /> {EMPLOYER.name}</Pill>
        <h1 className="mt-2 font-display text-3xl font-bold">People Ops dashboard</h1>
        <p className="text-white/80">Approve benefits, route payments, and see what your team actually values.</p>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Pending approvals" value={pending.length} icon="clock" />
        <Kpi label="Budget utilised" value={`${stats?.utilisationPct ?? 0}%`} icon="wallet" />
        <Kpi label="Active employees" value={`${stats?.activeEmployees ?? 0}/${EMPLOYEES.length}`} icon="users" />
        <Kpi label="Total committed" value={<Money all={stats?.totalSpendALL || 0} />} icon="chart" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* approvals */}
        <div className="lg:col-span-2">
          <Section title="Approvals queue" sub="One tap to fund — payment routes to each provider">
            {pending.length === 0 ? (
              <div className="card p-8 text-center text-perx-ink/50">All caught up — no pending requests.</div>
            ) : (
              <div className="space-y-3">
                {pending.map((o) => <ApprovalCard key={o.id} order={o} decide={decide} />)}
              </div>
            )}
          </Section>

          {decided.length > 0 && (
            <Section title="Recently decided">
              <div className="space-y-2">
                {decided.slice(0, 5).map((o) => {
                  const emp = EMPLOYEE_MAP[o.employeeId];
                  return (
                    <div key={o.id} className="card flex items-center justify-between p-3 text-sm">
                      <span className="flex items-center gap-2"><Ico name="user" className="h-4 w-4 text-perx-muted" /> {emp?.name} · {o.items.length} item{o.items.length > 1 ? "s" : ""}</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${o.status === "approved" ? "grad-blue text-white" : "bg-perx-ink/10"}`}>
                        <Ico name={o.status === "approved" ? "check" : "hand"} className="h-3.5 w-3.5" /> {o.status === "approved" ? "Paid" : "Declined"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </div>

        {/* AI insights + team */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold"><Ico name="sparkles" className="h-4 w-4 text-perx-purple" /> AI insights</h3>
              <AiBadge live={aiLive} />
            </div>
            {loadingAi ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/60" />)}
              </div>
            ) : (
              <>
                <p className="mb-3 rounded-2xl bg-perx-purple/10 p-3 text-sm font-medium text-perx-purple">{insights?.headline}</p>
                <div className="space-y-2">
                  {(insights?.insights || []).map((ins, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex gap-2.5 rounded-2xl bg-white/70 p-3">
                      <Ico name="insight" className="mt-0.5 h-4 w-4 flex-shrink-0 text-perx-gold" />
                      <div>
                        <p className="text-sm font-semibold">{ins.title}</p>
                        <p className="text-xs text-perx-ink/60">{ins.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold"><Ico name="users" className="h-4 w-4 text-perx-purple" /> Team budgets</h3>
            <div className="space-y-3">
              {EMPLOYEES.map((e) => {
                const used = full?.budgetUsedByEmployee?.[e.id] || 0;
                const pct = Math.min(100, Math.round((used / EMPLOYER.budgetPerEmployeeALL) * 100));
                return (
                  <div key={e.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5"><Ico name="user" className="h-3.5 w-3.5 text-perx-muted" /> {e.name.split(" ")[0]}</span>
                      <span className="text-perx-ink/50"><Money all={used} /></span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-perx-ink/10">
                      <motion.div className="h-full grad-orange" initial={{ width: 0 }} animate={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApprovalCard({ order, decide }) {
  const emp = EMPLOYEE_MAP[order.employeeId];
  const providers = new Set(
    order.items.flatMap((it) =>
      it.kind === "package" ? (PACKAGE_MAP[it.id]?.offerIds || []).map((oid) => OFFER_MAP[oid]?.providerId) : [OFFER_MAP[it.id]?.providerId]
    )
  );
  return (
    <motion.div layout className="card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl grad-grape text-white"><Ico name="user" className="h-5 w-5" /></div>
          <div>
            <p className="font-display font-semibold">{emp?.name}</p>
            <p className="text-xs text-perx-ink/50">{emp?.role}</p>
          </div>
        </div>
        <span className="font-display text-xl font-bold"><Money all={order.totalALL} /></span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {order.items.map((it) => {
          const title = it.kind === "package" ? PACKAGE_MAP[it.id]?.title : OFFER_MAP[it.id]?.title;
          return <span key={it.id} className="inline-flex items-center gap-1.5 rounded-full border border-perx-line bg-white px-3 py-1 text-xs font-medium">{it.kind === "package" ? <PackageIcon theme={PACKAGE_MAP[it.id]?.theme} className="h-3.5 w-3.5 text-perx-purple" /> : <Ico name="ticket" className="h-3.5 w-3.5 text-perx-purple" />} {title}</span>;
        })}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-perx-blue"><Ico name="link" className="h-3.5 w-3.5" /> will pay {providers.size} provider{providers.size > 1 ? "s" : ""} directly</div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => decide(order.id, "approve")} className="pop-btn inline-flex flex-1 items-center justify-center gap-1.5 grad-blue py-2.5 text-sm font-semibold text-white shadow-pop-sm">
          <Ico name="check" className="h-4 w-4" /> Approve &amp; pay
        </button>
        <button onClick={() => decide(order.id, "decline")} className="pop-btn bg-perx-ink/5 px-4 py-2.5 text-sm font-semibold text-perx-ink/60">
          Decline
        </button>
      </div>
    </motion.div>
  );
}

function Kpi({ label, value, icon }) {
  return (
    <div className="card relative overflow-hidden p-4">
      <Ico name={icon} className="h-5 w-5 text-perx-purple" />
      <div className="mt-1.5 font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-perx-ink/50">{label}</div>
    </div>
  );
}
