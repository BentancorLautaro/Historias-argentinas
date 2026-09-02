/**
 * Estado mutable de una partida del Nivel 1.
 * Centraliza el progreso y evita variables globales repartidas.
 */
class EstadoJuego {
  constructor() {
    this.reiniciar();
  }

  reiniciar() {
    this.diariosRecolectados = new Set();
    this.diarioActual = 0;
    this.frasesClaveActuales = new Set();
    this.indicePregunta = 0;
    this.puntuacionPreguntas = 0;
    this.seleccionTablero = [];
    this.gruposTableroCompletados = new Set();
    this.puntuacionTablero = 0;
  }
}

export { EstadoJuego };
