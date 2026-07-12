import { z } from "zod";
import { ItemStatus, Unit } from "@/types";

export const shoppingItemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required").max(80, "Name is too long"),
  quantity: z.number({ error: "Quantity is required" }).gt(0, "Quantity must be greater than 0"),
  unit: z.nativeEnum(Unit),
  plannedUnitPrice: z.number({ error: "Planned price is required" }).min(0, "Must be 0 or more"),
  actualUnitPrice: z.number({ error: "Actual price is required" }).min(0, "Must be 0 or more"),
  category: z.string().trim().max(40),
  notes: z.string().trim().max(200),
  status: z.nativeEnum(ItemStatus),
});

export type ShoppingItemFormValues = z.infer<typeof shoppingItemSchema>;
