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
import { eliminarPartidaGuardada } from './persistencia.js';

class GestorMenu {
  constructor(audio, alIniciarNivel) {
    this.audio = audio;
    this.alIniciarNivel = alIniciarNivel;
    this.claveAlmacenamiento = CLAVE_NIVEL_DESBLOQUEADO;
    this.claveNivelesCompletados = 'facundo-niveles-completados';

    this.pantallaInicio = document.getElementById('start-screen');
    this.pantallaNiveles = document.getElementById('level-select-screen');
    this.pantallaCreditos = document.getElementById('credits-screen');
    this.pantallaAjustes = document.getElementById('settings-screen');
    this.pantallaAyuda = document.getElementById('help-screen');
    this.retroalimentacion = document.getElementById('level-select-feedback');

    this.gestorAjustes = new GestorAjustes(this.audio);
    this.contadorToquesSecreto = 0;
    this.ordenarTarjetasPorNivel();
    this.inicializarEventos();
    this.gestorAjustes.inicializar();
    this.actualizarTarjetas();
  }

  obtenerNivelDesbloqueado() {
    return obtenerNivelDesbloqueado();
  }

  ordenarTarjetasPorNivel() {
    const contenedor = document.getElementById('level-grid');
    if (!contenedor) return;
    const tarjetas = [...contenedor.querySelectorAll('.level-card-wrapper')];
    tarjetas.sort((a, b) => Number(a.dataset.levelWrapper) - Number(b.dataset.levelWrapper));
    tarjetas.forEach((tarjeta) => contenedor.appendChild(tarjeta));
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

      const completado = this.obtenerNivelesCompletados().includes(nivel);
      const estado = tarjeta.querySelector('.level-card-status');
      if (estado) estado.textContent = completado ? 'COMPLETADO' : (habilitado ? 'DESBLOQUEADO' : 'BLOQUEADO');
      const repetir = document.querySelector(`[data-repeat-level="${nivel}"]`);
      if (repetir) repetir.hidden = !completado;
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

    document.getElementById('btn-help').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.navegarA(this.pantallaAyuda);
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.navegarA(this.pantallaAjustes);
    });

    document.getElementById('btn-back-credits').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.navegarA(this.pantallaInicio);
    });

    document.getElementById('btn-back-help').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.navegarA(this.pantallaInicio);
    });

    document.getElementById('btn-back-settings').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.navegarA(this.pantallaInicio);
    });

    // El acceso de testing no se muestra hasta pulsar cinco veces el título.
    const tituloConfiguracion = this.pantallaAjustes.querySelector('.secondary-header');
    const panelTesting = document.getElementById('testing-secret');
    const campoCodigo = document.getElementById('testing-code');
    const feedbackTesting = document.getElementById('testing-feedback');
    if (tituloConfiguracion && panelTesting) {
      tituloConfiguracion.title = 'Configuración';
      tituloConfiguracion.style.cursor = 'default';
      tituloConfiguracion.addEventListener('click', () => {
        this.contadorToquesSecreto += 1;
        if (this.contadorToquesSecreto >= 5) {
          panelTesting.hidden = false;
          this.contadorToquesSecreto = 0;
          if (campoCodigo) campoCodigo.focus();
        }
      });
    }
    document.getElementById('testing-unlock')?.addEventListener('click', () => {
      if (!campoCodigo || !feedbackTesting) return;
      if (campoCodigo.value.trim() !== '1010') {
        feedbackTesting.textContent = 'Código incorrecto.';
        campoCodigo.select();
        return;
      }
      this.establecerNivelDesbloqueado(NIVEL_MAXIMO);
      feedbackTesting.textContent = 'Modo testing activado: todos los niveles están desbloqueados en este navegador.';
      campoCodigo.value = '';
      this.audio.reproducirClick();
    });
    campoCodigo?.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter') document.getElementById('testing-unlock')?.click();
    });

    document.getElementById('btn-back-levels').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.retroalimentacion.textContent = '';
      this.navegarA(this.pantallaInicio);
    });

    document.querySelectorAll('.level-card').forEach((tarjeta) => {
      tarjeta.addEventListener('click', () => this.seleccionarNivel(Number(tarjeta.dataset.level)));
    });

    document.querySelectorAll('[data-repeat-level]').forEach((boton) => {
      boton.addEventListener('click', (evento) => {
        evento.stopPropagation();
        const nivel = Number(boton.dataset.repeatLevel);
        this.audio.reproducirClick();
        this.retroalimentacion.textContent = '';
        // Repetir debe empezar desde cero, no restaurar el guardado de la partida anterior.
        eliminarPartidaGuardada();
        try { sessionStorage.removeItem('facundo-nivel-en-curso'); } catch (_) {}
        this.alIniciarNivel(nivel);
      });
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
    try {
      sessionStorage.removeItem('facundo-nivel-en-curso');
      sessionStorage.setItem('facundo-pantalla-actual', 'seleccion');
    } catch (_) {}
    this.retroalimentacion.textContent = '';
    this.actualizarTarjetas();
    this.navegarA(this.pantallaNiveles);
  }

  obtenerNivelesCompletados() {
    try {
      const datos = JSON.parse(localStorage.getItem(this.claveNivelesCompletados) || '[]');
      return Array.isArray(datos) ? datos.map(Number).filter(Number.isFinite) : [];
    } catch (_) { return []; }
  }

  marcarNivelCompletado(nivel) {
    const completados = new Set(this.obtenerNivelesCompletados());
    completados.add(Number(nivel));
    try { localStorage.setItem(this.claveNivelesCompletados, JSON.stringify([...completados])); } catch (_) {}
    this.actualizarTarjetas();
  }

  mostrarSeleccionTrasCompletar(nivelCompletado) {
    this.marcarNivelCompletado(nivelCompletado);
    const siguiente = Number(nivelCompletado) + 1;
    if (siguiente <= NIVEL_MAXIMO) this.establecerNivelDesbloqueado(siguiente);
    this.mostrarSeleccionNiveles();
  }

  navegarA(pantallaObjetivo) {
    try {
      // Solo se conserva el marcador de nivel cuando el nivel está realmente activo.
      sessionStorage.removeItem('facundo-nivel-en-curso');
      sessionStorage.setItem('facundo-pantalla-actual', pantallaObjetivo === this.pantallaNiveles ? 'seleccion' : 'menu');
    } catch (_) {}
    [this.pantallaInicio, this.pantallaNiveles, this.pantallaCreditos, this.pantallaAjustes, this.pantallaAyuda]
      .forEach((pantalla) => alternarPantalla(pantalla, false));
    alternarPantalla(pantallaObjetivo, true);
  }
}

export { GestorMenu };
