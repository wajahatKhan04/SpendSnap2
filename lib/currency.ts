import { Currency } from "@/types";
import { CURRENCY_OPTIONS } from "@/constants";

const LOCALE_BY_CURRENCY: Record<Currency, string> = {
  [Currency.PKR]: "ur-PK",
  [Currency.USD]: "en-US",
  [Currency.EUR]: "de-DE",
  [Currency.GBP]: "en-GB",
  [Currency.AED]: "ar-AE",
  [Currency.SAR]: "ar-SA",
};

export function formatCurrency(amount: number, currency: Currency = Currency.PKR): string {
  try {
    return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    const symbol = CURRENCY_OPTIONS.find((c) => c.value === currency)?.symbol ?? currency;
    return `${symbol} ${amount.toLocaleString()}`;
  }
}

export function currencySymbol(currency: Currency = Currency.PKR): string {
  return CURRENCY_OPTIONS.find((c) => c.value === currency)?.symbol ?? currency;
}
