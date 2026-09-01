# TITE — Producto

## Qué es

TITE responde una sola pregunta: **¿qué me pongo hoy?**

TITE = Asistente personal de estilo + Armario digital + Motor de outfits + Sistema de recompensas + Descubrimiento de ropa.

Visión de largo plazo: el sistema operativo del armario personal. Pero el MVP resuelve una sola necesidad extraordinariamente bien: que abrir TITE reemplace a pararse frente al placard sin saber qué ponerse.

## North star métrica

**Daily Outfit Users** (usuarios que generan y seleccionan un outfit ese día).

Todo lo demás (armario, clima, puntos, rachas) existe para sostener esa métrica.

## Objetivo del MVP

Generar el hábito de abrir TITE antes de vestirse. La pregunta que el MVP tiene que responder con datos reales es: **¿la gente vuelve a TITE para decidir qué ponerse?**

Prioridad de optimización: activación → primer outfit → utilidad → personalización → hábito → retención. Recién después, monetización.

## Principios de producto

Ante cualquier feature nueva, en este orden:

1. ¿Ayuda a decidir qué ponerse?
2. ¿Reduce fricción?
3. ¿Mejora las recomendaciones?
4. ¿Personaliza TITE?
5. ¿Genera hábito?
6. ¿Obtiene información útil con consentimiento?
7. ¿Genera valor comercial futuro?

Nunca se sacrifican los primeros cinco solo por el séptimo.

## Idioma y tono

Español rioplatense natural, cercano, nunca corporativo ni robótico. Copy centralizado en `src/copy/es-AR.ts` para permitir internacionalización futura sin tocar componentes.

## Identidad

- **Nombre:** TITE — de "¿qué me pongo?".
- **Isotipo:** percha minimalista cuyo gancho sugiere un signo de pregunta. Sin sol, nubes, lluvia, placares ni prendas dentro del isotipo.
- **Tono visual:** fashion, tecnológico, premium, minimalista, joven, cálido. Nada infantil, nada gamer, nada de dashboard corporativo. La gamificación vive en el copy y en momentos puntuales, no convierte a TITE en un juego.
- **Mobile first:** navegación inferior en mobile, sidebar en desktop/tablet. Ver `ARCHITECTURE.md`.

## Modelo de negocio

Gratis para el usuario en el MVP. No hay paywall ni suscripción en P0-P1. El modelo futuro (P2+) es B2B + commerce: afiliación, comisión por venta, sponsored placements/missions, research pago. Ver `ROADMAP.md`.

Regla de confianza: todo lo patrocinado se marca como tal. Nunca se vende "mejor producto para vos" sin disclosure, y no se comparte PII de usuarios con marcas sin consentimiento explícito (ver `SECURITY.md`).

## Flujo principal (golden path)

```
Descubre TITE → Crea cuenta → Onboarding corto → TITE conoce estilo básico
→ Agrega primeras prendas → TITE clasifica → Usuario confirma → Armario crece
→ Points → Progreso → Alcanza mínimo viable → "Ya podemos armarte tu primer look"
→ TITE obtiene clima → Usuario elige ocasión → TITE genera 2 outfits
→ Usuario selecciona ("Me pongo este") → Points + Racha
→ Más tarde: "¿Cómo te sentiste?" → Feedback → Points → TITE aprende → vuelve mañana
```

## Flywheel

Carga de armario → TITE conoce la ropa → recomienda → usuario elige → usa → califica →
TITE aprende → usuario gana Points → vuelve → mejores recomendaciones → más confianza →
(futuro) descubre productos → compra → review → más aprendizaje.

## Alcance del MVP (P0) vs. después

Ver desglose completo de fases en `ROADMAP.md`. Regla dura: no se prioriza suscripción, paywall, crypto, marketplace gigante, red social, chat, gestión de lavado ni publicidad invasiva hasta validar el hábito.
