/**
 * Gestiona todos los sonidos del juego.
 * Centraliza volumen, habilitación de efectos y reproducción.
 */

import { VOLUMEN_INICIAL } from './configuracion.js';

/**
 * Voces habladas de cada carta del contrapunto de "El Cantor".
 * Todavía no llegaron los audios definitivos: cada valor queda en null a
 * propósito. Cuando se sumen los archivos (uno por carta de ataque y uno
 * por carta de defensa), alcanza con completar la ruta acá, por ejemplo:
 *   'ataque-aeda-sin-letras': `${RUTA_SONIDOS}Payada/AtaqueAedaSinLetras.mp3`
 * Los ids tienen que coincidir con el campo "audioId" de cada carta en
 * datosNivelDos.js (personaje "cantor" > datosMecanica). Mientras el valor
 * sea null, reproducirVozCarta() no hace nada (no rompe el juego).
 */
const RUTA_ASSETS = new URL('../../../Assets/Assets Sonidos/', import.meta.url).href;
const RUTAS_VOCES_CARTAS = {
  // --- Cartas de ataque (el Payador Adversario / la IA) ---
  'ataque-aeda-sin-letras': null,
  'ataque-himno-tragedias': null,
  'ataque-pampa-desierta': null,
  'ataque-desprecio-urbe': null,
  'ataque-historia-sin-papel': null,
  // --- Cartas de defensa (el jugador) ---
  'defensa-memoria-desierto': null,
  'defensa-bardo-pampa': null,
  'defensa-tristeza-triste': null,
  'defensa-acompanante-vihuela': null,
  'defensa-cronica-matrero': null
};

class GestorAudio {
  constructor() {
    const rutaRecursos = RUTA_ASSETS;

    this.efectosActivados = true;
    this.volumenGeneral = VOLUMEN_INICIAL;
    this.volumenMusica = VOLUMEN_INICIAL;

    this.sonidos = {
      click: new Audio(`${rutaRecursos}sonidos/Compartido/SonidoClick.mp3`),
      hojas: new Audio(`${rutaRecursos}sonidos/Nivel 1/SonidoHojas.mp3`),
      payada: new Audio(`${rutaRecursos}musica/Nivel 2/BasePayada.mp3`),
      baraja: new Audio(`${rutaRecursos}sonidos/Nivel 2/CartaBarajeada.mp3`),
      cartaHover: new Audio(`${rutaRecursos}sonidos/Compartido/SonidoClick.mp3`),
      puerta: new Audio(`${rutaRecursos}sonidos/Nivel 2/PuertaPulperia.mp3`),
      construccionPuente: new Audio(`${rutaRecursos}sonidos/Nivel 3/ConstruccionPuente.mp3`),
      talarArbol: new Audio(`${rutaRecursos}sonidos/Nivel 3/TalarArbol.mp3`),
      talarArbolCaida: new Audio(`${rutaRecursos}sonidos/Nivel 3/TalarArbolCaida.mp3`)
    };

    this.ultimoHoverCarta = 0;

    Object.values(this.sonidos).forEach((sonido) => {
      sonido.preload = 'auto';
    });

    // El efecto de hojas se reproduce una sola vez al abrir/cerrar un diario.
    this.sonidos.hojas.loop = false;
    // La base de la payada es música ambiente del contrapunto: suena en bucle
    // mientras dura el minijuego de "El Cantor".
    this.sonidos.payada.loop = true;

    // Voces habladas de cada carta (ver RUTAS_VOCES_CARTAS más arriba).
    this.vocesCartas = {};
    Object.entries(RUTAS_VOCES_CARTAS).forEach(([id, ruta]) => {
      this.vocesCartas[id] = ruta ? new Audio(ruta) : null;
    });

    this.aplicarVolumenes();
  }

  aplicarVolumenes() {
    const maestro = this.volumenGeneral / 100;
    this.sonidos.click.volume = Math.min(1, maestro * 0.75);
    this.sonidos.baraja.volume = Math.min(1, maestro * 0.7);
    this.sonidos.cartaHover.volume = Math.min(1, maestro * 0.4);
    this.sonidos.puerta.volume = Math.min(1, maestro * 0.7);
    this.sonidos.construccionPuente.volume = Math.min(1, maestro * 0.75);
    this.sonidos.talarArbol.volume = Math.min(1, maestro * 0.65);
    this.sonidos.talarArbolCaida.volume = Math.min(1, maestro * 0.8);
    this.sonidos.hojas.volume = Math.min(
      1,
      maestro * (this.volumenMusica / 100) * 0.22
    );
    this.sonidos.payada.volume = Math.min(
      1,
      maestro * (this.volumenMusica / 100) * 0.35
    );
    Object.values(this.vocesCartas).forEach((voz) => {
      if (voz) voz.volume = Math.min(1, maestro * 0.85);
    });
  }

  reproducir(nombre, { reiniciar = true } = {}) {
    if (!this.efectosActivados) return;

    const audio = this.sonidos[nombre];
    if (!audio) return;

    try {
      if (reiniciar) audio.currentTime = 0;
      const promesa = audio.play();
      if (promesa && typeof promesa.catch === 'function') {
        promesa.catch(() => {});
      }
    } catch (_) {
      // Un bloqueo del navegador no debe interrumpir la partida.
    }
  }

  /**
   * El sonido de botón (hover) se sacó del juego por pedido: quedaba
   * molesto al pasar el mouse por todos lados. Se deja este método vacío
   * (en vez de borrarlo) porque el resto del código todavía lo llama en
   * varios lugares; ahora simplemente no hace nada.
   */
  reproducirHover() {}

  reproducirClick() {
    this.reproducir('click');
  }

  /** Sonido corto al pasar el cursor sobre una carta (solo las cartas, no otros botones). */
  reproducirHoverCarta() {
    if (!this.efectosActivados) return;
    const ahora = performance.now();
    if (ahora - this.ultimoHoverCarta < 70) return;
    this.ultimoHoverCarta = ahora;
    this.reproducir('cartaHover');
  }

  /** Sonido de una carta siendo barajada/jugada, para el contrapunto de El Cantor. */
  reproducirBarajar() {
    this.reproducir('baraja');
  }

  reproducirPuerta() { this.reproducir('puerta'); }
  reproducirConstruccionPuente() { this.reproducir('construccionPuente'); }
  reproducirTalarArbol() { this.reproducir('talarArbol'); }
  reproducirTalarArbolCaida() { this.reproducir('talarArbolCaida'); }

  reproducirHojas() {
    this.reproducir('hojas');
  }

  detenerHojas() {
    const audio = this.sonidos.hojas;
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch (_) {
      // Se ignora si el navegador no permite reposicionar el audio en ese momento.
    }
  }

  /** Arranca la música de fondo del contrapunto (en bucle) al entrar a la escena de El Cantor. */
  reproducirPayada() {
    this.reproducir('payada', { reiniciar: false });
  }

  /** Corta la música de fondo del contrapunto al salir de la escena de El Cantor. */
  detenerPayada() {
    const audio = this.sonidos.payada;
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch (_) {
      // Se ignora si el navegador no permite reposicionar el audio en ese momento.
    }
  }

  /**
   * Reproduce la voz hablada de una carta (ataque o defensa) según su
   * "audioId". Si todavía no se cargó el archivo definitivo (ver
   * RUTAS_VOCES_CARTAS), no hace nada: el juego sigue funcionando solo con
   * el texto de la carta.
   */
  reproducirVozCarta(audioId) {
    if (!this.efectosActivados || !audioId) return;
    const voz = this.vocesCartas[audioId];
    if (!voz) return;

    try {
      voz.currentTime = 0;
      const promesa = voz.play();
      if (promesa && typeof promesa.catch === 'function') {
        promesa.catch(() => {});
      }
    } catch (_) {
      // Un bloqueo del navegador no debe interrumpir la partida.
    }
  }

  establecerVolumenGeneral(valor) {
    this.volumenGeneral = Math.max(0, Math.min(100, Number(valor) || 0));
    this.aplicarVolumenes();
  }

  establecerVolumenMusica(valor) {
    this.volumenMusica = Math.max(0, Math.min(100, Number(valor) || 0));
    this.aplicarVolumenes();
  }

  establecerEfectosActivados(activados) {
    this.efectosActivados = Boolean(activados);
    if (!this.efectosActivados) this.detenerHojas();
  }
}

export { GestorAudio };
