/**
 * Gestiona todos los sonidos del juego.
 * Centraliza volumen, habilitación de efectos y reproducción.
 */

import { VOLUMEN_INICIAL } from './configuracion.js';

class GestorAudio {
  constructor() {
    const rutaRecursos = '../../Assets/Assets Sonidos/';

    this.efectosActivados = true;
    this.volumenGeneral = VOLUMEN_INICIAL;
    this.volumenMusica = VOLUMEN_INICIAL;
    this.ultimoHover = 0;

    this.sonidos = {
      hover: new Audio(`${rutaRecursos}SonidoBoton.mp3`),
      click: new Audio(`${rutaRecursos}SonidoClick.mp3`),
      hojas: new Audio(`${rutaRecursos}SonidoHojas.mp3`)
    };

    Object.values(this.sonidos).forEach((sonido) => {
      sonido.preload = 'auto';
    });

    // El efecto de hojas se reproduce una sola vez al abrir/cerrar un diario.
    this.sonidos.hojas.loop = false;
    this.aplicarVolumenes();
  }

  aplicarVolumenes() {
    const maestro = this.volumenGeneral / 100;
    this.sonidos.hover.volume = Math.min(1, maestro * 0.55);
    this.sonidos.click.volume = Math.min(1, maestro * 0.75);
    this.sonidos.hojas.volume = Math.min(
      1,
      maestro * (this.volumenMusica / 100) * 0.22
    );
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

  reproducirHover() {
    if (!this.efectosActivados) return;

    const ahora = performance.now();
    if (ahora - this.ultimoHover < 70) return;
    this.ultimoHover = ahora;
    this.reproducir('hover');
  }

  reproducirClick() {
    this.reproducir('click');
  }

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
