import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const STATE_VERSION = "1";
const STATE_TTL_MS = 10 * 60 * 1000;

export type InstallState = {
  v: string;
  slug: string;
  discordId: string;
  exp: number;
  nonce: string;
};

function getStateSecret(): string {
  const value = process.env.APP_STATE_SECRET;

  if (!value) {
    throw new Error("APP_STATE_SECRET is not configured.");
  }

  return value;
}

function sign(input: string): string {
  return createHmac("sha256", getStateSecret()).update(input).digest("base64url");
}

/**
 * Cria o state da autorizacao de instalacao do bot, assinado via HMAC.
 *
 * O payload vincula: slug da aplicacao, discordId do usuario autenticado,
 * expiracao e um nonce aleatorio. Isso impede CSRF (state so e valido para a
 * sessao que o criou), troca de aplicacao/usuario e replay (binding de sessao +
 * expiracao + nonce + code de uso unico do Discord).
 */
export function createInstallState(slug: string, discordId: string): string {
  const payload: InstallState = {
    v: STATE_VERSION,
    slug,
    discordId,
    exp: new Date().getTime() + STATE_TTL_MS,
    nonce: randomBytes(16).toString("hex"),
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${encoded}.${sign(encoded)}`;
}

/**
 * Decodifica e valida o state. Retorna null para qualquer falha:
 * formato invalido, assinatura invalida (tampering) ou payload malformado.
 */
export function decodeInstallState(state: string): InstallState | null {
  const parts = state.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [encoded, signature] = parts;

  if (!encoded || !signature) {
    return null;
  }

  try {
    const expected = Buffer.from(sign(encoded));
    const received = Buffer.from(signature);

    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf-8"),
    ) as InstallState;

    if (
      typeof payload.v !== "string" ||
      payload.v !== STATE_VERSION ||
      typeof payload.slug !== "string" ||
      typeof payload.discordId !== "string" ||
      typeof payload.exp !== "number" ||
      typeof payload.nonce !== "string"
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isInstallStateExpired(payload: InstallState): boolean {
  return payload.exp <= new Date().getTime();
}