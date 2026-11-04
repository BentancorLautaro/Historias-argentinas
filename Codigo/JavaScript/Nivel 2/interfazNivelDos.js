/**
 * Acceso centralizado al DOM del Nivel 2 y operaciones visuales simples.
 * Cumple, para el Nivel 2, el mismo rol que interfaz.js cumple para el Nivel 1.
 *
 * Los nombres de propiedades cuestionarioModal, contenidoCuestionario,
 * retroalimentacionCuestionario, botonSiguientePregunta, tableroModal,
 * progresoTablero, puntuacionTablero, recortesTablero, ideaFormada,
 * retroalimentacionTablero, botonLimpiarTablero y botonContinuarTablero se
 * mantienen idénticos a los de obtenerElementosNivelUno() a propósito: son
 * los nombres que esperan los gestores genéricos GestorPreguntas y
 * GestorTablero, reutilizados sin modificaciones en el Nivel 2.
 */

function obtenerElementosNivelDos() {
  return {
    juegoPantalla: document.getElementById('game-screen-dos'),

    // Escena del pueblo: mapa recorrible con el jugador y los cuatro
    // personajes ubicados sobre la ilustración (ver mapaMovimiento.js).
    // escenaMundo es el "visor" (tamaño fijo, overflow:hidden); mundoMapa
    // es el lienzo grande que se mueve/escala por dentro con la cámara.
    escenaMundo: document.getElementById('game-world-dos'),
    mundoMapa: document.getElementById('mundo-dos'),
    jugadorMapa: document.getElementById('jugador-mapa'),

    progresoPersonajes: document.getElementById('witness-progress'),
    barraPersonajes: document.getElementById('witness-progress-fill'),
    pistaInteraccion: document.getElementById('interact-hint-dos'),

    // Cada personaje abre su propio minijuego a pantalla completa, en vez
    // de un modal dentro de la pulpería. "escenasMecanica" agrupa, por
    // tipoMecanica, la raíz de esa pantalla, dónde dibujar la mecánica,
    // dónde mostrar el progreso y el botón para volver.
    escenasMecanica: {
      rastreador: {
        raiz: document.getElementById('escena-rastreador'),
        contenedor: document.getElementById('contenedor-rastreador'),
        progreso: document.getElementById('progreso-rastreador'),
        botonVolver: document.getElementById('volver-rastreador')
      },
      baqueano: {
        raiz: document.getElementById('escena-baqueano'),
        contenedor: document.getElementById('contenedor-baqueano'),
        progreso: document.getElementById('progreso-baqueano'),
        botonVolver: document.getElementById('volver-baqueano')
      },
      gauchoMalo: {
        raiz: document.getElementById('escena-gaucho-malo'),
        contenedor: document.getElementById('contenedor-gaucho-malo'),
        progreso: document.getElementById('progreso-gaucho-malo'),
        botonVolver: document.getElementById('volver-gaucho-malo')
      },
      cantor: {
        raiz: document.getElementById('escena-cantor'),
        contenedor: document.getElementById('contenedor-cantor'),
        progreso: document.getElementById('progreso-cantor'),
        botonVolver: document.getElementById('volver-cantor')
      }
    },

    // Cuestionario final (reutiliza GestorPreguntas).
    cuestionarioModal: document.getElementById('quiz-modal-dos'),
    contenidoCuestionario: document.getElementById('quiz-content-dos'),
    retroalimentacionCuestionario: document.getElementById('quiz-feedback-dos'),
    botonSiguientePregunta: document.getElementById('quiz-next-dos'),

    // Tablero de versiones (reutiliza GestorTablero).
    tableroModal: document.getElementById('board-modal-dos'),
    progresoTablero: document.getElementById('board-progress-dos'),
    puntuacionTablero: document.getElementById('board-score-dos'),
    recortesTablero: document.getElementById('board-clippings-dos'),
    ideaFormada: document.querySelector('#formed-idea-dos span'),
    retroalimentacionTablero: document.getElementById('board-feedback-dos'),
    botonLimpiarTablero: document.getElementById('board-reset-selection-dos'),
    botonContinuarTablero: document.getElementById('board-next-dos'),

    // Pantalla de cierre del nivel.
    nivelCompletadoModal: document.getElementById('level-complete-dos'),
    resultadoPersonajes: document.getElementById('final-witnesses'),
    resultadoPreguntas: document.getElementById('final-quiz-dos'),
    botonVolverMenu: document.getElementById('return-menu-dos'),
    botonVolverNiveles: document.getElementById('btn-volver-nivel-dos'),
    mensajeAutoguardado: document.getElementById('mensaje-autoguardado-dos')
  };
}

export { obtenerElementosNivelDos };
