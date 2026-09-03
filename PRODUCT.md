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
- **Tipografía:** Outfit para display y wordmark, Karla para cuerpo. Se abandonó Inter deliberadamente — ver `BRAND.md`.
- **Superficie:** el módulo principal de la Home y el zócalo de la barra inferior apoyan sobre madera (`wood.700`), no sobre papel. Es lo que le da identidad propia a la app.
- **Moneda:** los tokens de TITE se llaman **Hilitos**. Ver `POINTS_SYSTEM.md`.
- **Tono visual:** fashion, tecnológico, premium, minimalista, joven, cálido. Nada infantil, nada gamer, nada de dashboard corporativo. La gamificación vive en el copy y en momentos puntuales, no convierte a TITE en un juego.
- **Mobile first:** barra inferior fija de cinco slots con botón central, sidebar en desktop/tablet. Ver `NAVIGATION.md`.

Detalle completo de identidad en [`BRAND.md`](./BRAND.md), de la pantalla principal en [`HOME.md`](./HOME.md) y de la navegación en [`NAVIGATION.md`](./NAVIGATION.md).

## Modelo de negocio

Gratis para el usuario, siempre. No hay paywall ni suscripción. El objetivo es maximizar usuarios activos diarios y monetizar del lado de las marcas. El modelo (P2+) es B2B + commerce: afiliación, comisión por venta, misiones y contenido pago, research pago, y **eventos de moda con marcas** como línea propia. Ver `ROADMAP.md`.

**Regla de atribución.** La palabra "Patrocinado" no aparece en la aplicación. La relación comercial se comunica como crédito editorial — `Con Vitamina · Por tus talles y tu estilo minimalista` — que nombra a la marca sin gritar. Va siempre acompañada de la línea de *por qué te lo mostramos*, que es el mecanismo de confianza real. Mantener alguna forma de atribución no es preferencia estética: es lo que separa contenido pago de publicidad encubierta.

**Dónde vive lo comercial.** Premios y canje, Tendencias, misiones, encuestas de marca y eventos. Nunca en el camino de decisión: Hoy, selector de ocasión, generación, resultados y el sheet del outfit al azar van sin una sola marca.

Nunca se comparte PII de usuarios con marcas sin consentimiento explícito (ver `SECURITY.md`).

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
