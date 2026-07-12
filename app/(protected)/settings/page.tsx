"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { settingsSchema, type SettingsFormValues } from "@/schemas/settings.schema";
import { CURRENCY_OPTIONS } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfile } from "@/services/user.service";
import { toFriendlyError } from "@/lib/errors";
import { Currency } from "@/types";

export default function SettingsPage() {
  const { profile, firebaseUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      monthlyBudget: profile?.monthlyBudget ?? 0,
      currency: profile?.currency ?? Currency.PKR,
    },
  });

  useEffect(() => {
    if (profile) {
      reset({ monthlyBudget: profile.monthlyBudget, currency: profile.currency });
    }
  }, [profile, reset]);

  async function onSubmit(values: SettingsFormValues) {
    if (!firebaseUser) return;
    try {
      await updateUserProfile(firebaseUser.uid, values);
      toast.success("Settings saved.");
    } catch (error) {
      toast.error(toFriendlyError(error));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your budget, currency, and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget</CardTitle>
          <CardDescription>Set your monthly grocery budget and preferred currency.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:max-w-md">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="monthlyBudget">Monthly budget</Label>
              <Input id="monthlyBudget" type="number" step="0.01" {...register("monthlyBudget", { valueAsNumber: true })} />
              {errors.monthlyBudget && <p className="text-xs text-danger">{errors.monthlyBudget.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.symbol} — {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-fit">
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how SpendSnap looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark mode</p>
              <p className="text-xs text-muted-foreground">Follows your system setting by default.</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            Prefer to match your OS automatically? Use the theme toggle in the top navigation for full light / dark / system control.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
