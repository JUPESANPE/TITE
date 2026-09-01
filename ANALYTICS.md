# TITE — Analytics

## Modelo

Tabla propia `analytics_events` (`DATA_MODEL.md`) + `src/analytics/analytics.service.ts#track(name, userId, properties)`. Sin vendor externo en P0 — mismo modelo de eventos sirve para migrar a PostHog/Segment/Amplitude en P1 sin tocar los call sites (sólo cambiar la implementación de `track`).

## Regla de PII (punto 57)

`properties` nunca lleva email, nombre, imagen ni ubicación exacta — sólo ids (`outfitId`, no nombre de la prenda) y valores de producto (`occasion`, `category`, `rating`, `milestone`). El `userId` se guarda aparte, no dentro de `properties`, así se puede rotar/anonimizar sin tocar el histórico de propiedades.

## Catálogo (`src/analytics/events.ts`)

Implementados en P0 (con su call site):

| Evento | Dónde se dispara |
|---|---|
| `signup_completed` | `POST /api/auth/register` |
| `onboarding_completed` | `POST /api/profile` (primera vez) |
| `profile_updated` | `PATCH /api/profile` |
| `wardrobe_item_added` | `POST /api/wardrobe` |
| `wardrobe_item_deleted` | `DELETE /api/wardrobe/[id]` |
| `outfit_generated` | `POST /api/outfits/generate` |
| `alternate_outfit_requested` | `POST /api/outfits/alternative` |
| `outfit_selected` / `outfit_used` | `POST /api/outfits/[id]/select` |
| `outfit_feedback_submitted` | `POST /api/outfits/[id]/feedback` |
| `streak_updated` | Cuando `registerStreakAction` cruza un hito |

El resto del catálogo del punto 57 (`signup_started`, `onboarding_started`, `wardrobe_item_add_started`, `wardrobe_category_completed`, `wardrobe_progress_changed`, `outfit_generation_started`, `outfit_rejected`, `points_earned`, `mission_*`, `reward_*`, `referral_*`, `product_*`, `purchase_completed`, `review_submitted`) ya está tipado en `AnalyticsEventName` para que P1/P2 sólo tengan que agregar el `track(...)` donde corresponda, sin re-diseñar el modelo.

## Métricas objetivo (punto 58)

North star: **Daily Outfit Users** (usuarios que generan + seleccionan un outfit en el día — se puede derivar de `outfit_generated` + `outfit_selected` con `userId` y fecha). El resto de las métricas del punto 58 (activación, retención D1/D7/D30, satisfacción de outfits, distribución de rachas) se calculan sobre esta misma tabla de eventos + `points_ledger` + `streaks`, sin necesitar un warehouse separado en el MVP.

## Best-effort, nunca bloquea el flujo principal

`track()` atrapa sus propios errores (ver el `try/catch` en `analytics.service.ts`): si falla el insert de analytics, la acción de producto (agregar prenda, seleccionar outfit) igual se completa. Analytics nunca puede romper la experiencia principal.
