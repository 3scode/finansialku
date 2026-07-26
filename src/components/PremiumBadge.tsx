import { MaterialSymbol } from "./MaterialSymbol";

export function PremiumBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  const cls = size === "lg"
    ? "px-3 py-1 text-label-sm gap-1"
    : "px-2 py-0.5 text-[11px] gap-0.5";

  return (
    <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 font-semibold ${cls}`}>
      <MaterialSymbol icon="workspace_premium" size={size === "lg" ? 14 : 11} />
      PREMIUM
    </span>
  );
}
