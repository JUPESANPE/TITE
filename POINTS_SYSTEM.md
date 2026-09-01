# TITE — Sistema de Points

Código: `src/domain/points/*` (puro, testeado con `node --test`) + `src/data/repositories/points.repository.ts` (persistencia).

## Principio (punto 41-42)

`tite_points` es un sistema interno de fidelización — no blockchain, no crypto, no wallet, no transferible entre usuarios. Cada recompensa tiene que comprar un comportamiento valioso (activación, armario, uso diario, feedback, rachas — ver categorías del punto 43).

## Ledger como fuente de verdad (punto 45)

Nunca se hace `user.points += 10` directo. Todo pasa por `points_ledger` (append-only) + `points_balances` (proyección), en una única transacción (`awardPoints` en `points.repository.ts`):

```ts
prisma.$transaction([
  prisma.pointsLedgerEntry.create({ ... }),
  prisma.pointsBalance.upsert({ ... , update: { total: { increment: amount } } }),
]);
```

Si algo necesita auditarse ("¿por qué tengo estos Points?"), `points_ledger` tiene el historial completo con `actionType`, `source`, `referenceId` y `metadata`.

## Anti-farming (punto 46, mecanismo real)

El constraint único `(userId, actionType, referenceId)` en `points_ledger` (ver `DATA_MODEL.md`) es lo que impide duplicar Points — no una validación de aplicación que se pueda saltear con una race condition. `awardPoints` intenta el insert; si la DB devuelve `P2002` (unique violation), se interpreta como "ya premiado", no como error.

`referenceId` se elige distinto según qué se quiere limitar:

| Acción | `referenceId` | Efecto |
|---|---|---|
| `GARMENT_ADDED` | id de la prenda | Una vez por prenda, nunca por re-subida. |
| `OUTFIT_GENERATED` / `OUTFIT_SELECTED` | fecha del día (`dailyReferenceId`) | Máximo una vez por día, sin importar cuántas veces se genere/seleccione. |
| `OUTFIT_FEEDBACK_GIVEN` | id del outfit | Una vez por outfit. |
| `CATEGORY_*_COMPLETED` / `WARDROBE_100_COMPLETED` | `wardrobe-{milestone}` | Una vez por hito de completitud, aunque se agreguen y borren prendas. |
| `STREAK_MILESTONE` | `streak-{milestone}` | Una vez por hito de racha (3/7/14/30). |
| `ACCOUNT_CREATED` | `"signup"` | Una única vez en la vida del usuario. |

## Montos P0 (punto 44 — no todas las recompensas del brief, sólo lo que el MVP necesita)

Ver `POINTS_TABLE` en `src/domain/points/points-engine.ts`. El resto de las categorías del punto 43 (missions, rewards, referrals, commerce, reviews, research) ya tienen su lugar reservado en el enum `PointsActionType` de Prisma, listas para activarse en P1+ sin migrar el modelo de nuevo.

## Streaks (punto 47)

`src/domain/points/streaks.ts#computeStreakUpdate` es una función pura: recibe el estado actual + la fecha de la acción, devuelve el nuevo estado. Reglas:

- La racha se mantiene con una **acción significativa**: seleccionar/confirmar el outfit del día (`POST /api/outfits/[id]/select`), nunca por sólo abrir la app.
- Misma fecha (UTC, `YYYY-MM-DD`) que la última acción → no incrementa (`alreadyCountedToday: true`), evita farming por múltiples selects el mismo día.
- Día siguiente exacto → incrementa.
- Salto de un día o más → resetea a 1 (conserva `longestCount` como récord histórico).
- Hitos en 3/7/14/30 días otorgan Points extra (`streakMilestoneAmount`).

## Wardrobe completeness (punto 23, ligado a Points)

`src/domain/wardrobe/progress.ts#crossedCompletionMilestone` compara el % antes/después de agregar una prenda y devuelve el mayor hito cruzado (25/50/75/100) una sola vez — no se puede farmear agregando y borrando la misma prenda repetidamente porque el `referenceId` del Points es el hito (`wardrobe-50`, etc.), no la prenda.
