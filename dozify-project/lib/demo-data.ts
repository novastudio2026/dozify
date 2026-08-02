import type { LabResult, Medication } from "@/lib/types";

export const demoMedications: Medication[] = [
  { id: "metformin", name: "Metformin", form: "Tablet", dosage: "1 x 1", mealStatus: "Yemekten sonra", scheduledTime: "09:00", remainingCount: 8, totalCount: 30, dailyFrequency: 1 },
  { id: "vitamin-d", name: "D3 Vitamini", form: "Damla", dosage: "3 damla", mealStatus: "Kahvaltı ile", scheduledTime: "10:00", remainingCount: 22, totalCount: 30, dailyFrequency: 1 },
  { id: "lantus", name: "Lantus SoloStar", form: "İnsülin/Enjeksiyon", dosage: "10 ünite", mealStatus: "Her gün aynı saatte", scheduledTime: "21:00", remainingCount: 5, totalCount: 10, dailyFrequency: 1, isInsulin: true },
];

export const demoLabs: LabResult[] = [
  { id: "b12", testName: "B12", value: 188, unit: "pg/mL", refMin: 200, refMax: 900, testDate: "2026-07-26" },
  { id: "hba1c", testName: "HbA1c", value: 6.1, unit: "%", refMin: 4, refMax: 5.7, testDate: "2026-07-26" },
  { id: "ferritin", testName: "Ferritin", value: 46, unit: "ng/mL", refMin: 15, refMax: 150, testDate: "2026-07-26" },
];
