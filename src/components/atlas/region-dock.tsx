"use client";

import type { CSSProperties } from "react";
import { FaceRegion, RegionId } from "@/data/atlas";

type RegionDockProps = {
  regions: FaceRegion[];
  selectedId: RegionId | null;
  onSelect: (id: RegionId) => void;
};

export function RegionDock({ regions, selectedId, onSelect }: RegionDockProps) {
  return (
    <nav
      aria-label="Regioes do rosto"
      className="absolute inset-x-4 bottom-4 z-20 flex min-h-16 items-center gap-2 overflow-x-auto rounded-full border border-black/10 bg-[#fffaf0]/82 px-2 shadow-2xl shadow-black/10 backdrop-blur-2xl lg:inset-x-auto lg:left-8 lg:right-[430px]"
    >
      {regions.map((region) => {
        const Icon = region.icon;
        const active = region.id === selectedId;

        return (
          <button
            key={region.id}
            type="button"
            title={region.name}
            aria-pressed={active}
            onClick={() => onSelect(region.id)}
            className="group flex h-12 min-w-12 shrink-0 items-center justify-center gap-2 rounded-full px-2 text-sm font-medium text-black/58 transition hover:text-black focus:outline-none focus:ring-2 focus:ring-black/20 md:px-3 md:hover:bg-black/[0.04] md:data-[active=true]:min-w-[128px] md:data-[active=true]:text-[#11100d]"
            data-active={active}
          >
            <span
              className="grid size-8 place-items-center rounded-full bg-transparent transition md:bg-[var(--region-icon-bg)]"
              style={{
                "--region-icon-bg": active ? `${region.accent}40` : "rgba(0,0,0,0.05)",
                color: active ? region.accent : "rgba(0,0,0,0.55)",
              } as CSSProperties}
            >
              <Icon className="size-4" strokeWidth={1.9} />
            </span>
            <span className="hidden whitespace-nowrap md:group-data-[active=true]:block">
              {region.shortName}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
