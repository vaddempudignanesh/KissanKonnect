"use client";

import {
  createContext, useContext, useEffect, useState, ReactNode, useCallback,
} from "react";
import type { DbFarmer, DbBuyer } from "./types";

export type Role = "farmer" | "buyer" | "admin" | null;

interface User {
  id: number;
  phone: string;
  name: string;
  role: "farmer" | "buyer" | "admin";
}

interface Session {
  role: Role;
  user?: User;
  farmer?: DbFarmer;
  buyer?: DbBuyer;
  ready: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | undefined>();
  const [farmer, setFarmer] = useState<DbFarmer | undefined>();
  const [buyer, setBuyer] = useState<DbBuyer | undefined>();
  const [ready, setReady] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const json = await res.json();
      setUser(json.user ?? undefined);
      setFarmer(json.farmer ?? undefined);
      setBuyer(json.buyer ?? undefined);
    } catch (e) {
      console.warn("[session] refresh failed", e);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(undefined);
    setFarmer(undefined);
    setBuyer(undefined);
  }, []);

  const role: Role = user?.role ?? null;

  return (
    <Ctx.Provider
      value={{ role, user, farmer, buyer, ready, refreshSession, logout }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}