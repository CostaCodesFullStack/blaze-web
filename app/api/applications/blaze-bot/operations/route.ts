import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getApplicationBySlug } from "@/lib/db/repositories/applications";
import { getUserByDiscordId } from "@/lib/db/repositories/users";
import { requireApplicationAccess } from "@/lib/subscriptions/require-access";
import { BLAZE_BOT_SLUG } from "@/lib/blaze-bot/config";
import {
  executeBlazeBotOperation,
  parseBlazeBotOperationRequest,
  type BlazeBotOperationError,
} from "@/lib/blaze-bot/operations";

const OPERATION_ERROR_STATUS: Record<BlazeBotOperationError, number> = {
  "unknown-operation": 400,
  "app-inactive": 403,
  "no-access": 403,
  "no-guild": 403,
  "not-configured": 403,
  disabled: 403,
  offline: 409,
  "backend-unavailable": 503,
};

export async function POST(request: Request) {
  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const parsed = parseBlazeBotOperationRequest(parsedBody);

  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.safeMessage },
      { status: 400 },
    );
  }

  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 },
    );
  }

  const application = await getApplicationBySlug(BLAZE_BOT_SLUG);

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

  const access = await requireApplicationAccess(user.id, application.id);

  if (!access.granted) {
    return NextResponse.json(
      { error: "Sem acesso a esta aplicação." },
      { status: 403 },
    );
  }

  const result = await executeBlazeBotOperation({
    userId: user.id,
    applicationId: application.id,
    operation: parsed.operation,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.safeMessage },
      { status: OPERATION_ERROR_STATUS[result.error] },
    );
  }

  return NextResponse.json({ ok: true, operation: result.operation });
}
