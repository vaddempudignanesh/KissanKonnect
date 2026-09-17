// lib/session.ts
// PURPOSE: Fake "login" for the SIH demo.
//          Anyone can pick Farmer or Buyer and be logged in.
//          Session persists across page reloads via localStorage.
//          REPLACE THIS with real auth (NextAuth / Clerk / etc.) later.
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Farmer, Buyer, getFarmer, getBuyer, getFarmers, getBuyers } from "./db";

export type Role = "farmer" | "buyer" | null;

interface Session {
  role: Role;
  farmer?: Farmer;
  buyer?: Buyer;
  loginAsFarmer: (id?: string) => Promise<void>;
  loginAsBuyer: (id?: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [farmer, setFarmer] = useState<Farmer | undefined>();
  const [buyer, setBuyer] = useState<Buyer | undefined>();

  // Restore session on load.
  useEffect(() => {
    const savedRole = localStorage.getItem("kk-role") as Role;
    const savedId = localStorage.getItem("kk-id");
    if (savedRole === "farmer" && savedId) {
      setRole("farmer");
      getFarmer(savedId).then(setFarmer);
    } else if (savedRole === "buyer" && savedId) {
      setRole("buyer");
      getBuyer(savedId).then(setBuyer);
    }
  }, []);

  const loginAsFarmer = async (id?: string) => {
    const list = await getFarmers();
    const f = id ? await getFarmer(id) : list[0];
    if (!f) return;
    setRole("farmer"); setFarmer(f); setBuyer(undefined);
    localStorage.setItem("kk-role", "farmer");
    localStorage.setItem("kk-id", f.id);
  };

  const loginAsBuyer = async (id?: string) => {
    const list = await getBuyers();
    const b = id ? await getBuyer(id) : list[0];
    if (!b) return;
    setRole("buyer"); setBuyer(b); setFarmer(undefined);
    localStorage.setItem("kk-role", "buyer");
    localStorage.setItem("kk-id", b.id);
  };

  const logout = () => {
    setRole(null); setFarmer(undefined); setBuyer(undefined);
    localStorage.removeItem("kk-role");
    localStorage.removeItem("kk-id");
  };

  return (
    <Ctx.Provider value={{ role, farmer, buyer, loginAsFarmer, loginAsBuyer, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}