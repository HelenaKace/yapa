"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/app/store-context";
import { Ico } from "./icons";
import { Blob } from "./ui";
import { Logo } from "./logo";

const ROLES = [
  { id: "employee", title: "Employee", desc: "I want to discover and use company benefits.", grad: "grad-grape", icon: "user" },
  { id: "employer", title: "Employer", desc: "I want to provide benefits to my team.", grad: "grad-blue", icon: "employer" },
  { id: "provider", title: "Service Provider", desc: "I want to offer services and deals.", grad: "grad-emerald", icon: "provider" },
];

export function Auth() {
  const { setStage, signUp, logIn } = useStore();
  const [mode, setMode] = useState("signup"); // signup | login
  const [step, setStep] = useState(0); // 0 credentials, 1 role
  const [name, setName] = useState("Erisa Hoxha");
  const [email, setEmail] = useState("erisa@technest.al");
  const [password, setPassword] = useState("perx1234");
  const [role, setRole] = useState("employee");

  function next() {
    if (mode === "login") return logIn({ name, email });
    setStep(1);
  }
  function finish() {
    signUp({ name, email, role });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* left brand panel */}
      <div className="relative hidden overflow-hidden p-12 text-perx-ink lg:block" style={{ backgroundColor: "#FCE7EE" }}>
        <Blob variant="bowtie" color="#F7D14B" className="right-16 top-28 h-16 w-12 rotate-12" />
        <Blob variant="splash" color="#7ED0A0" className="-bottom-10 -left-6 h-40 w-44 opacity-50" />
        <button onClick={() => setStage("landing")} className="relative inline-flex items-center">
          <Logo className="h-11" />
        </button>
        <div className="relative mt-32 max-w-sm">
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight">A benefits platform you'll actually want to open.</h2>
          <p className="mt-4 text-perx-ink/70">Personalized perks, an AI concierge, rewards and streaks — funded by your employer, designed around you.</p>
          <div className="mt-10 space-y-3">
            {["AI-personalized home feed", "Bundles across multiple providers", "Earn XP, levels & badges"].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm font-medium">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-perx-ink text-white"><Ico name="check" className="h-4 w-4" /></span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* right form panel */}
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <button onClick={() => setStage("landing")} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-perx-muted hover:text-perx-ink lg:hidden"><Ico name="back" className="h-4 w-4" /> Back</button>

          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div key="cred" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <h1 className="font-display text-2xl font-extrabold tracking-tight">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
                <p className="mt-1 text-sm text-perx-muted">{mode === "signup" ? "It takes about 2 minutes." : "Log in to your benefits."}</p>

                <div className="mt-6 space-y-3">
                  {mode === "signup" && <Field label="Full name" value={name} onChange={setName} placeholder="Your name" />}
                  <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.al" />
                  <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                </div>

                <button onClick={next} className="pop-btn mt-6 w-full grad-grape py-3.5 text-sm font-semibold text-white shadow-pop-sm">
                  {mode === "signup" ? "Continue" : "Log in"}
                </button>

                <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-perx-line bg-white py-3 text-sm font-semibold text-perx-ink hover:bg-perx-bg">
                  <Ico name="globe" className="h-4 w-4" /> Continue with Google
                </button>

                <p className="mt-5 text-center text-sm text-perx-muted">
                  {mode === "signup" ? "Already have an account?" : "New to YAPA?"}{" "}
                  <button onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="font-semibold text-perx-purple">
                    {mode === "signup" ? "Log in" : "Sign up"}
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div key="role" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <h1 className="font-display text-2xl font-extrabold tracking-tight">How will you use YAPA?</h1>
                <p className="mt-1 text-sm text-perx-muted">You can change this later.</p>
                <div className="mt-6 space-y-3">
                  {ROLES.map((r) => (
                    <button key={r.id} onClick={() => setRole(r.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${role === r.id ? "border-perx-purple bg-perx-purple/[0.04]" : "border-perx-line bg-white hover:border-perx-purple/40"}`}>
                      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${r.grad} text-white`}><Ico name={r.icon} className="h-5 w-5" /></span>
                      <span className="flex-1">
                        <span className="block font-display font-bold text-perx-ink">{r.title}</span>
                        <span className="block text-xs text-perx-muted">{r.desc}</span>
                      </span>
                      <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${role === r.id ? "border-perx-purple bg-perx-purple text-white" : "border-perx-line"}`}>
                        {role === r.id && <Ico name="check" className="h-3 w-3" />}
                      </span>
                    </button>
                  ))}
                </div>
                <button onClick={finish} className="pop-btn mt-6 inline-flex w-full items-center justify-center gap-1.5 grad-grape py-3.5 text-sm font-semibold text-white shadow-pop-sm">
                  {role === "employee" ? "Continue to personalization" : "Enter dashboard"} <Ico name="arrow" className="h-4 w-4" />
                </button>
                <button onClick={() => setStep(0)} className="mt-3 inline-flex w-full items-center justify-center gap-1 text-center text-sm font-medium text-perx-muted hover:text-perx-ink"><Ico name="back" className="h-4 w-4" /> Back</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-perx-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-perx-line bg-white px-4 py-3 text-sm outline-none transition focus:border-perx-purple focus:ring-4 focus:ring-perx-purple/10"
      />
    </label>
  );
}
