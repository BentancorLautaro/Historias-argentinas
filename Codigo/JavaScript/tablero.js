/**
 * Gestiona el tablero de investigación y las tríadas de recortes.
 * Encapsula selección, validación, progreso y finalización del tablero.
 */

import { mostrar, ocultar, establecerTexto } from './interfaz.js';

class GestorTablero {
  constructor({ elementos, estado, grupos, recortes, audio, alFinalizar }) {
    this.elementos = elementos;
    this.estado = estado;
    this.grupos = grupos;
    this.recortes = recortes;
    this.audio = audio;
    this.alFinalizar = alFinalizar;
  }

  inicializarEventos() {
    this.elementos.botonLimpiarTablero.addEventListener('click', () => this.limpiarSeleccion());
    this.elementos.botonContinuarTablero.addEventListener('click', () => this.continuar());
  }

  abrir() {
    ocultar(this.elementos.cuestionarioModal);
    this.estado.seleccionTablero = [];
    this.estado.gruposTableroCompletados.clear();
    this.estado.puntuacionTablero = 0;
    mostrar(this.elementos.tableroModal);
    this.renderizar();
  }

  renderizar() {
    this.estado.seleccionTablero = [];
    establecerTexto(this.elementos.retroalimentacionTablero, 'Elegí exactamente tres recortes que formen una misma idea.');
    establecerTexto(this.elementos.ideaFormada, '—');
    ocultar(this.elementos.botonContinuarTablero);

    const disponibles = this.recortes.filter(
      (recorte) => !this.estado.gruposTableroCompletados.has(recorte.groupId)
    );
    const mezclados = [...disponibles].sort(() => Math.random() - 0.5);

    this.elementos.recortesTablero.innerHTML = mezclados.map((recorte) => `
      <button type="button" class="clipping" data-id="${recorte.id}" data-group="${recorte.groupId}">
        <span class="pin"></span>
        <span class="clipping-source">${recorte.source}</span>
        <span class="clipping-text">${recorte.text}</span>
      </button>
    `).join('');

    this.elementos.recortesTablero.querySelectorAll('.clipping').forEach((tarjeta) => {
      tarjeta.addEventListener('mouseenter', () => this.audio.reproducirHover());
      tarjeta.addEventListener('click', () => this.seleccionarRecorte(tarjeta.dataset.id, tarjeta));
    });

    this.actualizarProgreso();
  }

  seleccionarRecorte(id, tarjeta) {
    if (this.estado.gruposTableroCompletados.size === this.grupos.length) return;
    if (this.estado.seleccionTablero.some((item) => item.id === id)) return;

    this.audio.reproducirClick();
    this.estado.seleccionTablero.push({ id, groupId: tarjeta.dataset.group, tarjeta });
    tarjeta.classList.add('clipping-selected');

    establecerTexto(
      this.elementos.ideaFormada,
      this.estado.seleccionTablero
        .map((item) => item.tarjeta.querySelector('.clipping-text').textContent)
        .join(' · ')
    );

    if (this.estado.seleccionTablero.length < 3) {
      establecerTexto(
        this.elementos.retroalimentacionTablero,
        `${this.estado.seleccionTablero.length} / 3 recortes elegidos. Buscá uno que complete la relación.`
      );
      return;
    }

    const mismoGrupo = this.estado.seleccionTablero.every(
      (item) => item.groupId === this.estado.seleccionTablero[0].groupId
    );

    if (mismoGrupo) this.resolverTriada();
    else this.rechazarSeleccion();
  }

  resolverTriada() {
    const grupo = this.grupos.find(
      (item) => item.id === this.estado.seleccionTablero[0].groupId
    );

    if (!grupo) return;

    this.estado.gruposTableroCompletados.add(grupo.id);
    this.estado.puntuacionTablero += 1;

    this.estado.seleccionTablero.forEach((item) => {
      item.tarjeta.disabled = true;
      item.tarjeta.classList.add('clipping-correct');
    });

    establecerTexto(this.elementos.retroalimentacionTablero, `TRÍADA CORRECTA · ${grupo.title}`);
    establecerTexto(
      this.elementos.botonContinuarTablero,
      this.estado.gruposTableroCompletados.size === this.grupos.length
        ? 'TERMINAR INVESTIGACIÓN'
        : 'SEGUIR RELACIONANDO'
    );
    mostrar(this.elementos.botonContinuarTablero);
    this.actualizarProgreso();
    this.estado.seleccionTablero = [];
  }

  rechazarSeleccion() {
    this.estado.seleccionTablero.forEach((item) => item.tarjeta.classList.add('clipping-wrong'));
    establecerTexto(
      this.elementos.retroalimentacionTablero,
      'Esos tres recortes no pertenecen a la misma relación. Probá con otra combinación.'
    );

    const seleccionTemporal = [...this.estado.seleccionTablero];
    setTimeout(() => {
      seleccionTemporal.forEach((item) => {
        item.tarjeta.classList.remove('clipping-selected', 'clipping-wrong');
      });
      this.estado.seleccionTablero = [];
      establecerTexto(this.elementos.ideaFormada, '—');
    }, 650);
  }

  continuar() {
    if (this.estado.gruposTableroCompletados.size === this.grupos.length) {
      this.finalizar();
      return;
    }

    this.renderizar();
  }

  limpiarSeleccion() {
    this.estado.seleccionTablero.forEach((item) => {
      item.tarjeta.classList.remove('clipping-selected', 'clipping-wrong');
    });
    this.estado.seleccionTablero = [];
    establecerTexto(this.elementos.ideaFormada, '—');
    establecerTexto(
      this.elementos.retroalimentacionTablero,
      'Selección limpia. Elegí tres recortes que formen una misma idea.'
    );
  }

  actualizarProgreso() {
    const completadas = this.estado.gruposTableroCompletados.size;
    const total = this.grupos.length;
    establecerTexto(this.elementos.progresoTablero, `TRÍADAS RELACIONADAS: ${completadas} / ${total}`);
    establecerTexto(this.elementos.puntuacionTablero, `${completadas} / ${total}`);
  }

  finalizar() {
    if (this.estado.gruposTableroCompletados.size !== this.grupos.length) return;
    ocultar(this.elementos.tableroModal);
    this.alFinalizar();
  }
}

export { GestorTablero };
