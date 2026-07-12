import { z } from "zod";

export const shoppingListSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(80, "Title is too long"),
  month: z.number({ error: "Month is required" }).int().min(1).max(12),
  year: z.number({ error: "Year is required" }).int().min(2000).max(2100),
});

export type ShoppingListFormValues = z.infer<typeof shoppingListSchema>;
