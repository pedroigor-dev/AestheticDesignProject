"use client";

import { useMemo, useState } from "react";
import { atlasRegions, RegionId } from "@/data/atlas";

export function useAtlasSelection(initialRegion: RegionId | null = null) {
  const [selectedId, setSelectedId] = useState<RegionId | null>(initialRegion);

  const selectedRegion = useMemo(
    () => atlasRegions.find((region) => region.id === selectedId) ?? null,
    [selectedId],
  );

  return {
    regions: atlasRegions,
    selectedId,
    selectedRegion,
    selectRegion: setSelectedId,
  };
}
