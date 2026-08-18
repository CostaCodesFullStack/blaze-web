import { cookies } from "next/headers";

const SESSION_COOKIE = "blaze_session";

export type SessionUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

/**
 * Cria uma sessão autenticada para o usuário.
 */
export async function createSession(user: SessionUser) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, encodeURIComponent(JSON.stringify(user)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/**
 * Recupera a sessão atual.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (!session) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(session.value)) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Remove a sessão atual.
 */
export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}
