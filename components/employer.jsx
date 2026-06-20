"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/app/store-context";
import { EMPLOYEE_MAP, EMPLOYEES, EMPLOYER } from "@/lib/seed";
import { offerMapFor } from "@/lib/catalog";
import { itemMeta, payoutLinesForItems, providerPayouts } from "@/lib/orders";
import { Money, Pill, AiBadge, Section, Blob } from "./ui";
import { Ico, PackageIcon } from "./icons";

export function EmployerApp() {
  const { full, catalog, decide, lang } = useStore();
  const [insights, setInsights] = useState(null);
  const [aiLive, setAiLive] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingAi, setLoadingAi] = useState(true);

  const orders = full?.orders || [];
  const pending = orders.filter((o) => o.status === "pending");
  const decided = orders.filter((o) => o.status !== "pending");
  const pendingLiabilityALL = stats?.pendingLiabilityALL ?? pending.reduce((sum, order) => sum + order.totalALL, 0);
  const orderSignal = orders.map((order) => `${order.id}:${order.status}:${order.decidedAt || ""}:${(order.payments || []).map((payment) => payment.fulfillmentStatus).join(",")}`).join("|");

  useEffect(() => {
    setLoadingAi(true);
    fetch(`/api/insights?lang=${lang}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setInsights(d.insights);
        setStats(d.stats);
        setAiLive(!!d.ai);
      })
      .finally(() => setLoadingAi(false));
  }, [orderSignal, lang]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6">
      <div className="relative mb-6 overflow-hidden rounded-5xl p-6 text-perx-ink shadow-soft" style={{ backgroundColor: "#E4F2E7" }}>
        <Blob variant="bowtie" color="#F7D14B" className="right-8 top-7 h-12 w-9 -rotate-12" />
        <Blob variant="splash" color="#2DB390" className="-bottom-8 -right-4 h-28 w-32 opacity-25" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Pill className="!bg-white !text-perx-ink shadow-sm"><Ico name="employer" className="h-3.5 w-3.5" /> {EMPLOYER.name}</Pill>
            <h1 className="mt-2 font-display text-3xl font-extrabold">People Ops dashboard</h1>
            <p className="max-w-xl text-perx-ink/70">Approve employee benefits, reserve budget, and route provider payouts in one flow.</p>
          </div>
          <div className="rounded-3xl bg-white/70 p-4 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold text-perx-muted">
              <Ico name="card" className="h-4 w-4 text-perx-emerald" /> Provider payout rail
            </div>
            <p className="mt-1 max-w-xs text-sm font-medium text-perx-ink">Approvals reserve budget and prepare provider payout details instantly.</p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Pending approvals" value={pending.length} icon="clock" />
        <Kpi label="Pending liability" value={<Money all={pendingLiabilityALL} />} icon="wallet" />
        <Kpi label="Fulfilled items" value={stats?.fulfilledPayments ?? 0} icon="badge-check" />
        <Kpi label="Total committed" value={<Money all={stats?.totalSpendALL || 0} />} icon="chart" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="Approvals queue" sub="Review budget impact, then route payouts to each provider">
            {pending.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-perx-emerald/10 text-perx-emerald">
                  <Ico name="check" className="h-6 w-6" />
                </div>
                <p className="mt-3 font-display text-lg font-semibold">All requests reviewed</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-perx-ink/50">Submit a selection from the employee view to see the approval and payout loop run live.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((order) => (
                  <ApprovalCard
                    key={order.id}
                    order={order}
                    catalog={catalog}
                    decide={decide}
                    usedALL={full?.budgetUsedByEmployee?.[order.employeeId] || 0}
                  />
                ))}
              </div>
            )}
          </Section>

          {decided.length > 0 && (
            <Section title="Recent decisions" sub="Audit trail for approvals, declines, and payment batches">
              <div className="space-y-3">
                {decided.slice(0, 5).map((order) => <DecisionRow key={order.id} order={order} />)}
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          <InsightCard loadingAi={loadingAi} insights={insights} aiLive={aiLive} />
          <TeamBudgetCard full={full} />
        </div>
      </div>
    </div>
  );
}

function ApprovalCard({ order, catalog, decide, usedALL }) {
  const emp = EMPLOYEE_MAP[order.employeeId];
  const payouts = providerPayouts(payoutLinesForItems(order.items, catalog));
  const beforeALL = Math.max(0, usedALL - order.totalALL);
  const pct = Math.min(100, Math.round((usedALL / EMPLOYER.budgetPerEmployeeALL) * 100));
  const beforePct = Math.min(100, Math.round((beforeALL / EMPLOYER.budgetPerEmployeeALL) * 100));

  return (
    <motion.div layout className="card overflow-hidden p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl grad-grape text-white"><Ico name="user" className="h-5 w-5" /></div>
          <div>
            <p className="font-display text-lg font-semibold">{emp?.name}</p>
            <p className="text-xs text-perx-ink/50">{emp?.role} - requested {timeAgo(order.createdAt)}</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-perx-muted">Reserved amount</p>
          <p className="font-display text-2xl font-bold"><Money all={order.totalALL} /></p>
        </div>
      </div>

      {order.note && (
        <p className="mt-3 rounded-2xl bg-perx-ink/[0.04] px-3 py-2 text-sm text-perx-ink/65">{order.note}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {order.items.map((item) => <ItemPill key={item.type + item.id} item={item} catalog={catalog} />)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-perx-line bg-perx-bg p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-perx-muted">Budget impact</span>
            <span><Money all={usedALL} /> / <Money all={EMPLOYER.budgetPerEmployeeALL} /></span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-perx-ink/10">
            <div className="absolute inset-y-0 left-0 bg-perx-ink/25" style={{ width: `${beforePct}%` }} />
            <motion.div className="absolute inset-y-0 left-0 grad-blue" initial={{ width: `${beforePct}%` }} animate={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-perx-ink/45">This request is already reserved while pending, then becomes committed when approved.</p>
        </div>

        <div className="rounded-3xl border border-perx-line bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-perx-muted">Payout split</p>
            <Pill className="!bg-perx-emerald/10 !text-perx-emerald">{payouts.length} provider{payouts.length > 1 ? "s" : ""}</Pill>
          </div>
          <div className="space-y-2">
            {payouts.map((payout) => (
              <ProviderPayout key={payout.providerId} payout={payout} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button onClick={() => decide(order.id, "approve")} className="pop-btn inline-flex flex-1 items-center justify-center gap-1.5 grad-blue py-3 text-sm font-semibold text-white shadow-pop-sm">
          <Ico name="check" className="h-4 w-4" /> Approve and route payouts
        </button>
        <button onClick={() => decide(order.id, "decline")} className="pop-btn bg-perx-ink/5 px-5 py-3 text-sm font-semibold text-perx-ink/60">
          Decline
        </button>
      </div>
    </motion.div>
  );
}

function DecisionRow({ order }) {
  const emp = EMPLOYEE_MAP[order.employeeId];
  const approved = order.status === "approved";
  const payouts = providerPayouts(order.payments || []);
  const fulfilled = (order.payments || []).filter((payment) => payment.fulfillmentStatus === "fulfilled").length;
  const paymentCount = (order.payments || []).length;
  const fullyFulfilled = approved && paymentCount > 0 && fulfilled === paymentCount;
  return (
    <div className="card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-semibold">{emp?.name}</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${fullyFulfilled ? "bg-perx-emerald/10 text-perx-emerald" : approved ? "grad-blue text-white" : "bg-perx-ink/10 text-perx-ink/60"}`}>
              <Ico name={fullyFulfilled ? "badge-check" : approved ? "check" : "hand"} className="h-3.5 w-3.5" /> {fullyFulfilled ? "Fulfilled" : approved ? "Paid" : "Declined"}
            </span>
          </div>
          <p className="mt-1 text-xs text-perx-ink/45">{order.items.length} item{order.items.length > 1 ? "s" : ""} - decided {timeAgo(order.decidedAt)}</p>
          {approved && paymentCount > 0 && <p className="mt-1 text-[11px] font-medium text-perx-ink/40">{fulfilled}/{paymentCount} provider item{paymentCount > 1 ? "s" : ""} fulfilled</p>}
          {order.paymentBatch?.ref && <p className="mt-1 truncate text-[11px] font-medium text-perx-ink/35">{order.paymentBatch.ref}</p>}
        </div>
        <div className="text-left sm:text-right">
          <p className="font-display text-lg font-bold"><Money all={order.totalALL} /></p>
          {approved && <p className="text-xs text-perx-blue">{payouts.length} provider payout{payouts.length > 1 ? "s" : ""}</p>}
        </div>
      </div>
    </div>
  );
}

function ItemPill({ item, catalog }) {
  const meta = itemMeta(item, catalog);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-perx-line bg-white px-3 py-1 text-xs font-medium">
      {meta.isPackage ? <PackageIcon theme={meta.theme} className="h-3.5 w-3.5 text-perx-purple" /> : <Ico name="ticket" className="h-3.5 w-3.5 text-perx-purple" />}
      {meta.title}
    </span>
  );
}

function ProviderPayout({ payout }) {
  const { catalog } = useStore();
  const offers = offerMapFor(catalog);
  return (
    <div className="rounded-2xl bg-perx-bg px-3 py-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-semibold">{payout.providerName}</span>
        <span className="font-display font-semibold text-perx-blue"><Money all={payout.amountALL} /></span>
      </div>
      <p className="mt-0.5 truncate text-[11px] text-perx-ink/40">
        {payout.lines.map((line) => offers[line.offerId]?.title).filter(Boolean).join(", ")}
      </p>
    </div>
  );
}

function InsightCard({ loadingAi, insights, aiLive }) {
  return (
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
  );
}

function TeamBudgetCard({ full }) {
  return (
    <div className="card p-5">
      <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold"><Ico name="users" className="h-4 w-4 text-perx-purple" /> Team budgets</h3>
      <div className="space-y-4">
        {EMPLOYEES.map((employee) => {
          const used = full?.budgetUsedByEmployee?.[employee.id] || 0;
          const left = EMPLOYER.budgetPerEmployeeALL - used;
          const pct = Math.min(100, Math.round((used / EMPLOYER.budgetPerEmployeeALL) * 100));
          return (
            <div key={employee.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5"><Ico name="user" className="h-3.5 w-3.5 text-perx-muted" /> {employee.name.split(" ")[0]}</span>
                <span className="text-perx-ink/50"><Money all={left} /> left</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-perx-ink/10">
                <motion.div className="h-full grad-orange" initial={{ width: 0 }} animate={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-perx-ink/35"><Money all={used} /> reserved or committed</p>
            </div>
          );
        })}
      </div>
    </div>
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

function timeAgo(ts) {
  if (!ts) return "just now";
  const minutes = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
