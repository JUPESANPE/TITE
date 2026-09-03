# TITE

**¿Qué me pongo hoy?**

TITE es un asistente personal de estilo: conoce la ropa que tenés, aprende tu estilo progresivamente y te recomienda outfits reales de tu propio armario según el clima y la ocasión.

## Documentación

| Documento | Contenido |
|---|---|
| [`PRODUCT.md`](./PRODUCT.md) | Qué es TITE, principios de producto, flujo principal, modelo de negocio. |
| [`BRAND.md`](./BRAND.md) | Identidad: tipografía, color, madera, Hilitos, reglas duras. |
| [`HOME.md`](./HOME.md) | La pantalla principal, módulo por módulo. |
| [`NAVIGATION.md`](./NAVIGATION.md) | La barra inferior de cinco slots y el botón central. |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Stack, arquitectura de carpetas, decisiones técnicas. |
| [`DATA_MODEL.md`](./DATA_MODEL.md) | Entidades, relaciones, índices. |
| [`OUTFIT_ENGINE.md`](./OUTFIT_ENGINE.md) | Cómo se generan las recomendaciones (nunca inventa ropa). |
| [`POINTS_SYSTEM.md`](./POINTS_SYSTEM.md) | Ledger, anti-farming, rachas. |
| [`ANALYTICS.md`](./ANALYTICS.md) | Eventos, métricas, PII. |
| [`SECURITY.md`](./SECURITY.md) | Aislamiento de datos, validación, secretos. |
| [`ENVIRONMENT.md`](./ENVIRONMENT.md) | Cómo correrlo local, variables de entorno. |
| [`ROADMAP.md`](./ROADMAP.md) | P0 (este repo) → P1 → P2 → P3. |

## Quick start

```bash
cp .env.example .env   # completá DATABASE_URL y AUTH_SECRET
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Detalle completo en [`ENVIRONMENT.md`](./ENVIRONMENT.md).

## Stack

TypeScript estricto end-to-end · Next.js (App Router) · React · Tailwind CSS · PostgreSQL + Prisma · NextAuth.js (email + Google) · Open-Meteo (clima, sin API key) · Zod · Node test runner / Vitest.

Justificación completa en [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Estado del proyecto

P0 (MVP) implementado: auth, onboarding, armario digital con upload y clasificación, clima real, motor de outfits, selección + favoritos + feedback, TITE Points con ledger anti-farming, rachas, analytics, tests de dominio. Detalle exacto en [`ROADMAP.md`](./ROADMAP.md).

La lógica de dominio más crítica (motor de outfits, motor de puntos, rachas) tiene tests reales que corren con el test runner nativo de Node — ver `tests/unit/`.

## Testing

```bash
# Lógica de dominio pura, sin dependencias (funciona incluso sin npm install):
tsc -p tsconfig.tests.json && node --test tests/unit-compiled/tests/unit/*.test.js

# Suite completa (requiere npm install):
npm test
```

## Contribuir (para el equipo)

1. Traé la rama `main` actualizada.
2. Corré `npm run lint && npm run typecheck && npm test` antes de subir cambios.
3. Commits chicos y descriptivos; PRs contra `main`.
