import { getStripePriceId } from "@/lib/stripe/config";

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  interval: string;
  intervalLabel: string;
  price: number;
  priceLabel: string;
  recommended: boolean;
};

export type ServerSubscriptionPlan = SubscriptionPlan & {
  stripePriceId: string;
};

const PLANS: SubscriptionPlan[] = [
  {
    id: "monthly",
    name: "Mensal",
    description: "Ideal para começar e conhecer a aplicação.",
    interval: "monthly",
    intervalLabel: "mês",
    price: 1990,
    priceLabel: "R$ 19,90",
    recommended: false,
  },
  {
    id: "quarterly",
    name: "Trimestral",
    description: "O melhor custo-benefício para quem usa diariamente.",
    interval: "quarterly",
    intervalLabel: "3 meses",
    price: 4990,
    priceLabel: "R$ 49,90",
    recommended: true,
  },
  {
    id: "yearly",
    name: "Anual",
    description: "A máxima economia para quem tem planos a longo prazo.",
    interval: "yearly",
    intervalLabel: "ano",
    price: 14990,
    priceLabel: "R$ 149,90",
    recommended: false,
  },
];

export function getSubscriptionPlans(): SubscriptionPlan[] {
  return PLANS;
}

export function getSubscriptionPlanById(id: string): SubscriptionPlan | null {
  return PLANS.find((plan) => plan.id === id) ?? null;
}

export function getServerSubscriptionPlanById(
  id: string,
): ServerSubscriptionPlan | null {
  const plan = getSubscriptionPlanById(id);

  if (!plan) {
    return null;
  }

  return {
    ...plan,
    stripePriceId: getStripePriceId(plan.id) ?? "",
  };
}