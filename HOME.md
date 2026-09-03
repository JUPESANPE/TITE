# TITE — La Home

La pantalla que sostiene el hábito. Todo lo demás de la app existe para que esta pantalla se abra todos los días.

Referencia estructural: la home de PASITO, adaptada a un modelo distinto. Lo que se toma es la arquitectura —header con moneda, módulo de identidad con contador semanal, tarjetas que se superponen, secciones de contenido, barra inferior con botón central— no la estética.

## Módulos, de arriba hacia abajo

### 1. Header

Sobre madera (`wood.700`), a sangre desde el borde superior, respetando el área segura.

| Posición | Elemento |
|---|---|
| Izquierda | Chip de Hilitos: píldora `paper` con el ícono de carretel en `hilo` y el número en `ink` |
| Centro | Wordmark **TITE** en Outfit 600, tracking 0.12em, mayúsculas, color `bone` |
| Derecha | Campana de notificaciones (línea 1,5px `bone`) y avatar circular de 36px, clickeable, lleva a `/perfil` |

El wordmark va en `bone` y no en el color de la moneda: la marca es calma, la moneda es la que llama la atención.

### 2. Módulo principal

Sigue sobre la misma madera, cerrando abajo con radio 32px. Es la superficie de identidad de TITE.

**Saludo variable.** Cambia según la hora: "Buenos días" hasta las 12, "Buenas tardes" hasta las 20, "Buenas noches" después. Siempre con el nombre: `Buenas tardes, Juan.` En Outfit 22px, color `bone`.

A futuro: mensajes especiales por cumpleaños y por fecha (primer día de frío, cambio de estación). Ver la página de ideas en Notion.

**Clima.** La temperatura en Outfit 34px `bone`, la condición al lado en 15px `wood.100`, y debajo una fila de etiquetas de 10px en mayúsculas separadas por hairlines verticales: `SENSACIÓN 12 · MIN 9 / MAX 18 · LLUVIA 20%`. Un ícono de línea monocromo para la condición. TITE no es una app del clima: el clima es contexto, no protagonista.

**Contador semanal.** Siete círculos, `L M X J V S D`, uno por día. Relleno en `hilo` los días en que el usuario confirmó un outfit; el día de hoy en `bone` y un punto más grande; los días futuros vacíos con hairline. Es el equivalente al contador de pasos de PASITO, pero cuenta decisiones de outfit — que es la north star real.

### 3. Outfits más usados

Tres tarjetas blancas que **se superponen al borde inferior del módulo de madera**, sobresaliendo hacia abajo. Esa superposición es lo que le da profundidad a la pantalla y evita que se lea como dos bloques apilados.

Cada tarjeta: las miniaturas del outfit colgando de un barral corto, el nombre si lo tiene, y abajo una etiqueta de 10px con la cantidad de usos — `USADO 7 VECES`. La tercera tarjeta es un acceso a ver todos, con una flecha.

Reemplaza a los "grupos" de PASITO. La lógica es la misma: mostrar lo que el usuario ya eligió antes, porque es lo que más probablemente vuelva a elegir.

### 4. Encuesta del día

Una tarjeta que **desaparece una vez completada**. Dos preguntas encadenadas, sin fricción:

1. **"¿Cómo te sentís hoy?"** — cuatro opciones con íconos de línea, un toque.
2. **"¿Para qué outfit estás?"** — las cinco ocasiones: Casual, Cómodo, Formal, Entrenamiento, Salir.

La segunda alimenta directamente la generación del outfit: al responderla, el usuario ya eligió ocasión sin pasar por el selector. La primera es dato de producto — el ánimo correlaciona con el tipo de outfit elegido y es de lo más valioso que podemos aprender.

Al completarse, la tarjeta se reemplaza por el resultado y no vuelve a aparecer hasta el día siguiente. Ocupa el lugar que en PASITO ocupan los desafíos destacados.

### 5. Eventos

Sección de eventos de moda, abajo de todo. Es una línea de negocio: ver la página de eventos en Notion.

Va al final a propósito. Alguien que abre la app apurado a la mañana para vestirse no tiene que tropezarse con un evento.

## Reglas de la Home

- Cero contenido de marca en el módulo de madera y en la encuesta del día. La única superficie comercial de esta pantalla es Eventos.
- Una sola acción primaria.
- El balance de Hilitos nunca es un contador grande: es el chip del header.
- De abrir la app a tener un outfit: **dos toques**. Uno en la ocasión de la encuesta, otro en el outfit.

## Estado en el código

La Home actual (`src/app/(app)/home/page.tsx`) implementa saludo, clima, selector de ocasión y CTA sobre fondo papel. Falta: el header completo, la superficie de madera, el contador semanal, los outfits más usados, la encuesta del día y los eventos. Ninguno de esos módulos está construido todavía — este documento es la especificación, no una descripción de lo que hay.
