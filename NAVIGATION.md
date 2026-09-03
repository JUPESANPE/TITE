# TITE — Navegación

La barra inferior es **fija en todas las pantallas**, no sólo en la Home.

## Los cinco slots

De izquierda a derecha:

| Slot | Nombre | Ícono | Destino |
|---|---|---|---|
| 1 | **Hoy** | Variable según el clima: sol, nublado, lluvia, luna | `/home` |
| 2 | **Pilcha** | Frente de ropero: rectángulo con línea vertical central y dos tiradores | `/wardrobe` |
| 3 | — | **Isotipo de TITE**, sin leyenda | Genera un outfit al azar |
| 4 | **Tendencias** | Revista abierta con línea de pliegue | `/tendencias` |
| 5 | **Premios** | Moño o regalo | `/premios` |

Los cuatro slots con leyenda usan íconos de línea de 1,5px y label de 11px. El activo va en `ink`, los inactivos en `ink.soft`.

### El ícono de "Hoy" cambia con el día

Sol si está despejado, nube si está nublado, gotas si llueve, luna si es de noche. Sale del mismo dato de clima que ya consume la Home, así que no agrega ninguna llamada. Es un detalle chico que hace que la app se sienta viva.

### El botón central

Círculo de 68px, relleno `ink`, centrado sobre el slot 3. **Sobresale hacia arriba**: el centro del círculo se apoya exactamente sobre el borde superior de la barra, así que la mitad del botón invade el contenido. Lleva un anillo de 4px en `paper` que funciona como recorte, y la percha en `paper` con trazo de 2px.

No lleva leyenda. Es el único slot sin texto, y esa ausencia es deliberada: el isotipo tiene que sostenerse solo.

Un toque genera un outfit al azar y abre el sheet "Sorprendeme". Ver `OUTFIT_ENGINE.md` para lo que hace falta en el motor — hoy es determinístico y devolvería siempre lo mismo.

## La forma de la barra: el zócalo

La barra es la base de un mueble, no un chrome de sistema.

- Alto 64px, fondo `paper.raised`, esquinas superiores con radio 24px
- **Moldura en el borde superior**: una línea de 2px en `wood.300` y otra de 1px, separadas por 3px, corriendo a lo ancho. Es el perfil de la moldura de un ropero
- **Franja de madera de 4px** en el borde inferior, en `wood.500`, como el zócalo que separa el mueble del piso
- Sin sombra propia. La única sombra de la barra es la del botón central

Es el segundo lugar de la app donde aparece la madera, y junto con el módulo de la Home construye la identidad: TITE tiene piso y techo de madera, y el contenido vive en el medio, sobre papel.

## Nombres

**Pilcha** es rioplatense y es exactamente lo que hay ahí adentro. **Premios** es provisorio: quedaron sobre la mesa Vidriera, Bazar y El Perchero. Los strings están centralizados en `src/copy/es-AR.ts`.

## Qué cambió respecto de P0

El código actual (`src/components/layout/AppNav.tsx`) tiene cuatro tabs — Hoy, Armario, Outfit, Favoritos — con emoji como íconos, y sólo se monta dentro del layout de `(app)`. La estructura nueva reemplaza "Armario" por "Pilcha", saca "Outfit" de la barra (pasa a ser el botón central), agrega "Tendencias", renombra "Favoritos" y lo absorbe dentro de Pilcha o Premios según se decida, y elimina todos los emoji.

Ese refactor **todavía no está hecho en el código**. Este documento es la especificación acordada; la implementación espera a que el diseño esté aprobado en Stitch.
