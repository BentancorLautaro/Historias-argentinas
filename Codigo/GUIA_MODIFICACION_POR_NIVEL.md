# Guía de modificación por nivel y sección

Esta guía está pensada para desarrolladores y futuras IA. **Antes de cambiar código, leer primero `README.md`, `README_MODULARIZACION.md`, `MODULARIZACION.md` y esta guía.** No reemplazar módulos completos ni mover lógica entre archivos sin necesidad. Hacer cambios pequeños y conservar las APIs existentes.

## Estructura y reglas

- `index.html`: punto de entrada; carga las secciones y los módulos JavaScript.
- `secciones/`: HTML de cada pantalla. Cambiar aquí estructura, títulos, botones y contenedores; no colocar lógica compleja.
- `css/`: estilos visuales. Cambiar aquí tamaños, posiciones, colores, fuentes y adaptación a pantallas.
- `js/`: lógica del juego separada por responsabilidades.
- `Assets/`: imágenes, audios, mapas y documentos.
- El proyecto usa módulos ES (`import`/`export`) y `fetch` para cargar fragmentos. Ejecutar mediante servidor local (por ejemplo, XAMPP), no abriendo `index.html` directamente con `file://`.
- Tras cambios, comprobar la consola del navegador, ejecutar `node --check` en los JS modificados y probar el flujo real.
- No cambiar IDs/clases usados por JavaScript sin actualizar todas sus referencias.

## Menú, niveles y configuración

| Aspecto | Archivo principal | Qué cambiar |
|---|---|---|
| Pantalla de inicio y botones | `secciones/menu-principal.html` | Texto, orden y estructura del menú |
| Tarjetas y disponibilidad de niveles | `secciones/seleccion-niveles.html`, `js/menu.js` | Diseño de tarjetas y comportamiento de selección |
| Número de niveles y límites | `js/configuracion.js` | `NIVEL_MINIMO`, `NIVEL_MAXIMO` y constantes relacionadas |
| Progreso/desbloqueo guardado | `js/persistencia.js` | Lectura/escritura de `localStorage`; tener cuidado con partidas existentes |
| Pantalla de configuración | `secciones/pantallas-secundarias.html` | Controles visibles y panel secreto de testing |
| Estilos de configuración | `css/configuracion.css` | Posición, tamaño y aspecto de los controles |
| Lógica del menú/configuración y código secreto | `js/menu.js` | Eventos, validación del código 1010 y desbloqueo de niveles |
| Volumen y efectos | `js/ajustes.js`, `js/audio.js` | Controles de sonido y reproducción |
| Estilos globales y pantallas | `css/base.css`, `css/estilos.css`, `css/responsive.css` | Reglas compartidas y adaptación responsive |

## Capítulo 1 — El diario de Facundo

El capítulo está coordinado por `js/nivelUno.js`. Evitar concentrar allí la lógica de diarios, preguntas y tablero: cada parte tiene su propio módulo.

| Sección / aspecto | Archivo(s) | Qué modificar |
|---|---|---|
| Estructura visual del capítulo | `secciones/nivel-uno.html` | Contenedores, botones, títulos y zonas del juego |
| Textos, artículos, frases clave y fuentes de los diarios | `js/datosNivelUno.js` | Contenido de cada diario y frases que se deben encontrar |
| Lectura, marcado y recolección de frases | `js/diarios.js` | Comportamiento al abrir/leer diarios y recolectar claves |
| Preguntas y respuestas | `js/datosNivelUno.js` (`preguntasNivelUno`) | Enunciados, opciones, respuesta correcta y explicación |
| Lógica del cuestionario y mezcla de opciones | `js/preguntas.js` | Presentación, validación y avance de preguntas; las opciones se mezclan aquí |
| Grupos, recortes y relación entre diarios | `js/datosNivelUno.js` (`gruposTableroNivelUno`, `recortesTableroNivelUno`) | Qué fragmentos se conectan y de qué fuente provienen |
| Reglas del tablero | `js/tablero.js` | Validación de conexiones y avance; modificar con cuidado porque también se usa en el capítulo 2 |
| Introducciones y orden de las secciones | `js/nivelUno.js`, `js/introducciones.js` | Texto y secuencia de las introducciones previas al cuestionario/tablero |
| Estado y progreso | `js/estadoJuego.js`, `js/persistencia.js` | Datos que se mantienen durante la partida y al recargar |
| Apariencia de diarios | `css/diarios.css`, `css/periodico.css` | Columnas, tipografía, resaltado y diseño de los recortes |
| Apariencia de preguntas/tablero | `css/tablero.css`, `css/juego.css` | Tarjetas, opciones, selección y feedback visual |

**Velocidad en el capítulo 1:** no hay una velocidad principal de personaje como en el mapa del capítulo 2. Si se agrega movimiento a una actividad nueva, guardar su velocidad como constante con nombre en el módulo de esa mecánica, no como número mágico disperso.

## Capítulo 2 — Voces en la Pulpería

El capítulo está coordinado por `js/nivelDos.js`. Los datos de los personajes y las preguntas están separados de las mecánicas de cada personaje.

| Sección / aspecto | Archivo(s) | Qué modificar |
|---|---|---|
| Estructura visual del capítulo | `secciones/nivel-dos.html` | Contenedores del pueblo, interacción, interrogatorio y actividades |
| Datos y presentación de personajes, pistas, preguntas y recortes | `js/datosNivelDos.js` | Texto de cada personaje, pistas, datos de mecánica y contenido educativo |
| Movimiento por el pueblo, colisiones y cercanía para interactuar | `js/mapaMovimiento.js` | Velocidad del jugador, zoom, radio de interacción, teclas y límites del mapa |
| **Velocidad del jugador del pueblo** | `js/mapaMovimiento.js` | Constante `VELOCIDAD_PX_POR_SEG` (actualmente `340` píxeles por segundo) |
| **Distancia para interactuar** | `js/mapaMovimiento.js` | Constante `RADIO_INTERACCION_PX` (actualmente `90` píxeles) |
| Zoom del mundo/cámara | `js/mapaMovimiento.js` | Constantes `ZOOM_MUNDO` y `ZOOM_CAMARA` |
| Colisiones del pueblo e interior | `js/mapaMovimiento.js` | Arrays `COLISIONES_MUNDO` y `COLISIONES_INTERIOR`; ajustar con cuidado para que coincidan con el mapa gráfico |
| Interrogatorios, diálogos y apertura de cada minijuego | `js/interrogatorio.js` | Secuencia de personajes, modal de introducción, instanciación de mecánicas y entrega de pistas |
| Introducciones generales, cuestionario y tablero | `js/nivelDos.js`, `js/introducciones.js` | Texto y orden de los avisos entre etapas |
| Preguntas del capítulo | `js/datosNivelDos.js` (`preguntasNivelDos`) | Enunciados, opciones, respuestas y explicaciones |
| Tablero de versiones | `js/datosNivelDos.js` (`gruposTableroNivelDos`, `recortesTableroNivelDos`), `js/tablero.js` | Evidencias que se relacionan y validación de las conexiones |
| Estado del capítulo | `js/estadoNivelDos.js`, `js/persistencia.js` | Progreso, pistas y restauración al recargar |
| Estilos del pueblo y minijuegos | `css/nivelDos.css`, `css/juego.css`, `css/tablero.css` | Diseño, tamaños, posiciones y estados visuales |

### Minijuegos del capítulo 2: archivo y variables útiles

| Personaje / mecánica | Archivo | Variables o zonas importantes |
|---|---|---|
| Rastreador — encontrar y leer hojas/pistas en el mapa | `js/mecanicaRastreador.js` | `POSICIONES_HOJAS` define posiciones iniciales; el método `iniciar`/la lógica de movimiento y detección gestiona las interacciones. Revisar el archivo completo antes de cambiar distancias o detección. |
| Gaucho malo — infiltración y documentos | `js/mecanicaGauchoMalo.js` | `intervaloMovimiento = 145` limita la frecuencia de movimiento del jugador (ms); `setInterval(..., 420)` controla el primer ritmo de movimiento de guardias; `Math.max(280, 420 - this.actual * 60)` acelera guardias en tramos posteriores; `this.cols = 9`, `this.rows = 8`; `this.mapas` contiene paredes, documentos y rutas de guardias. |
| Cantor — contrapunto de cartas | `js/mecanicaCantor.js` | `this.vidaInicial = datos.vidaInicial || 20`; ajustar preferentemente `vidaInicial` en `js/datosNivelDos.js`. `TIPOS_ATAQUE`, `TIPOS_DEFENSA` y `DEFENSAS_EFICACES` relacionan estilos de cartas y respuestas eficaces. El daño y los turnos se calculan en los métodos de esta clase. |
| Baqueano — preguntas al informante | `js/mecanicaBaqueano.js` | `bifurcaciones` contiene preguntas, opciones, respuesta y pista; los tiempos de feedback se controlan con `setTimeout` (1250/1200 ms). |
| Personajes y parámetros propios de las mecánicas | `js/datosNivelDos.js` | Buscar `tipoMecanica`, `datosMecanica`, `vidaInicial`, `instruccion`, `pistas` y `situaciones`. Siempre que sea posible, cambiar datos aquí en vez de alterar la lógica común. |
| Estilo de cada mecánica | `css/nivelDos.css` y reglas específicas de la mecánica | Buscar las clases CSS que aparecen en el HTML generado por el archivo de la mecánica; no cambiar nombres de clase sin revisar CSS y selectores. |

> Los nombres de personajes pueden cambiar o crecer. Para saber qué mecánica usa cada uno, revisar `personajesNivelDos` en `js/datosNivelDos.js` y el mapeo `CLASES_POR_TIPO_MECANICA` en `js/interrogatorio.js`.

## Introducciones educativas

- `js/introducciones.js`: componente reutilizable del modal de introducción.
- `js/nivelUno.js`: introducción general y textos entre diarios, cuestionario y tablero.
- `js/nivelDos.js`: introducción general del capítulo 2 y textos entre interrogatorio, cuestionario y tablero.
- `js/interrogatorio.js`: presentación específica del personaje y explicación de por qué su mecánica representa su forma de aportar información.

Al agregar un minijuego, explicar en lenguaje simple: (1) quién es el personaje, (2) qué tiene que ver con el problema histórico, (3) por qué la acción del minijuego representa su aporte y (4) qué evidencia debe aprender a reconocer el jugador.

## Acceso secreto de testing

En Configuración, hacer **cinco clics en el título “CONFIGURACION”** para revelar el panel de pruebas. Ingresar el código `1010` y pulsar **DESBLOQUEAR** (también funciona Enter). Esto guarda el nivel 5 como máximo desbloqueado en `localStorage` para que las tarjetas de todos los niveles aparezcan habilitadas en ese navegador.

- Implementación del secreto: `secciones/pantallas-secundarias.html`, `js/menu.js`, `css/configuracion.css`.
- El desbloqueo usa la lógica existente de `guardarNivelDesbloqueado` en `js/persistencia.js`.
- Es un acceso de conveniencia para pruebas locales, **no una medida de seguridad**: el código está en el JavaScript del cliente.
- El progreso de desbloqueo es acumulativo. Activar testing no modifica el guardado de una partida ni cambia por sí solo la lógica de los niveles que todavía no tengan una implementación jugable completa.

## Instrucción recomendada para futuras IA

> Antes de modificar este juego, lee `README.md`, `README_MODULARIZACION.md`, `MODULARIZACION.md` y `GUIA_MODIFICACION_POR_NIVEL.md`. Identifica el módulo exacto responsable de la función solicitada. No reescribas archivos enteros si alcanza con un cambio localizado. Respeta los módulos ES, los IDs/clases usados por JavaScript, la persistencia y el comportamiento existente. No inventes archivos ni variables: inspecciona el código real. Después del cambio, valida la sintaxis de los JS afectados, la integridad del ZIP y explica qué archivos cambiaste y qué pruebas ejecutaste. No afirmes que probaste en navegador si no lo hiciste.


## Ajustes de flujo del Nivel 2 (27/10/2026)
- El capítulo termina al interrogar a los cuatro personajes; el cuestionario final y el tablero de unir recortes ya no forman parte del recorrido.
- La misión de Don Eusebio requiere volver a hablar con él después de reunir los testimonios de Doña Jacinta, Mateo y Tomasa.
- El Cantor ahora muestra una pantalla de derrota al llegar a 0 de Gloria Criolla y permite reintentar.
- Los textos previos a cada minijuego amplían el contexto histórico del personaje y explican la relación entre su rol, el desafío y la investigación.

## Sprites de personajes (Nivel 2)

Los PNG se colocan en `Assets/Recursos Graficos/Sprites/`. Los nombres y tamaños recomendados están en `Assets/Recursos Graficos/Sprites/README.md`. Para NPC, editar las rutas de las imágenes en `Codigo/secciones/nivel-dos.html`; para sprites del jugador y animación por dirección, editar `Codigo/css/nivelDos.css`.


## Capítulo 3 — Constructora del Paraná (integrado)
- El documento del nivel es `Secciones HTML/Nivel 3/nivelTres.html`; el contenedor de navegación se crea desde `JavaScript/Compartido/cargarSecciones.js`.
- El Nivel 3 está organizado como los demás niveles: HTML en `Codigo/Secciones HTML/Nivel 3/`, CSS en `Codigo/CSS/Nivel 3/`, JavaScript en `Codigo/JavaScript/Nivel 3/` y recursos en `Assets/Recursos Graficos/Nivel 3/`. Se ejecuta dentro de un iframe para evitar colisiones de estilos y eventos con los módulos ES del juego principal.
- El acceso desde las tarjetas y el regreso al selector se controlan en `JavaScript/Compartido/inicializacion.js`; al completar el cruce, el nivel notifica al juego principal y se registra como completado para desbloquear el siguiente.
- El sonido opcional Los sonidos del Nivel 3 están en `Assets/Assets Sonidos/sonidos/Nivel 3/`; `ConstruccionPuente.mp3` ya está incluido. El nivel conserva tolerancia a fallos si un audio no carga.


## Capítulo 4 — Recorrido de plataformas

| Aspecto | Archivo | Qué modificar |
|---|---|---|
| Estructura de la pantalla | `Secciones HTML/Nivel 4/nivel-cuatro-plataformas.html` | Canvas, HUD, overlays y controles |
| Mecánicas, físicas, IA y dibujo | `JavaScript/Nivel 4/nivelCuatroPlataformas.js` | Movimiento, saltos, guardias, selección y dibujo de sprites |
| Estilos | `CSS/Nivel 4/nivelCuatro.css` | Marco del juego, canvas, HUD y overlays |
| Sprites del jugador y guardia | `Assets/Sprites/Nivel 4/Jugador/` y `Guardia/` | PNG originales de quieto, carrera, salto y caída |
| Sprites montados | `Assets/Sprites/Nivel 4/Monturas/Jugador/` y `Monturas/Guardia/` | PNG originales de caballo y jinete |

**Animación a pie:** los ciclos de carrera usan los índices `[0, 1, 2, 1]` para reproducir los tres PNG sin saltar el segundo. La duración de cada paso se controla en `dibujarJugador` y `dibujarEnemigo`.

**Escala y anclaje:** `dibujarSprite` recorta el alfa de cada PNG y usa la altura visible del sprite quieto como referencia de escala. Mantiene la proporción del original y ancla la imagen por los pies. No cambiar `w`, `h` del jugador ni las hitboxes para corregir un problema visual.

**Monturas:** las animaciones de carrera usan los seis PNG disponibles por dirección. El salto utiliza los dos PNG `Saltando ... frame 1/2`; la caída usa el PNG `Cayendo ...`. Los nombres y rutas se declaran en `cargarSprites()`.

## Organización definitiva del Capítulo 3

El único código activo del Capítulo 3 se mantiene en la jerarquía común del proyecto:
- `Secciones HTML/Nivel 3/`: documento del iframe y wrapper que carga el nivel.
- `CSS/Nivel 3/`: estilos del nivel.
- `JavaScript/Nivel 3/`: mecánicas e introducción.
- `Assets/Recursos Graficos/Nivel 3/` y `Assets/Assets Sonidos/sonidos/Nivel 3/`: recursos originales.

La antigua carpeta duplicada `Codigo/NivelTres/` fue retirada. No volver a crear una segunda copia del HTML, CSS o JavaScript del nivel: modificar directamente los archivos ubicados en las carpetas por tipo y nivel indicadas arriba.


### Normalización visual de caminata — Nivel 2

Los PNG originales de `Assets/Sprites/Nivel 2/Jugador/animaciones/Walking/<dirección>/` se conservan intactos. Sus versiones de presentación, con el alfa recortado y recompuesto sobre un lienzo de 96×152 px, están en `Walking/normalized/<dirección>/`. Se preservan la proporción, la altura visible común por dirección y el anclaje inferior. Las variables `--sprite-<dirección><índice>` de `CSS/Nivel 2/nivelDos.css` apuntan a esas versiones normalizadas. No editar los PNG originales para corregir la escala.
