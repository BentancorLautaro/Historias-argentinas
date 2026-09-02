/**
 * Acceso centralizado al DOM del Nivel 1 y operaciones visuales simples.
 */

function obtenerElementosNivelUno() {
  return {
    juegoPantalla: document.getElementById('game-screen'),
    diarioModal: document.getElementById('newspaper-modal'),
    tituloDiario: document.getElementById('paper-title'),
    fechaDiario: document.getElementById('paper-date'),
    edicionDiario: document.getElementById('paper-issue'),
    seccionDiario: document.getElementById('paper-kicker'),
    titularDiario: document.getElementById('paper-headline'),
    bajadaDiario: document.getElementById('paper-deck'),
    textoDiario: document.getElementById('paper-text'),
    progresoFrases: document.getElementById('paper-key-progress'),
    progresoDiarios: document.getElementById('paper-progress'),
    barraDiarios: document.getElementById('paper-progress-fill'),
    pistaInteraccion: document.getElementById('interact-hint'),
    botonCerrarDiario: document.getElementById('close-paper'),

    cuestionarioModal: document.getElementById('quiz-modal'),
    contenidoCuestionario: document.getElementById('quiz-content'),
    retroalimentacionCuestionario: document.getElementById('quiz-feedback'),
    botonSiguientePregunta: document.getElementById('quiz-next'),

    tableroModal: document.getElementById('board-modal'),
    progresoTablero: document.getElementById('board-progress'),
    puntuacionTablero: document.getElementById('board-score'),
    recortesTablero: document.getElementById('board-clippings'),
    ideaFormada: document.querySelector('#formed-idea span'),
    retroalimentacionTablero: document.getElementById('board-feedback'),
    botonLimpiarTablero: document.getElementById('board-reset-selection'),
    botonContinuarTablero: document.getElementById('board-next'),

    nivelCompletadoModal: document.getElementById('level-complete'),
    resultadoDiarios: document.getElementById('final-papers'),
    resultadoPreguntas: document.getElementById('final-quiz'),
    botonVolverMenu: document.getElementById('return-menu')
  };
}

function mostrar(elemento) {
  elemento.classList.remove('hidden');
}

function ocultar(elemento) {
  elemento.classList.add('hidden');
}

function alternarPantalla(elemento, visible) {
  elemento.classList.toggle('hidden', !visible);
  elemento.classList.toggle('active', visible);
}

function establecerTexto(elemento, texto) {
  elemento.textContent = texto;
}

export {
  obtenerElementosNivelUno,
  mostrar,
  ocultar,
  alternarPantalla,
  establecerTexto
};
