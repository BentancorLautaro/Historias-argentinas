/**
 * Orquestador del Nivel 2 · "Voces en la Pulpería".
 * Coordina módulos especializados sin concentrar toda la lógica en una sola
 * clase, siguiendo el mismo patrón que nivelUno.js usa para el Nivel 1.
 *
 * Reutiliza sin modificar GestorPreguntas y GestorTablero (ya genéricos),
 * y agrega GestorInterrogatorio como reemplazo de GestorDiarios, adaptado
 * a la mecánica propia de este nivel: preguntar y recolectar pistas.
 */

import {
  personajesNivelDos,
  preguntasNivelDos,
  gruposTableroNivelDos,
  recortesTableroNivelDos
} from './datosNivelDos.js';
import { EstadoNivelDos } from './estadoNivelDos.js';
import { obtenerElementosNivelDos } from './interfazNivelDos.js';
import { alternarPantalla, ocultar } from '../Compartido/interfaz.js';
import { GestorInterrogatorio } from '../Nivel 4/interrogatorio.js';
import { GestorPreguntas } from '../Nivel 1/preguntas.js';
import { GestorTablero } from '../Compartido/tablero.js';
import { GestorMapa } from './mapaMovimiento.js';
import { guardarPartida, cargarPartida } from '../Compartido/persistencia.js';
import { NIVEL_DOS_JUGABLE } from '../Compartido/configuracion.js';
import { mostrarIntroduccion } from '../Compartido/introducciones.js';

class NivelDos {
  constructor(audio, alSalir) {
    this.audio = audio;
    this.alSalir = alSalir;
    this.elementos = obtenerElementosNivelDos();
    this.estado = new EstadoNivelDos();

    this.gestorInterrogatorio = new GestorInterrogatorio({
      elementos: this.elementos,
      estado: this.estado,
      personajes: personajesNivelDos,
      audio: this.audio,
      alCompletarTodos: () => this.finalizarNivel()
    });

    this.gestorPreguntas = new GestorPreguntas({
      elementos: this.elementos,
      estado: this.estado,
      preguntas: preguntasNivelDos,
      audio: this.audio,
      alFinalizar: () => this.finalizarNivel()
    });

    this.gestorTablero = new GestorTablero({
      elementos: this.elementos,
      estado: this.estado,
      grupos: gruposTableroNivelDos,
      recortes: recortesTableroNivelDos,
      audio: this.audio,
      alFinalizar: () => this.finalizarNivel()
    });

    // El mapa recorrible del pueblo: mueve al jugador con WASD/flechas y
    // avisa a GestorInterrogatorio cuándo hay que abrir a un personaje
    // (por cercanía + ESPACIO, o por el clic de siempre en el botón).
    this.gestorMapa = new GestorMapa({
      elementos: this.elementos,
      estado: this.estado,
      audio: this.audio,
      alInteractuar: (indice) => this.gestorInterrogatorio.abrirPersonaje(indice)
    });

    this.temporizadorAutoguardado = null;
    this.activo = false;
    this.inicializarEventos();
  }

  /** Conecta los eventos de todos los sub-gestores y el botón de volver al menú. */
  inicializarEventos() {
    this.gestorInterrogatorio.inicializarEventos();
    this.gestorPreguntas.inicializarEventos();
    this.gestorTablero.inicializarEventos();
    this.gestorMapa.inicializarEventos();

    const volverANiveles = (desdeFinalizacion = false) => {
      try { sessionStorage.removeItem('facundo-nivel-en-curso'); } catch (_) {}
      this.guardar();
      this.activo = false;
      clearInterval(this.temporizadorAutoguardado);
      this.gestorMapa.detener();
      Object.values(this.elementos.escenasMecanica).forEach((escena) => ocultar(escena.raiz));
      this.audio.reproducirClick();

      // Solo registrar el nivel como completado cuando se sale desde la
      // pantalla de victoria, no cuando se abandona la partida a mitad.
      if (desdeFinalizacion) {
        this.alSalir(NIVEL_DOS_JUGABLE);
        return;
      }
      alternarPantalla(this.elementos.juegoPantalla, false);
      alternarPantalla(document.getElementById('level-select-screen'), true);
    };
    this.elementos.botonVolverMenu?.addEventListener('click', () => volverANiveles(true));
    this.elementos.botonVolverNiveles?.addEventListener('click', () => volverANiveles(false));
    window.addEventListener('pagehide', () => { if (this.activo) this.guardar(); });
  }

  /** Punto de entrada al nivel: reinicia el estado y muestra la pantalla. */
  iniciar() {
    try { sessionStorage.setItem('facundo-nivel-en-curso', '2'); } catch (_) {}
    this.reiniciar();
    this.activo = true;
    cargarPartida().then((partida) => {
      if (!this.activo || !partida || partida.nivel !== NIVEL_DOS_JUGABLE) return;
      this.estado.personajesInterrogados = new Set(partida.personajesInterrogados || []);
      this.estado.misionBaqueanoIniciada = Boolean(partida.misionBaqueanoIniciada);
      this.estado.misionBaqueanoActiva = Boolean(partida.misionBaqueanoActiva);
      this.estado.misionBaqueanoCompletada = Boolean(partida.misionBaqueanoCompletada);
      this.estado.misionBaqueanoPendienteInforme = Boolean(partida.misionBaqueanoPendienteInforme);
      this.estado.misionBaqueanoHablados = new Set(partida.misionBaqueanoHablados || []);
      this.estado.puntuacionPreguntas = partida.puntuacionPreguntas || 0;
      this.estado.gruposTableroCompletados = new Set(partida.gruposTableroCompletados || []);
      this.estado.puntuacionTablero = partida.puntuacionTablero || 0;
      document.querySelectorAll('.personaje').forEach((el) => el.classList.toggle('interrogado', this.estado.personajesInterrogados.has(Number(el.dataset.personaje))));
      this.gestorInterrogatorio.actualizarProgreso();
    });
    clearInterval(this.temporizadorAutoguardado);
    this.temporizadorAutoguardado = setInterval(() => { if (this.activo) this.guardar(); }, 2500);
    this.audio.reproducirClick();
    alternarPantalla(this.elementos.juegoPantalla, true);
    this.gestorMapa.iniciar();
    mostrarIntroduccion({
      etiqueta: 'CAPÍTULO 2 · VOCES EN LA PULPERÍA',
      titulo: 'La historia también se reconstruye escuchando',
      texto: 'En este capítulo no alcanza con leer documentos: vas a recorrer el pueblo, conversar con personajes y resolver desafíos distintos según lo que cada uno sabe. Cada minijuego representa una forma de obtener información —seguir rastros, interpretar relatos o reconstruir una voz—. Reuní las pistas, comparalas y usalas para armar una versión fundamentada de la historia de Facundo.',
      boton: 'ENTRAR AL PUEBLO'
    });
  }

  establecerPausa(pausado) {
    this.gestorMapa.establecerPausa(pausado);
    this.gestorInterrogatorio.establecerPausa(pausado);
  }

  detener() {
    this.activo = false;
    clearInterval(this.temporizadorAutoguardado);
    this.gestorMapa.detener();
    this.gestorInterrogatorio.detener();
    Object.values(this.elementos.escenasMecanica).forEach((escena) => ocultar(escena.raiz));
  }

  guardar() {
    guardarPartida(NIVEL_DOS_JUGABLE, this.estado).then((resultado) => {
      if (resultado.exito && this.elementos.mensajeAutoguardado) this.elementos.mensajeAutoguardado.textContent = 'PROGRESO GUARDADO AUTOMÁTICAMENTE';
      else if (!resultado.exito && this.elementos.mensajeAutoguardado) this.elementos.mensajeAutoguardado.textContent = 'NO SE PUDO GUARDAR EL PROGRESO';
    });
  }

  /** Vuelve el nivel a su estado inicial, por si se juega más de una vez. */
  reiniciar() {
    this.estado.reiniciar();
    document.querySelectorAll('.dialogo-mision-baqueano').forEach((dialogo) => dialogo.remove());

    document.querySelectorAll('.personaje').forEach((personaje) => {
      personaje.classList.remove('interrogado');
    });

    this.gestorInterrogatorio.iniciar();

    Object.values(this.elementos.escenasMecanica).forEach((escena) => ocultar(escena.raiz));
    [
      this.elementos.cuestionarioModal,
      this.elementos.tableroModal,
      this.elementos.nivelCompletadoModal
    ].forEach(ocultar);
  }

  /** Muestra el cierre del capítulo al reunir y reportar los testimonios. */
  finalizarNivel() {
    // Registrar la victoria en el momento de completarla para que el botón
    // REPETIR NIVEL aparezca incluso si la selección se vuelve a cargar.
    try {
      const clave = 'facundo-niveles-completados';
      const completados = JSON.parse(localStorage.getItem(clave) || '[]');
      const lista = Array.isArray(completados) ? completados.map(Number) : [];
      if (!lista.includes(2)) lista.push(2);
      localStorage.setItem(clave, JSON.stringify(lista));
      const desbloqueado = Number(localStorage.getItem('nivel-desbloqueado') || '1');
      localStorage.setItem('nivel-desbloqueado', String(Math.max(desbloqueado, 3)));
    } catch (_) {}

    this.gestorMapa.detener();

    this.elementos.resultadoPersonajes.textContent =
      `${this.estado.personajesInterrogados.size} / ${personajesNivelDos.length} TESTIGOS`;
    this.elementos.resultadoPreguntas.textContent =
      `${this.estado.puntuacionPreguntas} / ${preguntasNivelDos.length} RESPUESTAS · ${this.estado.puntuacionTablero} / ${gruposTableroNivelDos.length} VERSIONES`;

    this.elementos.nivelCompletadoModal.classList.remove('hidden');
    this.audio.reproducirClick();
  }
}

export { NivelDos };
