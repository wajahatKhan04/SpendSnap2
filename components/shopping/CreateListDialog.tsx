"use client";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { shoppingListSchema, type ShoppingListFormValues } from "@/schemas/shoppingList.schema";
import { MONTH_NAMES } from "@/constants";
import { currentMonthYear } from "@/lib/date";
import { useAuth } from "@/hooks/useAuth";
import { createShoppingList } from "@/services/shoppingLists.service";
import { toFriendlyError } from "@/lib/errors";

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateListDialog({ open, onOpenChange }: CreateListDialogProps) {
  const { firebaseUser } = useAuth();
  const { month, year } = currentMonthYear();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShoppingListFormValues>({
    resolver: zodResolver(shoppingListSchema),
    defaultValues: { title: "", month, year },
  });

  async function onSubmit(values: ShoppingListFormValues) {
    if (!firebaseUser) return;
    try {
      await createShoppingList(firebaseUser.uid, values);
      toast.success("Shopping list created successfully.");
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(toFriendlyError(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create shopping list</DialogTitle>
          <DialogDescription>Start planning a new month of grocery shopping.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. November Groceries" {...register("title")} />
            {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="month">Month</Label>
              <Controller
                control={control}
                name="month"
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger id="month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_NAMES.map((name, index) => (
                        <SelectItem key={name} value={String(index + 1)}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.month && <p className="text-xs text-danger">{errors.month.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" {...register("year", { valueAsNumber: true })} />
              {errors.year && <p className="text-xs text-danger">{errors.year.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create list"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
