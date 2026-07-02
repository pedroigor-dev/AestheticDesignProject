"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, FileText, Loader2, X } from "lucide-react";
import type { jsPDF as JsPDF } from "jspdf";
import { useEffect, useMemo, useState } from "react";
import { FaceRegion, RegionId } from "@/data/atlas";

type AtlasPdfPanelProps = {
  regions: FaceRegion[];
  selectedId: RegionId | null;
};

const referenceNotes = [
  "Anatomia facial aplicada: planos, compartimentos e relacoes vasculares.",
  "Semiologia estetica: proporcao, simetria, dinamica muscular e qualidade da pele.",
  "Material educativo. Nao substitui avaliacao clinica, diagnostico ou conduta medica individualizada.",
];

export function AtlasPdfPanel({ regions, selectedId }: AtlasPdfPanelProps) {
  const initialRegionIds = useMemo(
    () => (selectedId ? [selectedId] : regions.slice(0, 3).map((region) => region.id)),
    [regions, selectedId],
  );
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<RegionId[]>(initialRegionIds);
  const [generating, setGenerating] = useState(false);
  const selectedRegions = useMemo(
    () => regions.filter((region) => selectedIds.includes(region.id)),
    [regions, selectedIds],
  );

  useEffect(() => {
    if (!selectedId) return;
    const frame = requestAnimationFrame(() => {
      setSelectedIds((current) =>
        current.includes(selectedId) ? current : [...current, selectedId],
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedId]);

  const toggleRegion = (id: RegionId) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const generatePdf = async () => {
    if (!selectedRegions.length || generating) return;

    setGenerating(true);
    try {
      const [{ jsPDF }] = await Promise.all([import("jspdf"), waitForFrame()]);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 16;
      let y = 18;

      pdf.setFillColor(246, 241, 232);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setTextColor(20, 17, 14);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text("Atlas estetico facial", margin, y);
      y += 9;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(88, 82, 74);
      pdf.text("Resumo educativo gerado a partir das regioes selecionadas.", margin, y);
      y += 8;

      const image = captureAtlasCanvas();
      if (image) {
        pdf.addImage(image, "PNG", margin, y, pageWidth - margin * 2, 86, undefined, "FAST");
        y += 96;
      }

      pdf.setDrawColor(136, 216, 192);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 9;

      selectedRegions.forEach((region) => {
        if (y > pageHeight - 96) {
          pdf.addPage();
          pdf.setFillColor(246, 241, 232);
          pdf.rect(0, 0, pageWidth, pageHeight, "F");
          y = 18;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(15);
        pdf.setTextColor(20, 17, 14);
        pdf.text(region.name, margin, y);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(126, 118, 106);
        pdf.text(region.kicker.toUpperCase(), pageWidth - margin, y, { align: "right" });
        y += 8;

        y = writeWrapped(pdf, region.overview, margin, y, pageWidth - margin * 2, 10, 5);
        y += 2;
        y = writeSection(pdf, "Procedimentos e temas", region.procedures, margin, y, pageWidth);
        y = writeSection(pdf, "Anatomia em foco", region.anatomy, margin, y, pageWidth);
        y = writeSection(pdf, "Curiosidades", region.curiosities, margin, y, pageWidth);
        y += 4;
      });

      if (y > pageHeight - 54) {
        pdf.addPage();
        pdf.setFillColor(246, 241, 232);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");
        y = 18;
      }

      pdf.setDrawColor(20, 17, 14);
      pdf.setLineWidth(0.2);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(20, 17, 14);
      pdf.text("Referencias e uso educativo", margin, y);
      y += 7;
      y = writeBullets(pdf, referenceNotes, margin, y, pageWidth - margin * 2, 9, 5);

      pdf.setFontSize(8);
      pdf.setTextColor(126, 118, 106);
      pdf.text("Aesthetic Atlas", margin, pageHeight - 10);
      pdf.text(new Date().toLocaleDateString("pt-BR"), pageWidth - margin, pageHeight - 10, {
        align: "right",
      });

      pdf.save("atlas-estetico-facial.pdf");
      setOpen(false);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        data-scene-ui
        aria-label="Abrir gerador de PDF"
        onClick={() => setOpen(true)}
        className="absolute right-4 top-4 z-30 flex h-10 items-center gap-2 rounded-full border border-black/10 bg-[#fffaf0]/78 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/55 shadow-xl shadow-black/5 backdrop-blur-xl transition hover:scale-[1.02] hover:bg-white hover:text-black/75 focus:outline-none focus:ring-2 focus:ring-[#88d8c0]/55 md:top-20 lg:right-[462px] lg:top-[136px]"
      >
        <FileText className="size-4" />
        PDF
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            data-scene-ui
            className="absolute inset-0 z-40 grid place-items-center bg-[#14110e]/18 p-4 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Gerar Atlas em PDF"
              className="w-full max-w-md rounded-[24px] border border-black/10 bg-[#fffaf0]/95 p-5 shadow-2xl shadow-black/18 backdrop-blur-2xl"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/42">
                    Exportacao
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#14110e]">
                    Gerar Atlas em PDF
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Fechar"
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-full text-black/42 transition hover:bg-black/5 hover:text-black/70 focus:outline-none focus:ring-2 focus:ring-[#88d8c0]/55"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-black/58">
                Escolha as regioes que vao entrar no material. O PDF inclui imagem do rosto,
                resumo, anatomia, curiosidades e notas educativas.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {regions.map((region) => {
                  const checked = selectedIds.includes(region.id);

                  return (
                    <label
                      key={region.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                        checked
                          ? "border-[#88d8c0]/55 bg-[#88d8c0]/18 text-[#14110e]"
                          : "border-black/8 bg-white/40 text-black/50 hover:bg-white/70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRegion(region.id)}
                        className="size-4 accent-[#88d8c0]"
                      />
                      {region.name}
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!selectedRegions.length || generating}
                onClick={generatePdf}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#14110e] px-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#fffaf0] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {generating ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {generating ? "Gerando" : "Gerar PDF"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function captureAtlasCanvas() {
  const canvas = document.querySelector("canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return null;

  try {
    return canvas.toDataURL("image/png", 0.9);
  } catch {
    return null;
  }
}

function waitForFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function writeSection(
  pdf: JsPDF,
  title: string,
  items: string[],
  margin: number,
  y: number,
  pageWidth: number,
) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(20, 17, 14);
  pdf.text(title, margin, y);
  y += 5;
  return writeBullets(pdf, items, margin, y, pageWidth - margin * 2, 9, 4.6);
}

function writeBullets(
  pdf: JsPDF,
  items: string[],
  x: number,
  y: number,
  width: number,
  fontSize: number,
  lineHeight: number,
) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(fontSize);
  pdf.setTextColor(88, 82, 74);

  items.forEach((item) => {
    const lines = pdf.splitTextToSize(item, width - 5) as string[];
    pdf.text("-", x, y);
    pdf.text(lines, x + 5, y);
    y += lines.length * lineHeight + 1.2;
  });

  return y + 1;
}

function writeWrapped(
  pdf: JsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  lineHeight: number,
) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(fontSize);
  pdf.setTextColor(62, 57, 51);
  const lines = pdf.splitTextToSize(text, width) as string[];
  pdf.text(lines, x, y);
  return y + lines.length * lineHeight;
}
