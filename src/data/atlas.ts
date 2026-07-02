import {
  Bone,
  Brain,
  Eye,
  LucideIcon,
  Smile,
  Sparkles,
  Waves,
} from "lucide-react";

export type RegionId =
  | "eyes"
  | "nose"
  | "mouth"
  | "jaw"
  | "forehead"
  | "scalp";

export type FaceRegion = {
  id: RegionId;
  name: string;
  shortName: string;
  kicker: string;
  icon: LucideIcon;
  accent: string;
  position: [number, number, number];
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
  overview: string;
  procedures: string[];
  anatomy: string[];
  curiosities: string[];
};

export const atlasRegions: FaceRegion[] = [
  {
    id: "eyes",
    name: "Olhos",
    shortName: "Olhos",
    kicker: "Periorbital",
    icon: Eye,
    accent: "#88d8c0",
    position: [0, 0.72, 0.86],
    cameraTarget: [0, 0.72, 0.1],
    cameraPosition: [0, 0.82, 4.65],
    overview:
      "A regiao dos olhos concentra pele fina, suporte ligamentar delicado, gordura orbital e musculos de expressao. Por isso pequenas mudancas de volume, pigmento ou tonicidade aparecem cedo.",
    procedures: [
      "Toxina botulinica para pes de galinha e rugas dinamicas",
      "Preenchimento criterioso do sulco lacrimal",
      "Bioestimuladores e tecnologias para qualidade de pele",
      "Blefaroplastia quando ha excesso cutaneo ou bolsas estruturais",
    ],
    anatomy: [
      "Orbicular dos olhos",
      "Septos orbitais",
      "Ligamento orbicular de retencao",
      "Gordura orbital e compartimentos malares",
    ],
    curiosities: [
      "A pele palpebral esta entre as mais finas do corpo.",
      "Olheira pode ser vascular, pigmentada, estrutural ou mista.",
      "Bolsas nem sempre sao retencao de liquido; podem ser herniacao de gordura.",
    ],
  },
  {
    id: "nose",
    name: "Nariz",
    shortName: "Nariz",
    kicker: "Centro facial",
    icon: Sparkles,
    accent: "#f3b36f",
    position: [0, 0.22, 1.03],
    cameraTarget: [0, 0.2, 0.18],
    cameraPosition: [0, 0.26, 4.45],
    overview:
      "O nariz organiza a leitura do rosto porque une estrutura ossea, cartilagens e envelope de pele. Em estetica, milimetros mudam luz, sombra e proporcao.",
    procedures: [
      "Rinomodelacao com acido hialuronico em casos selecionados",
      "Rinoplastia para alteracoes estruturais e funcionais",
      "Toxina em pontos especificos para ponta nasal dinamica",
      "Planejamento fotografico de perfil, base e frontal",
    ],
    anatomy: [
      "Ossos nasais",
      "Cartilagens laterais superiores",
      "Cartilagens alares",
      "Columela, dorso e radix",
    ],
    curiosities: [
      "A ponta nasal tem movimento por acao muscular.",
      "Pele espessa reduz definicao visual da cartilagem.",
      "Rinomodelacao exige conhecimento vascular rigoroso.",
    ],
  },
  {
    id: "mouth",
    name: "Boca",
    shortName: "Boca",
    kicker: "Labios e sorriso",
    icon: Smile,
    accent: "#f07a88",
    position: [0, -0.45, 0.92],
    cameraTarget: [0, -0.43, 0.12],
    cameraPosition: [0, -0.38, 4.35],
    overview:
      "A boca combina volume, contorno, exposicao dentaria, hidratacao e dinamica muscular. O objetivo educativo aqui e mostrar proporcao, simetria e funcao, nao um padrao unico.",
    procedures: [
      "Acido hialuronico para hidratacao, contorno ou volume",
      "Tratamento de codigo de barras conforme indicacao",
      "Ajustes de sorriso gengival com toxina botulinica",
      "Analise de proporcao entre labios superior e inferior",
    ],
    anatomy: [
      "Orbicular da boca",
      "Arco do cupido",
      "Filtro labial",
      "Comissuras e tuberculos labiais",
    ],
    curiosities: [
      "Volume bonito depende mais de distribuicao do que de quantidade.",
      "Assimetria discreta e comum em rostos naturais.",
      "O labio inferior costuma ter maior presenca visual que o superior.",
    ],
  },
  {
    id: "jaw",
    name: "Mandibula",
    shortName: "Mandibula",
    kicker: "Contorno",
    icon: Bone,
    accent: "#9cb7ff",
    position: [0, -0.92, 0.48],
    cameraTarget: [0, -0.83, 0],
    cameraPosition: [0, -0.62, 4.8],
    overview:
      "A mandibula define contorno inferior, suporte de tecidos e expressao de forca facial. O masseter tambem conecta estetica, mastigacao e bruxismo.",
    procedures: [
      "Toxina botulinica em masseter para hipertrofia ou bruxismo indicado",
      "Preenchimento de angulo e linha mandibular",
      "Bioestimuladores para suporte e qualidade de pele",
      "Planejamento conservador para preservar naturalidade",
    ],
    anatomy: [
      "Corpo e angulo mandibular",
      "Mento",
      "Masseter",
      "Ligamentos mandibulares",
    ],
    curiosities: [
      "O masseter pode aumentar com apertamento dental cronico.",
      "Contorno mandibular muda com postura, luz e tecido subcutaneo.",
      "Nem toda perda de definicao e falta de volume; pode ser flacidez.",
    ],
  },
  {
    id: "forehead",
    name: "Testa",
    shortName: "Testa",
    kicker: "Expressao",
    icon: Brain,
    accent: "#d6c57a",
    position: [0, 1.22, 0.58],
    cameraTarget: [0, 1.12, 0],
    cameraPosition: [0, 1.14, 4.65],
    overview:
      "A testa mostra o equilibrio entre musculo frontal, sobrancelhas e pele. Rugas horizontais geralmente sao dinamicas antes de se tornarem marcas em repouso.",
    procedures: [
      "Toxina botulinica para rugas dinamicas",
      "Skinboosters e tecnologias para textura",
      "Bioestimuladores quando ha perda de qualidade dermica",
      "Analise conjunta com glabela e posicionamento da sobrancelha",
    ],
    anatomy: [
      "Musculo frontal",
      "Glabela",
      "Corrugadores",
      "Vasos supraorbitais e supratrocleares",
    ],
    curiosities: [
      "A testa ajuda a elevar as sobrancelhas durante a expressao.",
      "Tratar demais pode pesar o olhar em algumas anatomias.",
      "Linhas estaticas pedem abordagem de pele, nao so relaxamento muscular.",
    ],
  },
  {
    id: "scalp",
    name: "Couro cabeludo",
    shortName: "Cabelo",
    kicker: "Foliculos",
    icon: Waves,
    accent: "#79c7e8",
    position: [0, 1.68, 0.1],
    cameraTarget: [0, 1.5, -0.05],
    cameraPosition: [0, 1.62, 5],
    overview:
      "O couro cabeludo e um ecossistema de foliculos, ciclos de crescimento, vascularizacao e sinais hormonais. A experiencia foca em entender causas antes de escolher condutas.",
    procedures: [
      "Tricoscopia e diagnostico da causa da queda",
      "Terapias medicamentosas conforme avaliacao medica",
      "Microagulhamento e drug delivery em protocolos selecionados",
      "Transplante capilar quando ha area doadora e indicacao",
    ],
    anatomy: [
      "Foliculo piloso",
      "Papila dermica",
      "Fases anagena, catagena e telogena",
      "Unidades foliculares",
    ],
    curiosities: [
      "Cada fio vive em um ciclo proprio.",
      "Calvicie androgenetica miniaturiza o fio progressivamente.",
      "Queda intensa e afinamento gradual sao problemas diferentes.",
    ],
  },
];

export const defaultRegion = atlasRegions[0];
