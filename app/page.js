"use client";
import { useStore } from "./store-context";
import { TopBar } from "@/components/topbar";
import { EmployeeApp } from "@/components/employee";
import { EmployerApp } from "@/components/employer";
import { ProviderApp } from "@/components/provider";
import { Concierge } from "@/components/concierge";
import { CartButton } from "@/components/cart";
import { Wrapped } from "@/components/wrapped";
import { RocketOverlay, Toast } from "@/components/ui";
import { Landing } from "@/components/landing";
import { Auth } from "@/components/auth";
import { Onboarding } from "@/components/onboarding";
import { Logo } from "@/components/logo";

export default function Page() {
  const { mounted, stage, role } = useStore();

  // splash until session hydrates (identical on server + client → no mismatch)
  if (!mounted) {
    return (
      <main className="grid min-h-screen place-items-center">
        <Logo className="h-14 animate-pulse" />
      </main>
    );
  }

  if (stage === "landing") return <Landing />;
  if (stage === "auth") return <Auth />;
  if (stage === "onboarding") return <Onboarding />;

  return (
    <main className="min-h-screen">
      <TopBar />
      {role === "employee" && <EmployeeApp />}
      {role === "employer" && <EmployerApp />}
      {role === "provider" && <ProviderApp />}
      <Concierge />
      <CartButton />
      <Wrapped />
      <RocketOverlay />
      <Toast />
    </main>
  );
}
