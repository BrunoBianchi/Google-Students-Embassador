export type MacroRegion = {
  slug: string;
  name: string;
  description: string;
  states: string[];
};

export const MACRO_REGIONS: MacroRegion[] = [
  {
    slug: "sudeste",
    name: "Sudeste",
    description: "São Paulo, Minas Gerais, Rio de Janeiro e Espírito Santo",
    states: ["SP", "MG", "RJ", "ES"],
  },
  {
    slug: "sul",
    name: "Sul",
    description: "Rio Grande do Sul, Santa Catarina e Paraná",
    states: ["RS", "SC", "PR"],
  },
  {
    slug: "nordeste",
    name: "Nordeste",
    description: "Bahia, Pernambuco, Ceará, Maranhão, Paraíba, Rio Grande do Norte, Alagoas, Piauí e Sergipe",
    states: ["BA", "PE", "CE", "MA", "PB", "RN", "AL", "PI", "SE"],
  },
  {
    slug: "centro-oeste",
    name: "Centro-Oeste",
    description: "Distrito Federal, Goiás, Mato Grosso e Mato Grosso do Sul",
    states: ["DF", "GO", "MT", "MS"],
  },
  {
    slug: "norte",
    name: "Norte",
    description: "Amazonas, Pará, Acre, Rondônia, Roraima, Amapá e Tocantins",
    states: ["AM", "PA", "AC", "RO", "RR", "AP", "TO"],
  },
];

export const getRegionByState = (state?: string): string => {
  if (!state) return "Nacional";
  const upper = state.trim().toUpperCase();
  const found = MACRO_REGIONS.find((r) => r.states.includes(upper));
  return found ? found.name : "Nacional";
};

export const getRegionSlugByState = (state?: string): string => {
  if (!state) return "nacional";
  const upper = state.trim().toUpperCase();
  const found = MACRO_REGIONS.find((r) => r.states.includes(upper));
  return found ? found.slug : "nacional";
};

export const getStatesForRegionSlug = (regionSlug: string): string[] => {
  const normalized = regionSlug.trim().toLowerCase();
  const found = MACRO_REGIONS.find((r) => r.slug === normalized);
  return found ? found.states : [];
};
