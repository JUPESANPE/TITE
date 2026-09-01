# TITE — Seguridad

## Ownership / aislamiento de datos (punto 11, regla crítica)

Usuario A nunca puede acceder a información del usuario B. Cómo se garantiza:

1. **Única fuente de identidad**: `src/lib/session.ts#requireUser()` deriva el `userId` de la sesión JWT firmada por NextAuth. Ningún handler de `app/api/**` lee `userId` de body/query/header.
2. **Todos los repositorios** (`src/data/repositories/**`) reciben `userId` como primer argumento explícito y lo aplican como filtro obligatorio: `findFirst({ where: { id, userId } })` en vez de `findUnique({ where: { id } })`; `updateMany`/`deleteMany` con `{ id, userId }` en vez de `update`/`delete` por id solo — así un id adivinado de otro usuario simplemente no matchea ninguna fila (count 0 / null), nunca edita el recurso ajeno.
3. **Uploads**: las imágenes se guardan bajo la key `${userId}/archivo.ext` y `app/api/uploads/[...path]/route.ts` rechaza (403) cualquier request cuyo primer segmento de path no sea el `userId` de la sesión actual.
4. **Outfits/favoritos/feedback**: cada mutación primero hace `findFirst({ id, userId })` antes de escribir, para no operar sobre un outfit de otro usuario aunque el atacante conozca el id.

## Autenticación

- Contraseñas: hash con `bcryptjs` (10 rounds), nunca en texto plano ni en logs.
- Sesión: JWT firmado server-side (`AUTH_SECRET`), no se confía en nada que venga del cliente para identidad.
- Login social (Google): el email del proveedor se usa para upsert de `User`; no se crea sesión sin verificar el proveedor OAuth.

## Validación de input

- Todo body de API se valida con `zod` (`src/lib/validation/**`) antes de tocar la DB. Nunca se pasa `req.body`/`formData` crudo a Prisma.
- Uploads de imagen: se valida el **content-type real** mirando los magic bytes del archivo (`src/lib/image-sniff.ts`), no el `Content-Type` que manda el cliente (que se puede falsear). Límite de tamaño server-side (`MAX_IMAGE_BYTES`, 8MB).

## Secretos

- Nada de API keys/secrets hardcodeados. Todo vía `process.env`, documentado en `.env.example` / `ENVIRONMENT.md`.
- `.env` está en `.gitignore`; sólo se commitea `.env.example` con valores vacíos.

## Rate limiting

No implementado todavía en P0 (requiere infraestructura — ej. un store compartido tipo Redis para contar requests entre instancias, que no tiene sentido mockear en este repo). Los puntos de mayor riesgo a proteger primero en P1 son: `POST /api/wardrobe` (upload), `POST /api/outfits/generate`, `POST /api/auth/register`. El anti-farming de Points (ver `POINTS_SYSTEM.md`) ya limita el abuso económico aunque no haya rate limit de requests.

## Anti-farming (Points)

Ver `POINTS_SYSTEM.md`. El mecanismo real es el constraint único `(userId, actionType, referenceId)` en `points_ledger` — no depende de que el código de aplicación "se acuerde" de chequear duplicados; si dos requests concurrentes intentan premiar lo mismo, la base de datos rechaza la segunda.

## Privacidad

Ver también `PRODUCT.md` (modelo de negocio) y `DATA_MODEL.md` (`UserConsent`).

- Consentimiento granular por tipo (`LOCATION`, `ANALYTICS`, `PERSONALIZATION`, `MARKETING`, `DATA_SHARING`) vía `app/api/profile/consent`.
- Borrado de cuenta real: `DELETE /api/account` borra el `User` y, por cascade delete en el schema, todo lo asociado (armario, outfits, points, analytics, consentimientos).
- Analytics nunca guarda PII en `properties` (ver `ANALYTICS.md`): sólo ids y valores de producto.
- No se comparte PII con marcas/terceros sin consentimiento explícito (ver `PRODUCT.md`, sección de modelo de negocio).

## Qué falta para producción (documentado, no implementado en P0)

- Rate limiting real (ver arriba).
- CSRF: NextAuth ya protege sus propios endpoints; las API routes mutantes deberían agregar verificación de origen si se exponen a un frontend fuera de este mismo dominio.
- Content Security Policy / headers de seguridad (`next.config.mjs`) — placeholder para P1.
- Escaneo de malware en uploads antes de servir imágenes a otros usuarios (no aplica hoy: las imágenes son privadas por usuario).
