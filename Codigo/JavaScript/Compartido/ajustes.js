/**
 * Gestiona exclusivamente la pantalla de configuración.
 * Mantiene separados los controles de audio y preferencias de la navegación.
 */

class GestorAjustes {
  constructor(audio) {
    this.audio = audio;
  }

  inicializar() {
    const volumenGeneral = document.getElementById('general-volume');
    const volumenMusica = document.getElementById('music-volume');
    const efectosActivados = document.getElementById('effects-on');
    const efectosDesactivados = document.getElementById('effects-off');

    [volumenGeneral, volumenMusica].forEach((rango) => {
      this.actualizarRango(rango);
      rango.addEventListener('input', () => this.actualizarRango(rango));
    });

    volumenGeneral.addEventListener('input', () => this.audio.establecerVolumenGeneral(volumenGeneral.value));
    volumenMusica.addEventListener('input', () => this.audio.establecerVolumenMusica(volumenMusica.value));

    efectosActivados.addEventListener('click', () => {
      this.establecerEstadoEfectos(true, efectosActivados, efectosDesactivados);
    });

    efectosDesactivados.addEventListener('click', () => {
      this.establecerEstadoEfectos(false, efectosActivados, efectosDesactivados);
    });

  }

  actualizarRango(rango) {
    rango.style.setProperty('--range-value', `${rango.value}%`);
  }

  establecerEstadoEfectos(activados, botonActivado, botonDesactivado) {
    this.audio.establecerEfectosActivados(activados);
    botonActivado.classList.toggle('is-selected', activados);
    botonDesactivado.classList.toggle('is-selected', !activados);
  }
}

export { GestorAjustes };
