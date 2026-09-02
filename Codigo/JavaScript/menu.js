/**
 * Navega entre menú principal, niveles, créditos y configuración.
 * El desbloqueo persistente se delega en persistencia.js.
 */

import {
  NIVEL_MAXIMO,
  CLAVE_NIVEL_DESBLOQUEADO
} from './configuracion.js';
import {
  obtenerNivelDesbloqueado,
  guardarNivelDesbloqueado
} from './persistencia.js';
import { GestorAjustes } from './ajustes.js';
import { alternarPantalla } from './interfaz.js';

class GestorMenu {
  constructor(audio, alIniciarNivel) {
    this.audio = audio;
    this.alIniciarNivel = alIniciarNivel;
    this.claveAlmacenamiento = CLAVE_NIVEL_DESBLOQUEADO;

    this.pantallaInicio = document.getElementById('start-screen');
    this.pantallaNiveles = document.getElementById('level-select-screen');
    this.pantallaCreditos = document.getElementById('credits-screen');
    this.pantallaAjustes = document.getElementById('settings-screen');
    this.retroalimentacion = document.getElementById('level-select-feedback');

    this.gestorAjustes = new GestorAjustes(this.audio);
    this.inicializarEventos();
    this.gestorAjustes.inicializar();
    this.actualizarTarjetas();
  }

  obtenerNivelDesbloqueado() {
    return obtenerNivelDesbloqueado();
  }

  establecerNivelDesbloqueado(nivel) {
    guardarNivelDesbloqueado(nivel);
    this.actualizarTarjetas();
  }

  actualizarTarjetas() {
    const desbloqueado = this.obtenerNivelDesbloqueado();

    document.querySelectorAll('.level-card').forEach((tarjeta) => {
      const nivel = Number(tarjeta.dataset.level);
      const habilitado = nivel <= desbloqueado;

      tarjeta.classList.toggle('is-locked', !habilitado);
      tarjeta.classList.toggle('is-unlocked', habilitado);
      tarjeta.setAttribute('aria-disabled', String(!habilitado));

      const estado = tarjeta.querySelector('.level-card-status');
      if (estado) estado.textContent = habilitado ? 'DESBLOQUEADO' : 'BLOQUEADO';
    });
  }

  inicializarEventos() {
    document.getElementById('btn-play').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.mostrarSeleccionNiveles();
    });

    document.getElementById('btn-credits').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.navegarA(this.pantallaCreditos);
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.navegarA(this.pantallaAjustes);
    });

    document.getElementById('btn-back-credits').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.navegarA(this.pantallaInicio);
    });

    document.getElementById('btn-back-settings').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.navegarA(this.pantallaInicio);
    });

    document.getElementById('btn-back-levels').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.retroalimentacion.textContent = '';
      this.navegarA(this.pantallaInicio);
    });

    document.querySelectorAll('.level-card').forEach((tarjeta) => {
      tarjeta.addEventListener('click', () => this.seleccionarNivel(Number(tarjeta.dataset.level)));
    });

    document.querySelectorAll('button').forEach((boton) => {
      boton.addEventListener('mouseenter', () => this.audio.reproducirHover());
    });
  }

  seleccionarNivel(nivel) {
    const desbloqueado = this.obtenerNivelDesbloqueado();

    if (nivel > desbloqueado) {
      this.audio.reproducirClick();
      this.retroalimentacion.textContent = `NIVEL ${nivel} BLOQUEADO · COMPLETÁ EL NIVEL ${nivel - 1} PARA DESBLOQUEARLO`;
      return;
    }

    this.audio.reproducirClick();
    this.retroalimentacion.textContent = '';
    this.alIniciarNivel(nivel);
  }

  mostrarSeleccionNiveles() {
    this.retroalimentacion.textContent = '';
    this.actualizarTarjetas();
    this.navegarA(this.pantallaNiveles);
  }

  mostrarSeleccionTrasCompletar(nivelCompletado) {
    const siguiente = Number(nivelCompletado) + 1;
    if (siguiente <= NIVEL_MAXIMO) this.establecerNivelDesbloqueado(siguiente);
    this.mostrarSeleccionNiveles();
  }

  navegarA(pantallaObjetivo) {
    [this.pantallaInicio, this.pantallaNiveles, this.pantallaCreditos, this.pantallaAjustes]
      .forEach((pantalla) => alternarPantalla(pantalla, false));
    alternarPantalla(pantallaObjetivo, true);
  }
}

export { GestorMenu };
