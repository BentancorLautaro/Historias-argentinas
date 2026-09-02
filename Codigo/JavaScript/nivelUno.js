/**
 * Orquestador del Nivel 1.
 * Coordina módulos especializados sin concentrar toda la lógica en una sola clase.
 */

import {
  diariosNivelUno,
  preguntasNivelUno,
  gruposTableroNivelUno,
  recortesTableroNivelUno
} from './datosNivelUno.js';
import { EstadoJuego } from './estadoJuego.js';
import { obtenerElementosNivelUno, alternarPantalla, ocultar } from './interfaz.js';
import { GestorDiarios } from './diarios.js';
import { GestorPreguntas } from './preguntas.js';
import { GestorTablero } from './tablero.js';

class NivelUno {
  constructor(audio, alSalir) {
    this.audio = audio;
    this.alSalir = alSalir;
    this.elementos = obtenerElementosNivelUno();
    this.estado = new EstadoJuego();

    this.gestorDiarios = new GestorDiarios({
      elementos: this.elementos,
      estado: this.estado,
      diarios: diariosNivelUno,
      audio: this.audio,
      alCompletarTodos: () => this.gestorPreguntas.abrir()
    });

    this.gestorPreguntas = new GestorPreguntas({
      elementos: this.elementos,
      estado: this.estado,
      preguntas: preguntasNivelUno,
      audio: this.audio,
      alFinalizar: () => this.gestorTablero.abrir()
    });

    this.gestorTablero = new GestorTablero({
      elementos: this.elementos,
      estado: this.estado,
      grupos: gruposTableroNivelUno,
      recortes: recortesTableroNivelUno,
      audio: this.audio,
      alFinalizar: () => this.finalizarNivel()
    });

    this.inicializarEventos();
  }

  inicializarEventos() {
    this.gestorDiarios.inicializarEventos();
    this.gestorPreguntas.inicializarEventos();
    this.gestorTablero.inicializarEventos();

    this.elementos.botonVolverMenu.addEventListener('click', () => {
      this.audio.reproducirClick();
      this.audio.detenerHojas();
      this.alSalir(1);
    });
  }

  iniciar() {
    this.reiniciar();
    this.audio.reproducirClick();
    alternarPantalla(this.elementos.juegoPantalla, true);
  }

  reiniciar() {
    this.estado.reiniciar();

    document.querySelectorAll('.newspaper').forEach((diario) => {
      diario.classList.remove('collected');
    });

    this.gestorDiarios.iniciar();
    [
      this.elementos.diarioModal,
      this.elementos.cuestionarioModal,
      this.elementos.tableroModal,
      this.elementos.nivelCompletadoModal
    ].forEach(ocultar);

    this.audio.detenerHojas();
  }

  finalizarNivel() {
    this.elementos.resultadoDiarios.textContent =
      `${this.estado.diariosRecolectados.size} / ${diariosNivelUno.length} DIARIOS`;
    this.elementos.resultadoPreguntas.textContent =
      `${this.estado.puntuacionPreguntas} / ${preguntasNivelUno.length} RESPUESTAS · ${this.estado.puntuacionTablero} / ${gruposTableroNivelUno.length} TRÍADAS`;

    this.elementos.nivelCompletadoModal.classList.remove('hidden');
    this.audio.detenerHojas();
    this.audio.reproducirClick();
  }
}

export { NivelUno };
