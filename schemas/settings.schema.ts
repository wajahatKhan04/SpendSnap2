import { z } from "zod";
import { Currency } from "@/types";

export const settingsSchema = z.object({
  monthlyBudget: z.number({ error: "Budget is required" }).gt(0, "Budget must be greater than zero"),
  currency: z.nativeEnum(Currency),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
