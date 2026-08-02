export type MedicationForm = "Tablet" | "Kapsül" | "Şurup" | "Damla" | "İnsülin/Enjeksiyon";
export type DoseStatus = "taken" | "skipped" | "missed" | "upcoming";

export type Medication = {
  id: string;
  name: string;
  form: MedicationForm;
  dosage: string;
  mealStatus: string;
  scheduledTime: string;
  remainingCount: number;
  totalCount: number;
  dailyFrequency: number;
  isInsulin?: boolean;
};

export type LabResult = {
  id: string;
  testName: string;
  value: number;
  unit: string;
  refMin: number;
  refMax: number;
  testDate: string;
};
