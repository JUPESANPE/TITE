# TITE — Modelo de datos (P0)

Fuente de verdad: `prisma/schema.prisma`. Este documento explica las relaciones y por qué. Sólo se implementan en P0 las tablas que el MVP necesita (punto 56: "no crear todas las tablas porque aparecen en el brief").

## Entidades P0

```
User 1───1 Profile
User 1───N WardrobeItem
User 1───N Outfit ───N OutfitItem ───1 WardrobeItem
User 1───N OutfitFeedback (1 por Outfit)
User 1───N FavoriteOutfit ───1 Outfit
User 1───1 Streak
User 1───N PointsLedgerEntry
User 1───1 PointsBalance (proyección del ledger)
User 1───N AnalyticsEvent
User 1───N UserConsent
      WeatherSnapshot (por request de outfit, referenciado desde Outfit)
```

## Detalle de tablas

### `User`
Identidad real (punto 10-11). `id`, `email` (único), `passwordHash` (null si login social), `name`, `image`, `createdAt`.

### `Profile`
1:1 con `User`. `location` (ciudad + lat/lng opcional), `stylePreferences` (array de estilos, punto 13), `sizes` (JSON: `{tops, bottoms, shoes}`), `onboardingCompletedAt`, `profileCompleteness` (0-100, "TITE te conoce %", punto 15).

### `WardrobeItem`
Prenda real del usuario (punto 19). Campos clave: `id`, `userId` (FK, índice), `imageUrl`, `thumbnailUrl`, `name`, `category` (enum extensible, punto 16), `subcategory`, `primaryColor`, `secondaryColors` (string[]), `brand?`, `warmth` (1-5), `formality` (1-5), `fit?`, `styles` (string[]), `season` (string[]), `material?`, `favorite` (bool), `price?`, `purchaseDate?`, `lastWornAt` (para `RecentWearPenalty`, sin exponer "lavado" — punto 21), `createdAt`, `updatedAt`. Índice compuesto `(userId, category)` para filtrado rápido del engine.

### `Outfit`
Una recomendación generada y potencialmente elegida. `id`, `userId`, `occasion` (enum), `weatherSnapshotId?`, `status` (`GENERATED | SELECTED | REJECTED`), `explanation` (texto corto), `generationGroupId` (agrupa las N alternativas de una misma request, para "otra opción"), `createdAt`, `selectedAt?`.

### `OutfitItem`
Junction `Outfit`↔`WardrobeItem` con `role` (`TOP | BOTTOM | FOOTWEAR | OUTERWEAR | ACCESSORY | DRESS`). Un outfit nunca referencia una prenda que no exista o no sea del mismo `userId` (constraint validado en el repositorio, no sólo en DB).

### `OutfitFeedback`
1:1 (o 1:N si se permite ampliar) con `Outfit`. `rating` (`LOVE | GOOD | NEUTRAL | DISLIKE`), `comfortable?`, `matchedStyle?`, `wouldRepeat?`, `comment?`, `createdAt`.

### `FavoriteOutfit`
`userId`, `outfitId`, `createdAt`. Si una prenda del outfit se borra después, el outfit se conserva (soft reference) y la UI muestra "una de estas prendas ya no está en tu armario" en vez de romper (punto 38) — se resuelve chequeando en runtime si `WardrobeItem` sigue existiendo, sin borrar el historial.

### `WeatherSnapshot`
Cache liviano de la consulta de clima que generó un outfit: `temp`, `feelsLike`, `min`, `max`, `rainChance`, `windSpeed`, `condition`, `city`, `createdAt`. Permite auditar/explicar recomendaciones pasadas sin volver a pegarle a la API.

### `Streak`
1:1 con `User`. `currentCount`, `longestCount`, `lastActionDate` (fecha, no timestamp, para evitar doble conteo el mismo día — punto 47).

### `PointsLedgerEntry`
Append-only, fuente de verdad de Points (punto 45). `id`, `userId`, `amount` (puede ser negativo para ajustes), `actionType` (enum extensible), `source`, `referenceId` (p.ej. `outfitId` o `wardrobeItemId` o fecha), `metadata` (JSON), `status` (`CONFIRMED | REVERSED`), `createdAt`. **Constraint único `(userId, actionType, referenceId)`** — es el mecanismo anti-farming (punto 46): un mismo `(usuario, acción, referencia)` sólo puede acreditar puntos una vez.

### `PointsBalance`
Proyección: `userId`, `total`. Se recalcula/incrementa en la misma transacción que inserta en el ledger, nunca se edita por separado (evita que balance y ledger diverjan).

### `AnalyticsEvent`
`id`, `userId?` (null si evento pre-login), `name` (enum, ver `ANALYTICS.md`), `properties` (JSON, sin PII), `createdAt`.

### `UserConsent`
`userId`, `type` (`LOCATION | ANALYTICS | PERSONALIZATION | MARKETING | DATA_SHARING`), `granted` (bool), `updatedAt`. Permite consentimiento granular (punto 61).

## Preparado pero no implementado en P0

Tablas mencionadas en el brief (punto 56) que quedan documentadas como diseño de relación pero **sin migración** hasta P1/P2 (missions, rewards, redemptions, referrals, products, purchases, reviews, sponsored_campaigns, brand_preferences): ver `ROADMAP.md`. Se dejan los `enum` de `PointsActionType` con espacio para esas categorías (punto 43) para no tener que migrar el enum entero después.

## Índices y constraints clave

- `WardrobeItem(userId, category)` — filtrado del outfit engine.
- `Outfit(userId, createdAt)` — historial/home.
- `PointsLedgerEntry(userId, actionType, referenceId)` **UNIQUE** — anti-farming.
- `PointsLedgerEntry(userId, createdAt)` — cálculo de balance/auditoría.
- `Streak(userId)` **UNIQUE**.
- `OutfitItem(outfitId, wardrobeItemId)` **UNIQUE** — no duplicar la misma prenda en un outfit.
- Todas las FK a `User.id` con `onDelete: Cascade` (borrar cuenta borra sus datos — punto 61).
