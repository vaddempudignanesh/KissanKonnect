"use client";

import {
  createContext, useContext, useEffect, useState, ReactNode,
} from "react";
import type { DbFarmer, DbBuyer } from "./types";

export type Role = "farmer" | "buyer" | null;

interface Session {
  role: Role;
  farmer?: DbFarmer;
  buyer?: DbBuyer;
  ready: boolean;
  loginAsFarmer: (id?: number) => Promise<void>;
  loginAsBuyer: (id?: number) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [farmer, setFarmer] = useState<DbFarmer | undefined>();
  const [buyer, setBuyer] = useState<DbBuyer | undefined>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = localStorage.getItem("kk-role") as Role;
        const idStr = localStorage.getItem("kk-id");
        if (r && idStr) {
          const id = Number(idStr);
          if (r === "farmer") {
            const res = await fetch(`/api/session?role=farmer&id=${id}`);
            const j = await res.json();
            if (j.farmer) { setRole("farmer"); setFarmer(j.farmer); }
          } else if (r === "buyer") {
            const res = await fetch(`/api/session?role=buyer&id=${id}`);
            const j = await res.json();
            if (j.buyer) { setRole("buyer"); setBuyer(j.buyer); }
          }
        }
      } catch (e) {
        console.warn("[session] restore failed", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const loginAsFarmer = async (id?: number) => {
    const res = await fetch(`/api/session?role=farmer${id ? `&id=${id}` : ""}`);
    const j = await res.json();
    if (!j.farmer) return;
    setRole("farmer"); setFarmer(j.farmer); setBuyer(undefined);
    localStorage.setItem("kk-role", "farmer");
    localStorage.setItem("kk-id", String(j.farmer.id));
  };

  const loginAsBuyer = async (id?: number) => {
    const res = await fetch(`/api/session?role=buyer${id ? `&id=${id}` : ""}`);
    const j = await res.json();
    if (!j.buyer) return;
    setRole("buyer"); setBuyer(j.buyer); setFarmer(undefined);
    localStorage.setItem("kk-role", "buyer");
    localStorage.setItem("kk-id", String(j.buyer.id));
  };

  const logout = () => {
    setRole(null); setFarmer(undefined); setBuyer(undefined);
    localStorage.removeItem("kk-role");
    localStorage.removeItem("kk-id");
  };

  return (
    <Ctx.Provider value={{ role, farmer, buyer, ready, loginAsFarmer, loginAsBuyer, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
