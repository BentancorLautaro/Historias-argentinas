# Modularización de El Diario de Facundo

## Objetivo

La estructura del código fue reorganizada sin reconstruir el juego desde cero. Se conserva la lógica existente del menú, desbloqueo de niveles, configuración de audio, lectura de diarios, recolección de frases clave, cuestionario y tablero de investigación.

## Estructura

```text
Codigo/
├── index.html
├── css/
│   ├── estilos.css
│   ├── base.css
│   ├── menu.css
│   ├── configuracion.css
│   ├── juego.css
│   ├── tablero.css
│   ├── diarios.css
│   ├── responsive-menu.css
│   ├── periodico.css
│   └── pixel.css
├── js/
│   ├── principal.js
│   ├── inicializacion.js
│   ├── configuracion.js
│   ├── estadoJuego.js
│   ├── persistencia.js
│   ├── audio.js
│   ├── interfaz.js
│   ├── menu.js
│   ├── ajustes.js
│   ├── nivelUno.js
│   ├── datosNivelUno.js
│   ├── diarios.js
│   ├── preguntas.js
│   └── tablero.js
└── README_MODULARIZACION.md
```

## Responsabilidad de cada módulo JavaScript

| Archivo | Responsabilidad |
|---|---|
| `principal.js` | Punto de entrada y carga al finalizar el DOM. |
| `inicializacion.js` | Conecta servicios, menú y Nivel 1. |
| `configuracion.js` | Constantes compartidas y valores configurables. |
| `estadoJuego.js` | Estado mutable de una partida. |
| `persistencia.js` | Lectura y escritura del nivel desbloqueado en `localStorage`. |
| `audio.js` | Efectos, sonido de hojas y volúmenes. |
| `interfaz.js` | Referencias del DOM y operaciones visuales simples. |
| `menu.js` | Navegación, selección de niveles y desbloqueos. |
| `ajustes.js` | Volumen, efectos, idioma y controles de la pantalla de configuración. |
| `nivelUno.js` | Orquestación del Nivel 1. No concentra la lógica detallada. |
| `datosNivelUno.js` | Diarios, preguntas, grupos y recortes del Nivel 1. |
| `diarios.js` | Lectura y recolección de frases clave. |
| `preguntas.js` | Cuestionario y puntuación. |
| `tablero.js` | Selección y validación de tríadas. |

## Comunicación entre módulos

`principal.js` llama a `inicializacion.js`. Este crea `GestorAudio` y `GestorMenu`. Cuando el jugador inicia el Nivel 1, `NivelUno` compone `EstadoJuego`, `GestorDiarios`, `GestorPreguntas` y `GestorTablero`.

Los módulos especializados no dependen entre sí de forma directa para avanzar la partida: se comunican mediante callbacks. Por ejemplo, al completar todos los diarios, `GestorDiarios` avisa a `NivelUno`, que abre el cuestionario; al terminar el cuestionario se abre el tablero; al resolver todas las tríadas se muestra el cierre del nivel.

## CSS

`estilos.css` funciona como hoja principal e importa los módulos en el mismo orden de la hoja original. Esto permite separar responsabilidades sin alterar intencionalmente la cascada visual.

## Criterios aplicados

- Alta cohesión: cada módulo concentra una responsabilidad.
- Bajo acoplamiento: la coordinación se realiza por interfaces claras y callbacks.
- Reutilización: audio, persistencia, interfaz y estado están desacoplados.
- Analizabilidad: nombres de funciones, clases, variables y módulos están en español y los sectores importantes tienen documentación.
- Modificabilidad: cambiar preguntas, datos, audio o estilos puede hacerse en un módulo específico.

## Verificaciones realizadas

- Todos los archivos JavaScript pasan la comprobación de sintaxis de Node.
- Los imports relativos apuntan a archivos existentes.
- Los `getElementById` utilizados por JavaScript existen en `index.html`.
- No quedan referencias a los antiguos `AudioManejador.js`, `MainMenu.js`, `FirstPersonLevel.js` ni `main.js`.
- `index.html` carga un único punto de entrada mediante `type="module"`.
