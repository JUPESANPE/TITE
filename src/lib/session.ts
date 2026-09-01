import { auth } from "./auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("No autenticado");
    this.name = "UnauthorizedError";
  }
}

/**
 * ÚNICA fuente de verdad de "quién es el usuario actual" en toda la app.
 *
 * Regla dura (PRODUCT.md punto 11 / SECURITY.md): ningún handler de API
 * debe leer un `userId` del body, la query string o un header — siempre se
 * deriva acá, de la sesión firmada por NextAuth. Todos los repositorios en
 * `src/data/repositories/**` reciben este `userId` como único filtro de
 * ownership posible.
 */
export async function requireUser(): Promise<{ id: string; email: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return { id: session.user.id, email: session.user.email ?? "" };
}

export async function getOptionalUser(): Promise<{ id: string; email: string } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { id: session.user.id, email: session.user.email ?? "" };
}
