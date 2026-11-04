/**
 * Estado mutable de una partida del Nivel 2.
 * Centraliza el progreso del nivel y evita variables globales repartidas,
 * siguiendo el mismo criterio que estadoJuego.js usa para el Nivel 1.
 *
 * Los campos indicePregunta, puntuacionPreguntas, seleccionTablero,
 * gruposTableroCompletados y puntuacionTablero se llaman igual que en
 * EstadoJuego a propósito: así este estado es compatible con los gestores
 * genéricos GestorPreguntas y GestorTablero, que se reutilizan sin cambios
 * para el Nivel 2.
 */
class EstadoNivelDos {
  constructor() {
    this.reiniciar();
  }

  reiniciar() {
    // Progreso de la mecánica de interrogatorio.
    this.personajesInterrogados = new Set();
    this.personajeActual = 0;
    this.pistasActuales = new Set();

    // Única misión del Baqueano: reunir testimonios de tres vecinos nuevos del pueblo.
    this.misionBaqueanoIniciada = false;
    this.misionBaqueanoActiva = false;
    this.misionBaqueanoCompletada = false;
    this.misionBaqueanoPendienteInforme = false;
    this.misionBaqueanoHablados = new Set();

    // Progreso del cuestionario final (usado por GestorPreguntas).
    this.indicePregunta = 0;
    this.puntuacionPreguntas = 0;

    // Progreso del tablero de versiones (usado por GestorTablero).
    this.seleccionTablero = [];
    this.gruposTableroCompletados = new Set();
    this.puntuacionTablero = 0;
  }
}

export { EstadoNivelDos };
