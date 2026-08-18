"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import type { SubscriptionPlan } from "@/lib/subscribe/plans";

type PlanSelectorProps = {
  slug: string;
  plans: SubscriptionPlan[];
};

function getDefaultPlanId(plans: SubscriptionPlan[]) {
  return plans.find((plan) => plan.recommended)?.id ?? plans[0]?.id ?? "";
}

export default function PlanSelector({ slug, plans }: PlanSelectorProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() =>
    getDefaultPlanId(plans),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan =
    plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null;

  async function handleContinue() {
    if (!selectedPlan || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/subscribe/${slug}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });

      const data = (await response.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;

      if (response.ok && data?.url) {
        window.location.assign(data.url);
        return;
      }

      setError(
        data?.error ??
          "Não foi possível iniciar o pagamento. Tente novamente.",
      );
    } catch {
      setError("Não foi possível iniciar o pagamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative flex w-full flex-col rounded-2xl border p-6 text-left transition-all ${
                isSelected
                  ? "border-orange-500/60 bg-orange-500/5 shadow-lg shadow-orange-500/10"
                  : "border-black/10 bg-white/80 hover:border-orange-500/30 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg shadow-orange-500/20">
                  <Sparkles className="h-3 w-3" />
                  Recomendado
                </span>
              )}

              <h4 className="text-base font-semibold text-zinc-950 dark:text-white">
                {plan.name}
              </h4>

              <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {plan.priceLabel}
              </p>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                a cada {plan.intervalLabel}
              </p>

              <p className="mt-3 text-sm leading-5 text-zinc-600 dark:text-zinc-400">
                {plan.description}
              </p>

              <span
                className={`mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                  isSelected
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-zinc-500/25 text-zinc-600 hover:border-orange-500/40 hover:text-orange-500 dark:text-zinc-300"
                }`}
              >
                {isSelected && <Check className="h-4 w-4" />}
                {isSelected ? "Selecionado" : "Escolher"}
              </span>
            </button>
          );
        })}
      </div>

      {selectedPlan && (
        <div className="mt-6 rounded-2xl border border-black/10 bg-white/80 p-5 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Plano selecionado:{" "}
            <span className="font-semibold text-zinc-950 dark:text-white">
              {selectedPlan.name}
            </span>{" "}
            · {selectedPlan.priceLabel} a cada {selectedPlan.intervalLabel}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={isLoading || !selectedPlan}
        className={`mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all ${
          isLoading || !selectedPlan
            ? "cursor-not-allowed border border-zinc-500/20 bg-zinc-500/5 text-zinc-500 dark:text-zinc-400"
            : "bg-orange-500 text-white shadow-lg shadow-orange-500/10 hover:bg-orange-400 hover:shadow-orange-500/20"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparando pagamento...
          </>
        ) : (
          "Continuar para pagamento"
        )}
      </button>
    </div>
  );
}