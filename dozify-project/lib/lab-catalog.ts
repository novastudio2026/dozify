export type LabDefinition = { id: string; name: string; aliases: string[]; unit: string; refMin: number; refMax: number };

// Demo defaults for adults. Laboratories and methods can use different ranges.
export const labCatalog: LabDefinition[] = [
  { id: "glucose", name: "Açlık Kan Şekeri (Glukoz)", aliases: ["glukoz", "glu", "açlık şekeri"], unit: "mg/dL", refMin: 70, refMax: 100 },
  { id: "hba1c", name: "HbA1c", aliases: ["hba1c", "şeker"], unit: "%", refMin: 4, refMax: 5.6 },
  { id: "b12", name: "B12 Vitamini", aliases: ["b12", "vitamin b12"], unit: "pg/mL", refMin: 197, refMax: 771 },
  { id: "alt", name: "ALT (SGPT)", aliases: ["alt", "sgpt"], unit: "U/L", refMin: 0, refMax: 41 },
  { id: "ast", name: "AST (SGOT)", aliases: ["ast", "sgot"], unit: "U/L", refMin: 0, refMax: 40 },
  { id: "ferritin", name: "Ferritin", aliases: ["ferritin", "demir deposu"], unit: "ng/mL", refMin: 15, refMax: 150 },
  { id: "vitamin-d", name: "25-OH Vitamin D", aliases: ["d vitamini", "vitamin d"], unit: "ng/mL", refMin: 20, refMax: 100 },
  { id: "tsh", name: "TSH", aliases: ["tsh", "tiroid"], unit: "mIU/L", refMin: 0.4, refMax: 4 },
];
