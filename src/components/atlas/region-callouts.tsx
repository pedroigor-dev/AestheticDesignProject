"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Info, Stethoscope } from "lucide-react";
import { FaceRegion } from "@/data/atlas";

type RegionCalloutsProps = {
  region: FaceRegion | null;
};

export function RegionCallouts({ region }: RegionCalloutsProps) {
  if (!region) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
      <AnimatePresence>
        <motion.aside
          key={`${region.id}-left`}
          initial={{ opacity: 0, x: -18, filter: "blur(8px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -12, filter: "blur(8px)" }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="absolute left-8 top-[28%] w-[250px] rounded-[22px] border border-black/10 bg-[#fffaf0]/68 p-4 text-[#15120f] shadow-2xl shadow-black/10 backdrop-blur-2xl"
        >
          <CalloutTitle icon={<Info className="size-4" />} title="Anatomia" accent={region.accent} />
          <p className="mt-3 text-sm leading-6 text-black/62">{region.anatomy[0]}</p>
          <p className="mt-3 border-t border-black/10 pt-3 text-xs leading-5 text-black/48">
            {region.curiosities[0]}
          </p>
        </motion.aside>

        <motion.aside
          key={`${region.id}-right`}
          initial={{ opacity: 0, x: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: 12, filter: "blur(8px)" }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="absolute right-8 top-[24%] w-[270px] rounded-[22px] border border-black/10 bg-[#fffaf0]/70 p-4 text-[#15120f] shadow-2xl shadow-black/10 backdrop-blur-2xl"
        >
          <CalloutTitle
            icon={<Stethoscope className="size-4" />}
            title={region.shortName}
            accent={region.accent}
          />
          <p className="mt-3 text-sm leading-6 text-black/62">{region.procedures[0]}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-black/38">
            <ArrowUpRight className="size-3.5" />
            clique em outra regiao
          </div>
        </motion.aside>
      </AnimatePresence>
    </div>
  );
}

function CalloutTitle({
  icon,
  title,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/48">
      <span
        className="grid size-8 place-items-center rounded-full"
        style={{ backgroundColor: `${accent}2e`, color: accent }}
      >
        {icon}
      </span>
      {title}
    </div>
  );
}
