# TITE — Entorno

## Cómo correrlo localmente (con acceso normal a internet)

Requisitos: Node.js 20+, PostgreSQL 14+ (local o remoto), `pnpm` o `npm`.

```bash
git clone <este repo>
cd tite
cp .env.example .env
# Editá .env: como mínimo DATABASE_URL y AUTH_SECRET (openssl rand -base64 32)

npm install          # o pnpm install
npx prisma generate
npx prisma migrate deploy   # aplica las migraciones ya versionadas en prisma/migrations
npm run dev
```

Abrir `http://localhost:3000`.

## Variables de entorno

Ver `.env.example`, comentado. Resumen de qué es obligatorio vs. opcional:

| Variable | Obligatoria | Sin ella... |
|---|---|---|
| `DATABASE_URL` | Sí | No arranca (Prisma la necesita para todo). |
| `AUTH_SECRET` | Sí | NextAuth no puede firmar sesiones. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Login con Google queda deshabilitado; email/contraseña funciona igual. |
| Storage S3 (`S3_*`) | No | Usa `LocalDiskStorageProvider` (carpeta `./uploads`) automáticamente. |
| AI provider | No | Usa el clasificador rule-based (`RuleBasedClassifier`) automáticamente. |
| Clima | No aplica | Open-Meteo no pide API key. |

## Por qué esta sesión de desarrollo no corrió `npm install`

Ver `ARCHITECTURE.md`, sección "Nota de entorno de esta sesión": el contenedor donde se escribió este código tiene la red restringida a GitHub únicamente (no llega a `registry.npmjs.org`). Por eso:

- Todo el código está completo y lista para instalar, pero no se corrió `next build`/`next dev` acá.
- El modelo de datos sí se validó de verdad: se aplicó la migración SQL contra un PostgreSQL 16 real corriendo en el mismo contenedor (`service postgresql start` + `psql`), incluyendo pruebas funcionales del constraint anti-farming del ledger de Points y del cascade delete al borrar una cuenta.
- La lógica de dominio más crítica (Outfit Engine, Points Engine, Streaks, progreso de armario) se probó de verdad con `node --test` sobre código compilado con el `tsc` global (sin necesitar `npm install`) — 24/24 tests pasando. Uno de esos tests encontró y permitió corregir un bug real de pesos en el scoring del clima (ver `OUTFIT_ENGINE.md`).

Primer paso recomendado en un entorno con internet: `npm install && npm run typecheck && npm run lint && npm run build` para confirmar que todo el árbol de Next.js compila (el dominio ya está probado; esto valida el resto: rutas de API, páginas, tipos de Prisma generados).

## Base de datos

- Dev: cualquier Postgres 14+ accesible (local, Docker, Neon, Supabase).
- Las migraciones están versionadas en `prisma/migrations/`. `npx prisma migrate deploy` las aplica en orden. Si preferís que Prisma regenere la migración inicial desde `schema.prisma` en vez de usar la que ya está commiteada, podés borrar la carpeta y correr `npx prisma migrate dev --name init` — el schema es la fuente de verdad, la migración SQL ya escrita es equivalente (fue validada a mano contra Postgres real, ver arriba).

## Storage local (dev)

Las imágenes se guardan en `./uploads/{userId}/archivo.ext` (gitignored) y se sirven vía `app/api/uploads/[...path]/route.ts` con auth. En producción, reemplazar `storageService` (`src/services/storage/index.ts`) por un `S3StorageProvider` real.

## Deploy sugerido (producción)

- App: Vercel (o cualquier host de Next.js).
- DB: Neon / Supabase / RDS Postgres.
- Storage: S3 / Cloudflare R2 (implementar `S3StorageProvider` detrás de la interfaz existente).
- Variables de entorno: configurarlas en el panel del host, nunca commitearlas.
