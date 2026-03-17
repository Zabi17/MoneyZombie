import { useAppStore } from "../store/useAppStore";
import { CURRENCIES } from "../constants/defaults";

export function useCurrency() {
  const currency = useAppStore((s) => s.settings.currency);
  const meta = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  const format = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: meta.code,
      maximumFractionDigits: 0,
    }).format(amount);

  return { ...meta, format };
}
