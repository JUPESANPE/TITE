# TITE — Outfit Engine

Código: `src/domain/outfit/*`. Tests reales: `tests/unit/outfit-engine.test.ts` (corridos con `node --test`, ver `ARCHITECTURE.md`).

## Regla absoluta (punto 34)

**TITE no inventa ropa.** El engine es una función pura que recibe `wardrobe: Garment[]` (las prendas reales del usuario) y sólo puede componer outfits con esos ids. Si no hay categorías suficientes, lanza `OutfitEngineError` con las categorías faltantes en vez de devolver una combinación vacía o inventada.

## Pipeline (punto 32)

```
RULES (categoría -> rol de outfit) → FILTERING (top-K por rol, según score individual)
→ SCORING (combinación completa) → (AI opcional, no implementado en P0) → RESULT (top N)
```

1. **Rules**: `CATEGORY_TO_ROLE` mapea cada categoría de prenda a un rol (`TOP`, `BOTTOM`, `FOOTWEAR`, `OUTERWEAR`, `ACCESSORY`, `DRESS`). `OTROS` no participa.
2. **Filtering**: por cada rol se calcula un score individual (`itemScore`) y se toman los mejores `TOP_K_PER_ROLE` (4) candidatos — así la combinatoria no explota con armarios grandes (punto 67, costo).
3. **Scoring de combinación**: se arma el producto cartesiano de los candidatos filtrados (típicamente unas pocas decenas de combos, no miles) y se puntúa cada combo completo.
4. **Result**: se ordenan por score, se filtran duplicados y las combinaciones ya mostradas (`excludedCombinations`), se devuelven las mejores `count` (2 en el flujo normal, 1 para "otra opción").

## Composición de un outfit (punto 30)

- Básico: `TOP + BOTTOM + FOOTWEAR`, o `DRESS + FOOTWEAR` (el vestido reemplaza top+bottom).
- `OUTERWEAR` se agrega automáticamente si `neededWarmth(clima) >= 4` y hay campera disponible.
- `ACCESSORY` queda modelado en el dominio pero no se agrega automáticamente en P0 (ver ROADMAP P1).

## Scoring (punto 33)

Factores por **item individual** (`ITEM_WEIGHTS`):

| Factor | Peso | Qué mide |
|---|---|---|
| `weatherFit` | 0.45 | Qué tan cerca está `warmth` del abrigo que pide el clima de hoy. |
| `occasionFit` | 0.20 | Qué tan cerca está `formality` del rango esperado por la ocasión. |
| `styleFit` | 0.15 | Overlap entre `styles` de la prenda y `stylePreferences` del perfil. |
| `preferenceFit` | 0.20 | Bonus/penalización por color/marca favorita o evitada. |

Clima y ocasión pesan más que estilo/preferencia a propósito: son restricciones objetivas del día, el resto personaliza dentro de lo apropiado (ver el bug real que este balance corrigió, abajo). También se resta `recentWearPenalty` (usar de nuevo algo recién usado, no es "estar sucio" — ver `PRODUCT.md` punto 21).

Factores de **combinación completa** (`COMBO_WEIGHTS`): `itemAverage` (0.6), `colorHarmony` (0.2), `varietyScore` (0.1, penaliza repetir exactamente lo ya mostrado), `historicalFeedbackFit` (0.1, aprendizaje simple a partir de feedback pasado sobre prendas parecidas).

Los scores son internos — no se muestran al usuario (punto 33), sólo alimentan el orden y la explicación breve (punto 36).

## "Otra opción" (punto 35)

`generateAlternative(input, alreadyShown)` vuelve a correr el engine excluyendo (por comparación de sets de ids, no de orden) todas las combinaciones ya mostradas en la sesión — nunca repite exactamente lo mismo si hay una alternativa real disponible.

## Bug real encontrado y corregido durante el desarrollo

El primer set de pesos (`weather: 0.35, style: 0.2`) hacía que, en clima muy frío, una prenda liviana con match perfecto de estilo le ganara a una prenda más abrigada sin match de estilo — mal para el producto (el usuario pasaría frío). El test `"clima frío prioriza prendas más abrigadas"` lo detectó corriendo de verdad (`node --test`); se subió el peso de `weatherFit` a 0.45 y se bajó `styleFit` a 0.15. Ver el commit correspondiente para el detalle.

## Fallbacks (punto 65)

- **AI falla / no hay AI**: el pipeline funciona 100% sin AI (rules+filtering+scoring son determinísticos). AI queda como paso opcional futuro sobre los candidatos ya reducidos, no como dependencia dura.
- **Outfit imposible**: `OutfitEngineError.missingCategories` le dice a la UI exactamente qué falta (ej: `["FOOTWEAR"]`) para mostrar "te falta cargar calzado" en vez de un error genérico.
- **Pocas prendas**: con el mínimo viable (2 tops, 2 bottoms, 1 calzado — ver `PRODUCT.md` punto 24) ya alcanza para generar; no hace falta el armario completo.
