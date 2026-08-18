import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getApplicationBySlug } from "@/lib/db/repositories/applications";
import { getUserByDiscordId } from "@/lib/db/repositories/users";
import { getGuildApplicationByUserAndApplication } from "@/lib/db/repositories/guild-applications";
import { getSubscriptionByUserAndApplication } from "@/lib/db/repositories/subscriptions";
import { getServerSubscriptionPlanById } from "@/lib/subscribe/plans";
import { getStripeClient } from "@/lib/stripe/client";

type CheckoutRouteParams = {
  params: Promise<{ slug: string }>;
};

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export async function POST(
  request: NextRequest,
  { params }: CheckoutRouteParams,
) {
  const { slug } = await params;

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: "Aplicação inválida." }, { status: 400 });
  }

  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?redirect=${encodeURIComponent(`/subscribe/${slug}/checkout`)}`,
        request.url,
      ),
      { status: 307 },
    );
  }

  const application = await getApplicationBySlug(slug);

  if (!application) {
    return NextResponse.json(
      { error: "Aplicação não encontrada." },
      { status: 404 },
    );
  }

  if (!application.active) {
    return NextResponse.json(
      { error: "Esta aplicação está indisponível." },
      { status: 403 },
    );
  }

  const user = await getUserByDiscordId(session.id);

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado. Faça login novamente." },
      { status: 403 },
    );
  }

  const guildApplication =
    await getGuildApplicationByUserAndApplication(user.id, application.id);

  if (!guildApplication) {
    return NextResponse.json(
      { error: "Conecte um servidor antes de continuar." },
      { status: 400 },
    );
  }

  const existingSubscription = await getSubscriptionByUserAndApplication(
    user.id,
    application.id,
  );

  console.log("Stripe Checkout: renovação ou nova assinatura", {
    slug,
    userId: user.id,
    applicationId: application.id,
    guildId: guildApplication.guildId,
    existingSubscriptionId: existingSubscription?.id ?? null,
    existingStatus: existingSubscription?.status ?? null,
    renewing: existingSubscription !== null,
  });

  let planId = "";
  try {
    const body = (await request.json()) as { planId?: unknown };
    planId = typeof body.planId === "string" ? body.planId : "";
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida." },
      { status: 400 },
    );
  }

  const serverPlan = getServerSubscriptionPlanById(planId);

  if (!serverPlan) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }

  if (!serverPlan.stripePriceId) {
    return NextResponse.json(
      { error: "Pagamento não configurado." },
      { status: 500 },
    );
  }

  let stripe;

  try {
    stripe = getStripeClient();
  } catch {
    return NextResponse.json(
      { error: "Pagamento não configurado." },
      { status: 500 },
    );
  }

  const successUrl = new URL(
    `/subscribe/${application.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
    request.url,
  ).toString();
  const cancelUrl = new URL(
    `/subscribe/${application.slug}/checkout`,
    request.url,
  ).toString();

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: serverPlan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        applicationId: application.id,
        guildId: guildApplication.guildId,
        planId: serverPlan.id,
        discordId: session.id,
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Não foi possível iniciar o pagamento. Tente novamente." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Failed to create Stripe Checkout Session:", error);
    return NextResponse.json(
      { error: "Não foi possível iniciar o pagamento. Tente novamente." },
      { status: 500 },
    );
  }
}