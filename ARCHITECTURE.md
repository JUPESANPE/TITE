# TITE — Arquitectura

## A. Stack elegido y justificación

| Capa | Elección | Por qué |
|---|---|---|
| Lenguaje | TypeScript estricto end-to-end | Un solo lenguaje cliente/servidor, tipos compartidos, menos bugs de contrato. |
| Framework | Next.js (App Router) + React | SSR/RSC out of the box, API routes en el mismo repo, ecosistema maduro, deploy simple, mobile-first friendly. |
| Estilos | Tailwind CSS | Design system consistente sin CSS-in-JS pesado, rápido de iterar. |
| Base de datos | PostgreSQL | Relacional real, soporta las relaciones del punto 56 (wardrobe, outfits, points ledger) con integridad referencial y transacciones — crítico para el ledger de Points. |
| ORM | Prisma | Migrations versionadas, tipos generados, buena DX, estándar de facto en Next.js. |
| Auth | NextAuth.js (Auth.js) v5 | Credentials (email/password) + Google OAuth de entrada, sesiones server-side (JWT o DB session), fácil de extender a más providers sin tocar el dominio. |
| Storage de imágenes | Abstracción `StorageService` con proveedor S3-compatible en producción y proveedor local en desarrollo | Evita atar el dominio a un vendor. En dev no depende de credenciales externas. |
| AI (clasificación de prendas, recomendación) | Abstracción `AiProvider` con proveedor determinístico (rule-based) por default y adaptador opcional a un LLM/vision API cuando haya credenciales | El dominio nunca depende de un vendor de AI concreto (punto 66). Sin API key, el producto sigue funcionando con un fallback razonable. |
| Clima | Open-Meteo (sin API key, gratuito) detrás de `WeatherService` | Evita bloquear el desarrollo por credenciales (punto 26-27) y es trivialmente reemplazable. |
| Analytics | Tabla propia `analytics_events` + `AnalyticsService` con adaptador enchufable (PostHog/Segment quedan como TODO documentado) | No depende de vendor externo desde el día uno; mismo modelo de eventos sirve para migrar después. |
| Testing | Node.js test runner nativo (`node:test`) para lógica de dominio pura; Vitest + Testing Library declarados para cuando haya acceso a npm | Ver nota de entorno abajo. |
| Validación | Zod | Validación server-side de todo input, tipos inferidos compartidos con el cliente. |
| Infraestructura objetivo | Vercel (app) + Postgres administrado (Neon/Supabase/RDS) + bucket S3-compatible | Costo bajo para MVP, escalable sin reescritura. |

### Nota de entorno de esta sesión

Esta sesión de desarrollo corre en un contenedor con política de red restringida a GitHub — no tiene acceso a `registry.npmjs.org`. Por eso:

- Todo el código de la aplicación (Next.js, Prisma schema, dominio, API routes) está escrito completo y lista para instalar, pero **no se corrió `npm install` / `next build` dentro de esta sesión**.
- Sí se validó realmente contra un PostgreSQL 16 local: el SQL de la migración inicial se aplicó con `psql` (ver `prisma/migrations`).
- La lógica de dominio más crítica (Outfit Engine, Points Engine, Streaks) se escribió sin dependencias externas y se probó de verdad con el test runner nativo de Node (`node --test`), compilando con `tsc` (ambos preinstalados, sin necesitar `npm install`).
- Para correr la app completa: `npm install` (o `pnpm install`) en un entorno con acceso a internet, y seguir `ENVIRONMENT.md`.

## B. Arquitectura de alto nivel

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
│  ┌───────────────┐   ┌────────────────────────────────────┐ │
│  │  UI (RSC/CSR)  │──▶│  API Routes (app/api/**)           │ │
│  │  app/**/page   │   │  - validan input (zod)              │ │
│  │  components/** │   │  - resuelven sesión (auth)          │ │
│  └───────────────┘   │  - delegan a domain/** y data/**     │ │
│                       └───────────────┬────────────────────┘ │
│                                       │                       │
│         ┌─────────────────────────────┼─────────────────────┐│
│         ▼                             ▼                     ▼│
│  ┌─────────────┐            ┌──────────────────┐  ┌──────────┐
│  │  domain/**  │            │  services/**      │  │analytics/│
│  │  reglas de  │            │  weather, storage,│  │ events   │
│  │  negocio    │            │  ai (adaptadores) │  │          │
│  │  puras      │            └──────────────────┘  └──────────┘
│  └──────┬──────┘                                              │
│         ▼                                                     │
│  ┌─────────────┐                                              │
│  │  data/**    │  Prisma Client + repositorios                │
│  └──────┬──────┘                                              │
└─────────┼──────────────────────────────────────────────────────┘
          ▼
   PostgreSQL (users, wardrobe, outfits, points_ledger, ...)
```

Separación estricta (punto 9):

- **`src/domain/**`**: reglas de negocio puras (outfit engine, points engine, streaks, scoring). Sin imports de React ni de Prisma directamente — reciben datos ya cargados y devuelven decisiones. Esto es lo que permite testearlas sin DB ni framework.
- **`src/data/**`**: acceso a persistencia. Repositorios que envuelven Prisma Client y aplican siempre el filtro por `userId` de la sesión (ownership).
- **`src/services/**`**: integraciones externas desacopladas por interfaz (`WeatherService`, `StorageService`).
- **`src/ai/**`**: `GarmentClassificationService` y `OutfitRecommendationAssist` como interfaces con implementación rule-based por default.
- **`src/analytics/**`**: emisión de eventos tipados.
- **`src/lib/**`**: auth, sesión, validación compartida.
- **`app/**`**: sólo orquestación — páginas y route handlers finos que llaman a domain/data/services. Nada de lógica de negocio en JSX (punto 75).

## C. Estructura de carpetas

```
tite/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/register/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── home/page.tsx
│   │   ├── wardrobe/page.tsx
│   │   ├── wardrobe/add/page.tsx
│   │   ├── outfit/page.tsx
│   │   ├── layout.tsx / globals.css / page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── auth/register/route.ts
│   │       ├── profile/route.ts
│   │       ├── wardrobe/route.ts
│   │       ├── wardrobe/[id]/route.ts
│   │       ├── weather/route.ts
│   │       ├── outfits/generate/route.ts
│   │       ├── outfits/[id]/select/route.ts
│   │       ├── outfits/[id]/feedback/route.ts
│   │       ├── favorites/route.ts
│   │       ├── points/route.ts
│   │       └── analytics/route.ts
│   ├── domain/
│   │   ├── wardrobe/
│   │   ├── outfit/ (engine, scoring, filters, types)
│   │   ├── points/ (engine, actions, streaks, types)
│   │   └── profile/
│   ├── services/
│   │   ├── weather/ (interface + open-meteo provider)
│   │   └── storage/ (interface + local-disk provider)
│   ├── ai/ (interface + rule-based provider)
│   ├── analytics/ (service + catálogo de eventos)
│   ├── data/
│   │   ├── prisma.ts
│   │   └── repositories/
│   ├── lib/ (auth.ts, session.ts, validation/)
│   ├── components/ (ui/, wardrobe/, outfit/, onboarding/, layout/)
│   └── copy/ (es-AR.ts)
├── tests/
│   ├── unit/ (node:test — outfit-engine, points-engine, streaks)
│   └── vitest/ (declarados para cuando haya npm: wardrobe, auth isolation)
├── public/
├── .env.example
└── docs (este archivo + PRODUCT/DATA_MODEL/OUTFIT_ENGINE/POINTS_SYSTEM/ANALYTICS/SECURITY/ENVIRONMENT/ROADMAP.md)
```

## C bis. Identidad y navegación

La identidad visual vive en tres documentos, y `tailwind.config.ts` implementa sus tokens:

- [`BRAND.md`](./BRAND.md) — tipografía (Outfit + Karla), color, la superficie de madera, los Hilitos, reglas duras.
- [`HOME.md`](./HOME.md) — la pantalla principal módulo por módulo.
- [`NAVIGATION.md`](./NAVIGATION.md) — la barra inferior fija de cinco slots con botón central.

Rutas nuevas que la navegación implica y todavía no existen: `/tendencias`, `/premios`, `/perfil`. La barra tiene que montarse en un layout compartido por todas las pantallas autenticadas, no sólo dentro de `(app)`.

**Estado:** los tokens de color y tipografía ya están en `tailwind.config.ts` y los strings en `src/copy/es-AR.ts`. El refactor de `AppNav.tsx` y la Home nueva no están implementados — esperan a que el diseño se apruebe.

## D. Modelo de datos

Ver `DATA_MODEL.md` para el detalle completo de entidades, relaciones, índices y constraints.

## E. Autenticación

- NextAuth.js con dos providers en P0: `Credentials` (email + password con hash `bcrypt`) y `Google`.
- Estrategia de sesión: JWT firmado server-side, `userId` embebido en el token, nunca en el body de las requests.
- **Regla de aislamiento (punto 11):** ningún handler de API confía en un `userId` recibido del cliente. `src/lib/session.ts` expone `requireUser(req)` que resuelve el usuario desde la sesión firmada; todos los repositorios reciben ese `userId` y lo aplican como filtro obligatorio (`WHERE userId = $1`) en cada query de lectura/escritura. Ver `SECURITY.md`.

## F. Storage

`StorageService` (interfaz) con dos implementaciones:

- `LocalDiskStorageProvider` (dev): guarda en `./uploads`, sirve vía route handler con auth.
- `S3StorageProvider` (prod, requiere credenciales): implementa la misma interfaz. Documentado como `TODO: requires external credentials` — no se inventan claves.

Validación server-side de todo upload: tipo MIME real (magic bytes, no sólo extensión), tamaño máximo, dimensiones razonables. Ver `SECURITY.md`.

## G. Outfit Engine

Pipeline: `RULES → FILTERING → SCORING → (AI opcional) → RESULT`. Nunca inventa prendas: sólo combina ítems reales del armario del usuario. Detalle completo en `OUTFIT_ENGINE.md`.

## H. Points Engine

`points_ledger` como fuente de verdad (append-only), `points_balances` como proyección. Idempotencia por `(userId, actionType, referenceId)` para anti-farming. Detalle en `POINTS_SYSTEM.md`.

## I. Analytics

Eventos tipados en `src/analytics/events.ts`, persistidos en `analytics_events`, sin PII innecesaria (se guarda `userId`, no email/nombre en el payload). Detalle en `ANALYTICS.md`.

## J. Seguridad

Ver `SECURITY.md`: ownership checks, rate limiting, validación de uploads, secretos server-side, sanitización.

## K. APIs externas necesarias

| Servicio | Para qué | Requiere credenciales | Estado en este repo |
|---|---|---|---|
| Open-Meteo | Clima (geocoding + forecast) | No | Implementado real, sin mock |
| Google OAuth | Login con Google | Sí (`GOOGLE_CLIENT_ID/SECRET`) | Interfaz lista, deshabilitado hasta configurar `.env` |
| Proveedor S3-compatible | Storage de imágenes en prod | Sí | Interfaz lista, `LocalDiskStorageProvider` activo por default |
| Proveedor de AI/vision | Clasificación de prendas avanzada | Sí (opcional) | Interfaz lista, `RuleBasedClassifier` activo por default |

## L. Costos a vigilar

- Postgres administrado (Neon/Supabase free tier alcanza para MVP).
- Storage de imágenes (S3/R2): costo por GB + requests, bajo en MVP.
- Cualquier proveedor de AI/vision que se enchufe después: cobra por imagen/token — por eso el pipeline filtra antes de llamar a AI (ver `OUTFIT_ENGINE.md` sección de costos).
- Open-Meteo, NextAuth, Vercel hobby: gratis en el rango de uso del MVP.

## M. Roadmap

Ver `ROADMAP.md` (P0/P1/P2/P3).

## N. Riesgos

| Riesgo | Tipo | Mitigación |
|---|---|---|
| Cold-start del armario (usuario no carga ropa) | Producto | Progressive wardrobe building + gamificación de carga + "primer outfit rápido" con mínimo viable (punto 22-24). |
| Clasificación de AI incorrecta | Producto/Técnico | Nunca confiar ciegamente: siempre hay paso de confirmar/corregir (punto 18). |
| Farming de Points | Técnico | Idempotencia por acción+referencia+fecha en el ledger (punto 46). |
| Fuga de datos entre usuarios | Seguridad | Ownership derivado de sesión en cada repositorio, nunca de input del cliente (punto 11). |
| Outfit engine "inventando" combinaciones imposibles | Producto | Regla dura: sólo ítems reales del armario; tests dedicados (`OUTFIT_ENGINE.md`). |
| Dependencia de vendor de AI/clima | Técnico | Todo detrás de interfaces reemplazables (punto 66). |
| Costo de AI si se abusa | Costo | Pipeline rules→filtering→scoring antes de AI; AI es opcional y sobre candidatos ya reducidos. |
