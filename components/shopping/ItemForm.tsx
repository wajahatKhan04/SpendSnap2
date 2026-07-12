"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { shoppingItemSchema, type ShoppingItemFormValues } from "@/schemas/shoppingItem.schema";
import { UNIT_OPTIONS, ITEM_STATUS_LABELS } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { addItem, updateItem } from "@/services/shoppingItems.service";
import { toFriendlyError } from "@/lib/errors";
import { calculateItemTotal } from "@/lib/calculations";
import { formatCurrency } from "@/lib/currency";
import { ItemStatus, type ShoppingItem, Currency } from "@/types";

interface ItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  item?: ShoppingItem | null;
  currency?: Currency;
}

const DEFAULTS: ShoppingItemFormValues = {
  name: "",
  quantity: 1,
  unit: UNIT_OPTIONS[0].value,
  plannedUnitPrice: 0,
  actualUnitPrice: 0,
  category: "",
  notes: "",
  status: ItemStatus.NOT_BOUGHT,
};

export function ItemForm({ open, onOpenChange, listId, item, currency = Currency.PKR }: ItemFormProps) {
  const { firebaseUser } = useAuth();
  const isEditing = Boolean(item);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ShoppingItemFormValues>({
    resolver: zodResolver(shoppingItemSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (open) {
      reset(
        item
          ? {
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              plannedUnitPrice: item.plannedUnitPrice,
              actualUnitPrice: item.actualUnitPrice,
              category: item.category,
              notes: item.notes,
              status: item.status,
            }
          : DEFAULTS
      );
    }
  }, [open, item, reset]);

  const quantity = watch("quantity") || 0;
  const plannedUnitPrice = watch("plannedUnitPrice") || 0;
  const actualUnitPrice = watch("actualUnitPrice") || 0;
  const plannedTotal = calculateItemTotal(quantity, plannedUnitPrice);
  const actualTotal = calculateItemTotal(quantity, actualUnitPrice);

  async function onSubmit(values: ShoppingItemFormValues) {
    if (!firebaseUser) return;
    try {
      if (isEditing && item) {
        await updateItem(firebaseUser.uid, listId, item.id, values);
        toast.success("Item updated.");
      } else {
        await addItem(firebaseUser.uid, listId, values);
        toast.success("Item added.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(toFriendlyError(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit item" : "Add item"}</DialogTitle>
          <DialogDescription>
            Totals update live as you type — {formatCurrency(plannedTotal, currency)} planned ·{" "}
            {formatCurrency(actualTotal, currency)} actual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Item name</Label>
            <Input id="name" placeholder="e.g. Basmati Rice" {...register("name")} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" step="0.01" {...register("quantity", { valueAsNumber: true })} />
              {errors.quantity && <p className="text-xs text-danger">{errors.quantity.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plannedUnitPrice">Planned unit price</Label>
              <Input id="plannedUnitPrice" type="number" step="0.01" {...register("plannedUnitPrice", { valueAsNumber: true })} />
              {errors.plannedUnitPrice && <p className="text-xs text-danger">{errors.plannedUnitPrice.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="actualUnitPrice">Actual unit price</Label>
              <Input id="actualUnitPrice" type="number" step="0.01" {...register("actualUnitPrice", { valueAsNumber: true })} />
              {errors.actualUnitPrice && <p className="text-xs text-danger">{errors.actualUnitPrice.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="e.g. Grains" {...register("category")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ItemStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {ITEM_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional notes…" {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
