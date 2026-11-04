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
import { EstadoJuego } from '../Compartido/estadoJuego.js';
import { obtenerElementosNivelUno, alternarPantalla, ocultar, establecerTexto } from '../Compartido/interfaz.js';
import { GestorDiarios } from './diarios.js';
import { GestorPreguntas } from './preguntas.js';
import { GestorTablero } from '../Compartido/tablero.js';
import {
  guardarPartida,
  cargarPartida
} from '../Compartido/persistencia.js';
import { NIVEL_JUGABLE } from '../Compartido/configuracion.js';
import { mostrarIntroduccion } from '../Compartido/introducciones.js';

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
      alCompletarTodos: () => mostrarIntroduccion({
        etiqueta: 'CAPÍTULO 1 · INVESTIGAR',
        titulo: 'De las fuentes a las preguntas',
        texto: 'Ya reuniste información de los diarios. Ahora vas a poner a prueba tu lectura: cada respuesta debe apoyarse en lo que dicen las fuentes, no en una impresión aislada. Después vas a conectar recortes para descubrir ideas que aparecen en más de un periódico.',
        boton: 'EMPEZAR CUESTIONARIO',
        alContinuar: () => this.gestorPreguntas.abrir()
      })
    });

    this.gestorPreguntas = new GestorPreguntas({
      elementos: this.elementos,
      estado: this.estado,
      preguntas: preguntasNivelUno,
      audio: this.audio,
      alFinalizar: () => mostrarIntroduccion({
        etiqueta: 'CAPÍTULO 1 · SÍNTESIS',
        titulo: 'El tablero de investigación',
        texto: 'Un diario puede mostrar solo una parte de un problema. Elegí tres recortes que expresen una misma idea y prestá atención a sus fuentes: la actividad busca que compares perspectivas y construyas una explicación a partir de evidencias relacionadas.',
        boton: 'ABRIR EL TABLERO',
        alContinuar: () => this.gestorTablero.abrir()
      })
    });

    this.gestorTablero = new GestorTablero({
      elementos: this.elementos,
      estado: this.estado,
      grupos: gruposTableroNivelUno,
      recortes: recortesTableroNivelUno,
      audio: this.audio,
      alFinalizar: () => this.finalizarNivel()
    });

    this.temporizadorAutoguardado = null;
    this.activo = false;
    this.inicializarEventos();
  }

  inicializarEventos() {
    this.gestorDiarios.inicializarEventos();
    this.gestorPreguntas.inicializarEventos();
    this.gestorTablero.inicializarEventos();

    document.querySelectorAll('[data-reopen-paper]').forEach((boton) => {
      boton.addEventListener('click', () => {
        this.audio.reproducirClick();
        const modalActivo = boton.closest('#quiz-modal, #board-modal');
        this.gestorDiarios.abrirDiario(Number(boton.dataset.reopenPaper), modalActivo);
      });
    });

    const volverANiveles = () => {
      try { sessionStorage.removeItem('facundo-nivel-en-curso'); } catch (_) {}
      this.guardar();
      this.activo = false;
      clearInterval(this.temporizadorAutoguardado);
      this.audio.detenerHojas();
      alternarPantalla(this.elementos.juegoPantalla, false);
      alternarPantalla(document.getElementById('level-select-screen'), true);
      this.audio.reproducirClick();
    };
    this.elementos.botonVolverMenu?.addEventListener('click', volverANiveles);
    this.elementos.botonVolverNiveles?.addEventListener('click', volverANiveles);
    window.addEventListener('pagehide', () => { if (this.activo) this.guardar(); });
  }

  iniciar() {
    try { sessionStorage.setItem('facundo-nivel-en-curso', '1'); } catch (_) {}
    this.reiniciar();
    this.activo = true;
    cargarPartida().then((partida) => {
      if (this.activo && partida && partida.nivel === NIVEL_JUGABLE) this.aplicarPartidaGuardada(partida);
    });
    clearInterval(this.temporizadorAutoguardado);
    this.temporizadorAutoguardado = setInterval(() => { if (this.activo) this.guardar(true); }, 2500);
    this.audio.reproducirClick();
    alternarPantalla(this.elementos.juegoPantalla, true);
    mostrarIntroduccion({
      etiqueta: 'CAPÍTULO 1 · EL DIARIO DE FACUNDO',
      titulo: 'Investigar antes de sacar conclusiones',
      texto: 'Vas a reconstruir una época a partir de cuatro periódicos. Cada fuente tiene su propio enfoque y no cuenta toda la historia por sí sola. Leé, identificá las frases clave y compará lo que dice cada diario. Después responderás preguntas y conectarás recortes para distinguir información, perspectivas y relaciones entre ideas.',
      boton: 'COMENZAR LA INVESTIGACIÓN'
    });
  }

  detener() {
    this.activo = false;
    clearInterval(this.temporizadorAutoguardado);
    this.audio.detenerHojas();
  }

  mostrarMensajePartida(texto, esError = false) {
    establecerTexto(this.elementos.mensajePartida, texto);
    this.elementos.mensajePartida.classList.toggle('es-error', esError);
  }

  guardar(silencioso = false) {
    guardarPartida(NIVEL_JUGABLE, this.estado).then((resultado) => {
      if (resultado.exito) {
        if (this.elementos.mensajePartida) this.mostrarMensajePartida('PROGRESO GUARDADO AUTOMÁTICAMENTE.');
      } else if (!silencioso) {
        this.mostrarMensajePartida(resultado.error.toUpperCase(), true);
      }
    });
  }

  aplicarPartidaGuardada(partida) {
    this.estado.diariosRecolectados = new Set(partida.diariosRecolectados || []);
    this.estado.puntuacionPreguntas = partida.puntuacionPreguntas;
    this.estado.gruposTableroCompletados = new Set(partida.gruposTableroCompletados || []);
    this.estado.puntuacionTablero = partida.puntuacionTablero;

    document.querySelectorAll('.newspaper').forEach((diario) => {
      const indice = Number(diario.dataset.paper);
      diario.classList.toggle('collected', this.estado.diariosRecolectados.has(indice));
    });

    this.gestorDiarios.actualizarProgreso();

    if (this.estado.gruposTableroCompletados.size > 0) this.gestorTablero.abrir();
    else if (this.estado.diariosRecolectados.size === diariosNivelUno.length) {
      establecerTexto(this.elementos.pistaInteraccion, 'TODOS LOS DIARIOS FUERON LEÍDOS · CONTINUÁ CON EL CUESTIONARIO');
      this.gestorPreguntas.abrir();
    }
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
    // Registrar la victoria en el momento de completarla para que el botón
    // REPETIR NIVEL aparezca incluso si la selección se vuelve a cargar.
    try {
      const clave = 'facundo-niveles-completados';
      const completados = JSON.parse(localStorage.getItem(clave) || '[]');
      const lista = Array.isArray(completados) ? completados.map(Number) : [];
      if (!lista.includes(1)) lista.push(1);
      localStorage.setItem(clave, JSON.stringify(lista));
      const desbloqueado = Number(localStorage.getItem('nivel-desbloqueado') || '1');
      localStorage.setItem('nivel-desbloqueado', String(Math.max(desbloqueado, 2)));
    } catch (_) {}

    this.elementos.resultadoDiarios.textContent =
      `${this.estado.diariosRecolectados.size} / ${diariosNivelUno.length} DIARIOS`;
    this.elementos.resultadoPreguntas.textContent =
      `${this.estado.puntuacionPreguntas} / ${preguntasNivelUno.length} RESPUESTAS · ${this.estado.puntuacionTablero} / ${gruposTableroNivelUno.length} GRUPOS` ;

    this.elementos.nivelCompletadoModal.classList.remove('hidden');
    this.audio.detenerHojas();
    this.audio.reproducirClick();
  }
}

export { NivelUno };
