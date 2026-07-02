"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Info, MousePointer2, Stethoscope } from "lucide-react";
import { FaceRegion } from "@/data/atlas";

type RegionPanelProps = {
  region: FaceRegion | null;
};

export function RegionPanel({ region }: RegionPanelProps) {
  if (!region) {
    return (
      <aside
        aria-label="Detalhes da regiao"
        className="relative flex h-[42svh] min-h-0 w-full flex-col overflow-y-auto overscroll-contain border-l border-black/10 bg-[#fffaf0]/84 px-5 py-5 shadow-[-24px_0_80px_rgba(20,16,12,0.08)] backdrop-blur-2xl lg:h-[100svh] lg:w-[390px] lg:px-7 lg:py-6"
      >
        <div className="flex flex-1 flex-col justify-center">
          <div className="grid size-12 place-items-center rounded-full border border-black/10 bg-[#88d8c0]/24 text-[#58b99b]">
            <MousePointer2 className="size-5" strokeWidth={1.8} />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
            Panorama facial
          </p>
          <h2 className="mt-2 text-3xl font-semibold leading-none text-[#14110e]">
            Escolha uma regiao
          </h2>
          <p className="mt-5 text-[15px] leading-7 text-black/68">
            Explore o rosto em 3D. Clique nos pontos principais para aproximar
            a camera, abrir conteudo educativo e navegar pelas regioes do atlas.
          </p>
        </div>

        <p className="mt-6 border-t border-black/10 pt-4 text-xs leading-5 text-black/48">
          Conteudo educativo. Avaliacao, diagnostico e indicacao de tratamento
          dependem de profissional habilitado e exame individual.
        </p>
      </aside>
    );
  }

  const Icon = region.icon;

  return (
    <aside
      aria-label="Detalhes da regiao"
      className="relative flex h-[42svh] min-h-0 w-full flex-col overflow-y-auto overscroll-contain border-l border-black/10 bg-[#fffaf0]/84 px-5 py-5 shadow-[-24px_0_80px_rgba(20,16,12,0.08)] backdrop-blur-2xl lg:h-[100svh] lg:w-[390px] lg:px-7 lg:py-6"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={region.id}
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-1 flex-col"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/45">
                {region.kicker}
              </p>
              <h2 className="mt-2 text-3xl font-semibold leading-none text-[#14110e]">
                {region.name}
              </h2>
            </div>
            <div
              className="grid size-11 shrink-0 place-items-center rounded-full border border-black/10"
              style={{ backgroundColor: `${region.accent}33`, color: region.accent }}
            >
              <Icon className="size-5" strokeWidth={1.8} />
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-7 text-black/68">{region.overview}</p>

          <div className="mt-6 grid gap-4">
            <InsightBlock
              icon={<Stethoscope className="size-4" />}
              title="Procedimentos e temas"
              items={region.procedures}
              accent={region.accent}
            />
            <InsightBlock
              icon={<Info className="size-4" />}
              title="Anatomia em foco"
              items={region.anatomy}
              accent={region.accent}
            />
            <InsightBlock
              icon={<ArrowUpRight className="size-4" />}
              title="Curiosidades"
              items={region.curiosities}
              accent={region.accent}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="mt-6 border-t border-black/10 pt-4 text-xs leading-5 text-black/48">
        Conteudo educativo. Avaliacao, diagnostico e indicacao de tratamento
        dependem de profissional habilitado e exame individual.
      </p>
    </aside>
  );
}

type InsightBlockProps = {
  icon: React.ReactNode;
  title: string;
  items: string[];
  accent: string;
};

function InsightBlock({ icon, title, items, accent }: InsightBlockProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#15120f]">
        <span
          className="grid size-7 place-items-center rounded-full"
          style={{ backgroundColor: `${accent}2e`, color: accent }}
        >
          {icon}
        </span>
        {title}
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-black/62">
            <span
              className="mt-2 size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
