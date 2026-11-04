# Integración de sprites — Niveles 2 y 4

Este documento refleja los archivos PNG que están realmente presentes en `Assets/Sprites/`. No se crean recursos ficticios ni se renombran imágenes de origen.

## Nivel 2 — Jugador cenital

Ruta: `Nivel 2/Jugador/`

- 8 sprites estáticos de dirección: `east.png`, `north.png`, `north-east.png`, `north-west.png`, `south.png`, `south-east.png`, `south-west.png` y `west.png`.
- Animación de movimiento en `animaciones/Walking/`.
- Cada una de las 8 direcciones tiene 8 cuadros, `frame_000.png` a `frame_007.png`.
- Las diagonales están incluidas como direcciones independientes; no hace falta simularlas espejando una dirección cardinal.
- El cargador del Nivel 2 ya apunta a los 8 sprites quietos y recorre los 8 cuadros de la animación según la dirección real del movimiento, incluidas las diagonales.
- Se mantiene el SVG original como segunda capa de respaldo.

Los NPC del Nivel 2 están en `Nivel 2/Npcs/`.

El código del Nivel 2 utiliza estas rutas desde `Codigo/CSS/Nivel 2/nivelDos.css` y `Codigo/JavaScript/Nivel 2/mapaMovimiento.js`.

## Nivel 4 — Jugador a pie

Ruta: `Nivel 4/Jugador/`

- Quieto: derecha e izquierda.
- Corriendo: 3 cuadros por lado.
- Saltando: derecha e izquierda.
- Cayendo: derecha e izquierda.

El Nivel 4 ya carga estos archivos con sus nombres reales y anima los tres cuadros de carrera de cada lado.

## Nivel 4 — Guardia a pie

Ruta: `Nivel 4/Guardia/`

- Quieto: derecha e izquierda.
- Corriendo: 3 cuadros por lado.
- Saltando y cayendo: ambos lados.
- Sentado: derecha e izquierda.

## Nivel 4 — Caballo solo

Ruta: `Nivel 4/Caballo/`

- Disponible: `Caballo quieto.png`.
- Pendiente: trote, galope, salto y caída. No se inventan cuadros que todavía no fueron entregados.

## Nivel 4 — Guardia montado y jugador montado

Rutas:
- `Nivel 4/Monturas/Guardia/`
- `Nivel 4/Monturas/Jugador/`

Son composiciones completas de caballo + jinete:
- Quieto: derecha e izquierda.
- Correr: 6 cuadros por lado.
- Saltar: 2 cuadros por lado.
- Caer: 1 cuadro por lado.

El cargador del Nivel 4 utiliza las composiciones y anima los 6 cuadros de carrera por lado, además de salto y caída. No separar el caballo del jinete ni combinar estas imágenes con las del caballo solo: cada archivo montado ya representa la composición completa.

## Peligros del Nivel 4

Ruta: `Nivel 4/Peligros/`

- `Pinchos.png`
- `Fogata.png`
- `Fogata 2.png`

## Convenciones y compatibilidad

- Mantener los nombres exactos de los archivos, incluidos espacios y mayúsculas.
- No modificar hitboxes, física ni tamaño lógico de los personajes para adaptar el dibujo.
- Si falta un recurso o falla su carga, mantener el dibujo de respaldo actual.
- El manifiesto `manifest.json` contiene el inventario legible por máquina.
- La integración de archivos en la carpeta no implica que una animación esté activada en el código de juego; el cargador de cada nivel debe apuntar a estas rutas y conservar su fallback.
