/**
 * Inicializa la aplicación y conecta los módulos principales.
 * Es el punto de composición donde se crean servicios y callbacks.
 */

import { GestorAudio } from './audio.js';
import { GestorMenu } from './menu.js';
import { NivelUno } from './nivelUno.js';
import { NIVEL_JUGABLE } from './configuracion.js';
import { alternarPantalla } from './interfaz.js';

function inicializarAplicacion() {
  const audio = new GestorAudio();
  let nivelActual = NIVEL_JUGABLE;
  let nivelUno = null;
  let menu = null;

  const iniciarNivel = (nivelSeleccionado) => {
    nivelActual = Number(nivelSeleccionado);

    // Solo el Nivel 1 tiene instancia jugable integrada en esta entrega.
    if (nivelActual !== NIVEL_JUGABLE) {
      const retroalimentacion = document.getElementById('level-select-feedback');
      retroalimentacion.textContent = `NIVEL ${nivelActual} DESBLOQUEADO · SU INSTANCIA JUGABLE TODAVÍA NO ESTÁ INTEGRADA`;
      return;
    }

    alternarPantalla(document.getElementById('level-select-screen'), false);

    if (!nivelUno) {
      nivelUno = new NivelUno(audio, (nivelCompletado) => {
        const pantallaJuego = document.getElementById('game-screen');
        alternarPantalla(pantallaJuego, false);
        audio.detenerHojas();
        menu.mostrarSeleccionTrasCompletar(nivelCompletado);
      });
    }

    nivelUno.iniciar();
  };

  menu = new GestorMenu(audio, iniciarNivel);
}

export { inicializarAplicacion };
