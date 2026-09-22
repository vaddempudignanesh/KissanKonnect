// components/TruckMap.tsx
"use client";

import { motion } from "framer-motion";
import { Truck } from "@/lib/db";

interface Props {
  truck: Truck;
}

export function TruckMap({ truck }: Props) {
  const stops = truck.route;
  const current = Math.min(truck.currentStopIndex, stops.length - 1);

  const lats = stops.map((s: any) => s.lat);
  const lngs = stops.map((s: any) => s.lng);
  const minLat = Math.min(...lats) - 1;
  const maxLat = Math.max(...lats) + 1;
  const minLng = Math.min(...lngs) - 1;
  const maxLng = Math.max(...lngs) + 1;

  const W = 700, H = 360, pad = 40;
  const toX = (lng: number) => pad + ((lng - minLng) / (maxLng - minLng)) * (W - 2 * pad);
  const toY = (lat: number) => pad + ((maxLat - lat) / (maxLat - minLat)) * (H - 2 * pad);

  const path = stops.map((s, i) => `${i === 0 ? "M" : "L"} ${toX(s.lng)} ${toY(s.lat)}`).join(" ");

  const truckX = toX(stops[current].lng);
  const truckY = toY(stops[current].lat);

  return (
    <div className="kk-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold flex items-center gap-2 text-[var(--kk-text)]">
          <span className="w-2 h-2 rounded-full bg-[#111111] animate-pulse" />
          Live tracking
        </div>
        <div className="text-xs text-[var(--kk-text-dim)]">
          Truck {truck.number}
        </div>
      </div>

      <div className="relative rounded-2xl bg-[var(--kk-surface-2)] p-2 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#grid)" />

          {/* Route line (dim) */}
          <path
            d={path}
            fill="none"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 6"
          />

          {/* Route line (completed) */}
          <motion.path
            d={path}
            fill="none"
            stroke="#111111"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: (current + 1) / stops.length }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {stops.map((s: any, i: number) => {
            const reached = i <= current;
            return (
              <g key={s.name}>
                <circle
                  cx={toX(s.lng)}
                  cy={toY(s.lat)}
                  r={reached ? 8 : 6}
                  fill={reached ? "#111111" : "#FFFFFF"}
                  stroke={reached ? "#111111" : "#888888"}
                  strokeWidth="2"
                />
                <text
                  x={toX(s.lng) + 12}
                  y={toY(s.lat) + 4}
                  fontSize="11"
                  fill={reached ? "#111111" : "#555555"}
                  fontWeight={reached ? "600" : "400"}
                >
                  {s.name}
                </text>
              </g>
            );
          })}

          <motion.g
            animate={{ x: truckX, y: truckY }}
            transition={{ type: "spring", stiffness: 40, damping: 15 }}
          >
            <motion.circle
              r={22}
              fill="rgba(0,0,0,0.08)"
              animate={{ r: [22, 28, 22], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <text textAnchor="middle" y={6} fontSize="22">
              🚚
            </text>
          </motion.g>
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--kk-text-dim)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#111111]" /> Reached
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-[#888888]" /> Pending
        </span>
      </div>
    </div>
  );
}