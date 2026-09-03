# TITE — Identidad

Este documento define la identidad visual y verbal de TITE. Es la fuente de verdad de marca; `tailwind.config.ts` implementa sus tokens y `src/copy/es-AR.ts` su voz.

## El problema que resuelve

La primera versión del sistema visual era correcta pero anónima: fondo blanco, Inter en todo, un acento terracota. Funcionaba y no ofendía a nadie, que es exactamente el problema — se parecía a cualquier app generada por defecto. Esta revisión le da a TITE una superficie propia y reconocible sin abandonar el minimalismo.

Dos decisiones cargan casi todo el peso: **la madera** y **la tipografía**.

## Nombre y voz

**TITE** viene de "¿qué me pongo?". El isotipo es una percha cuyo gancho insinúa un signo de pregunta. No lleva sol, nubes, lluvia, placares ni prendas adentro.

Español rioplatense natural, con voseo. Cercano, nunca corporativo ni robótico. El copy vive centralizado en `src/copy/es-AR.ts`.

## Tipografía

| Rol | Fuente | Uso |
|---|---|---|
| Display | **Outfit** | Wordmark, títulos de pantalla, números grandes, saludo |
| Cuerpo | **Karla** | Todo el texto de interfaz, labels, botones |

Outfit es geométrica y con carácter, y se llama igual que el objeto central del producto. Karla es humanista y cálida: es lo que le saca a la interfaz el aire de dashboard. Ambas están en Google Fonts y en el catálogo de Stitch.

Se abandona Inter deliberadamente. Es una excelente fuente de UI y es, también, la fuente por defecto de casi todo lo generado automáticamente: usarla costaba identidad.

**Escala** (los tamaños no cambian respecto de P0):

| Nivel | Tamaño / peso | Tracking |
|---|---|---|
| Display | 40px / 600 | -0.02em |
| Título de pantalla | 20px / 600 | -0.02em |
| Pregunta | 22px / 600 | -0.02em |
| Sección | 17px / 500 | -0.01em |
| Cuerpo | 14px / 400 | 0 |
| Menor | 13px / 400 | 0 |
| Etiqueta | 10px / 500 mayúsculas | 0.08em |

La etiqueta de 10px en mayúsculas con tracking es la tipografía de una etiqueta cosida dentro de una prenda. Es el recurso que resuelve la densidad de metadata sin agregar íconos: `REMERA · NEGRO · ABRIGO 1/5`.

## Color

### Base (no cambia)

| Token | Hex | Rol |
|---|---|---|
| `paper` | `#FAF7F3` | Fondo de la app. Papel cálido, nunca blanco puro |
| `paper.raised` | `#FFFFFF` | Cards y superficies |
| `ink` | `#141110` | Texto principal y botón primario |
| `ink.soft` | `#3A3532` | Texto secundario |
| `line` | `#E7E0D8` | Hairlines y divisores |
| `clay.500` | `#C97A55` | Acento único: barras de progreso, chip activo, marca de percha |

### Madera (nuevo)

La superficie de identidad. El módulo principal de la Home apoya sobre madera, no sobre papel: es lo que hace que abrir TITE se sienta distinto a abrir cualquier otra app.

| Token | Hex | Rol |
|---|---|---|
| `wood.900` | `#2E211A` | Sombra y profundidad sobre madera |
| `wood.700` | `#4E3828` | **Fondo del módulo principal.** Nogal profundo |
| `wood.500` | `#6E5138` | Superficies secundarias sobre madera |
| `wood.300` | `#A9855F` | Molduras, líneas sobre madera |
| `wood.100` | `#E6D9C7` | Texto atenuado sobre madera |
| `bone` | `#F7F1E8` | Texto y wordmark sobre madera |

Contraste de `bone` sobre `wood.700`: suficiente para texto pequeño.

### Moneda (nuevo)

| Token | Hex | Rol |
|---|---|---|
| `hilo` | `#E0A02E` | Ocre de los Hilitos |

Es la única excepción a la regla de un solo acento, y está justificada: la moneda necesita un color propio para que se reconozca de un vistazo, igual que el lima de PASITO sobre su verde. Se usa **sólo** en el ícono de Hilitos, en el número de Hilitos cuando está sobre madera, y en el anillo del contador semanal. En ningún otro lado.

### Semánticos

`success #3E7A5C` · `warning #C98A2B` · `danger #B5473A`. Sólo para estado, nunca decorativos.

## Reglas duras

- Sin emoji, en ningún lado.
- Íconos de línea, trazo 1,5px, monocromos, nunca rellenos.
- Sin gradientes, sin glassmorphism, sin neón.
- Una sola acción primaria por pantalla: botón de ancho completo, fondo `ink`, texto `paper`, radio 20px, alto 52px.
- Una sola sombra en el sistema: `0 8px 24px rgba(20,17,16,0.06)`, sólo en cards flotantes.
- Nunca se muestran scores ni porcentajes de coincidencia: son internos.
- Nunca se dice "inteligencia artificial" en la interfaz.

## Forma y profundidad

Cards radio 28px. Botones e inputs radio 20px. Chips como píldoras completas con borde de 1px. Targets táctiles de 44px mínimo. Las tiles de la grilla de armario llevan hairline y cero sombra: se leen como pila de ropa doblada.

## El guiño al ropero

Tres recursos, usados con moderación. Si se usan más, el minimalismo se cae.

1. **El barral.** Los grupos de prendas y outfits cuelgan de una línea horizontal de 1px, con un tick vertical de 6px sobre cada card.
2. **La madera.** El módulo principal de la Home y el zócalo de la barra inferior.
3. **El zócalo.** La barra de navegación tiene una moldura en el borde superior — una línea de 2px en `wood.300` y otra de 1px separadas por 3px — y una franja de madera de 4px en el borde inferior. Es la base de un mueble, no un chrome de sistema.

Las fotos de prenda apoyan sobre el fondo con una sombra suave sólo en el borde inferior, como tela que descansa.

## Los Hilitos

La moneda de TITE se llama **Hilitos**. Ver `POINTS_SYSTEM.md` para la mecánica y `src/copy/es-AR.ts` para el string, que está centralizado: cambiar el nombre es una línea.

El ícono es un carretel de hilo de frente: rectángulo de bordes redondeados con dos muescas laterales y tres vueltas de hilo insinuadas, trazo de 1,5px. A 16px se lee como una forma compacta redondeada, que es lo que necesita el chip del header.

## Atribución comercial

La palabra "Patrocinado" no aparece en la aplicación. La relación comercial se comunica con una fórmula de crédito editorial:

> **Con Vitamina** · Por tus talles y tu estilo minimalista

Nombra a la marca sin gritar, y va siempre acompañada de la línea de *por qué te lo mostramos*, que es el mecanismo de confianza real. Mantener alguna forma de atribución no es una preferencia estética: es lo que separa contenido pago de publicidad encubierta. Antes de eliminar toda atribución conviene una consulta legal.

## Qué NO cambió

Los tamaños tipográficos, los radios, las sombras, los targets táctiles y la paleta base son los mismos de P0. Esta revisión agrega una superficie de identidad y cambia las fuentes; no rehace el sistema.
