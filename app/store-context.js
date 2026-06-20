"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CURRENT_USER_ID, EMPLOYEE_MAP } from "@/lib/seed";
import { DEFAULT_THEME, themeCopy } from "@/lib/themes";
import { priceForItem } from "@/lib/orders";
import { activeCatalog, catalogFromState } from "@/lib/catalog";

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

const SESSION_KEY = "perx_session_v1";

export function StoreProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  // session / navigation
  const [stage, setStage] = useState("landing"); // landing | auth | onboarding | app
  const [account, setAccount] = useState(null); // { name, email }
  const [profile, setProfile] = useState(null); // { interests, goals, discovery, vibe }
  const [onboardingDone, setOnboardingDone] = useState(false);

  const [role, setRole] = useState("employee");
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("ALL");
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [employeeId] = useState(CURRENT_USER_ID);
  const [me, setMe] = useState(null);
  const [full, setFull] = useState(null);
  const [cart, setCart] = useState([]);
  const [rocket, setRocket] = useState(null);
  const [toast, setToast] = useState(null);
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [wrappedOpen, setWrappedOpen] = useState(false);

  // hydrate session from localStorage (after mount → no SSR mismatch)
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.stage) setStage(s.stage);
        if (s.account) setAccount(s.account);
        if (s.role) setRole(s.role);
        if (s.profile) setProfile(s.profile);
        if (s.onboardingDone) setOnboardingDone(s.onboardingDone);
        if (s.theme) setTheme(s.theme);
      }
    } catch {}
  }, []);

  // persist session
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ stage, account, role, profile, onboardingDone, theme }));
    } catch {}
  }, [mounted, stage, account, role, profile, onboardingDone, theme]);

  // apply theme to <html> for the CSS-variable cascade
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const refresh = useCallback(async () => {
    const r = await fetch(`/api/state?employeeId=${employeeId}`, { cache: "no-store" });
    const d = await r.json();
    setMe(d.me);
    setFull(d.full);
  }, [employeeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ---- session actions ----
  const signUp = useCallback(({ name, email, role: r, profile: p }) => {
    setAccount({ name: name || "Erisa Hoxha", email: email || "erisa@technest.al" });
    if (r) setRole(r);
    if (p) setProfile(p);
    if (r === "employee" && !onboardingDone && !p) {
      setStage("onboarding");
    } else {
      if (p) setOnboardingDone(true);
      setStage("app");
    }
  }, [onboardingDone]);

  const logIn = useCallback(({ name, email } = {}) => {
    setAccount({ name: name || "Erisa Hoxha", email: email || "erisa@technest.al" });
    setStage("app");
  }, []);

  const completeOnboarding = useCallback((p) => {
    setProfile(p);
    setOnboardingDone(true);
    setStage("app");
  }, []);

  const logOut = useCallback(() => {
    setAccount(null);
    setStage("landing");
  }, []);

  const skipToDemo = useCallback((r = "employee") => {
    setAccount({ name: EMPLOYEE_MAP[CURRENT_USER_ID].name, email: "demo@yapa.app" });
    setRole(r);
    setStage("app");
  }, []);

  // ---- cart ----
  const inCart = useCallback((type, id) => cart.some((c) => c.type === type && c.id === id), [cart]);
  const toggleCart = useCallback((type, id) => {
    setCart((prev) => {
      const exists = prev.some((c) => c.type === type && c.id === id);
      if (exists) return prev.filter((c) => !(c.type === type && c.id === id));
      return [...prev, { type, id }];
    });
  }, []);
  const removeFromCart = useCallback((type, id) => {
    setCart((prev) => prev.filter((c) => !(c.type === type && c.id === id)));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);
  const catalog = full ? catalogFromState(full) : { offers: [], packages: [] };
  const requestableCatalog = activeCatalog(catalog);
  const cartTotal = cart.reduce((s, it) => s + priceForItem(it, requestableCatalog), 0);

  const fireRocket = useCallback((payload) => {
    setRocket(payload || { icon: "check", title: "Done!" });
    setTimeout(() => setRocket(null), 2400);
  }, []);
  const showToast = useCallback((text, tone = "ok") => {
    setToast({ text, tone, id: Math.random() });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const submitSelection = useCallback(async (note = "") => {
    if (cart.length === 0) return;
    const items = cart.map((c) => ({ type: c.type, id: c.id }));
    const r = await fetch("/api/selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, items, note }),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      showToast(d.error || "Could not submit selection", "warn");
      return;
    }
    clearCart();
    await refresh();
    fireRocket({ icon: "send", title: "Sent for approval", sub: "We'll ping People Ops to confirm" });
    showToast("Selection submitted for approval");
  }, [cart, employeeId, clearCart, refresh, fireRocket, showToast]);

  const decide = useCallback(async (orderId, decision) => {
    await fetch("/api/decide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, decision }),
    });
    await refresh();
    if (decision === "approve") {
      fireRocket({ icon: "check", title: "Approved", sub: "Payment routed to providers" });
      showToast("Payment routed to providers");
    } else {
      showToast("Request declined", "warn");
    }
  }, [refresh, fireRocket, showToast]);

  const fulfillPayment = useCallback(async ({ orderId, paymentId, providerId }) => {
    const r = await fetch("/api/fulfillment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, paymentId, providerId }),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      showToast(d.error || "Could not mark fulfilled", "warn");
      return;
    }
    await refresh();
    fireRocket({ icon: "check", title: "Fulfilled", sub: "Employee and employer updated" });
    showToast("Benefit marked fulfilled");
  }, [refresh, fireRocket, showToast]);

  const createProviderOffer = useCallback(async (providerId, payload) => {
    const r = await fetch("/api/provider-offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, ...payload }),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      showToast(d.error || "Could not create benefit", "warn");
      return null;
    }
    const d = await r.json();
    await refresh();
    showToast("Benefit added");
    return d.offer;
  }, [refresh, showToast]);

  const updateProviderOffer = useCallback(async (providerId, offerId, payload) => {
    const r = await fetch(`/api/provider-offers/${offerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, ...payload }),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      showToast(d.error || "Could not update benefit", "warn");
      return null;
    }
    const d = await r.json();
    await refresh();
    showToast("Benefit updated");
    return d.offer;
  }, [refresh, showToast]);

  const archiveProviderOffer = useCallback(async (providerId, offerId) => {
    const r = await fetch(`/api/provider-offers/${offerId}?providerId=${encodeURIComponent(providerId)}`, {
      method: "DELETE",
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      showToast(d.error || "Could not archive benefit", "warn");
      return null;
    }
    const d = await r.json();
    await refresh();
    showToast("Benefit archived");
    return d.offer;
  }, [refresh, showToast]);

  const resetDemo = useCallback(async () => {
    await fetch("/api/reset", { method: "POST" });
    clearCart();
    await refresh();
    showToast("Demo data reset");
  }, [refresh, clearCart, showToast]);

  const value = {
    mounted,
    stage, setStage,
    account, profile, onboardingDone,
    signUp, logIn, completeOnboarding, logOut, skipToDemo,
    role, setRole,
    lang, setLang,
    currency, setCurrency,
    theme, setTheme,
    tc: themeCopy(theme),
    employeeId,
    user: EMPLOYEE_MAP[employeeId],
    me, full, catalog, requestableCatalog, refresh,
    cart, cartTotal, inCart, toggleCart, removeFromCart, clearCart,
    submitSelection, decide, fulfillPayment,
    createProviderOffer, updateProviderOffer, archiveProviderOffer,
    resetDemo,
    rocket, fireRocket,
    toast, showToast,
    conciergeOpen, setConciergeOpen,
    wrappedOpen, setWrappedOpen,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
