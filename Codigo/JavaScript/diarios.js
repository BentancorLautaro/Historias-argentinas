/**
 * Gestiona la lectura de los diarios y la recolección de frases clave.
 * Su responsabilidad termina cuando todas las fuentes fueron recolectadas.
 */

import { mostrar, ocultar, establecerTexto } from './interfaz.js';

class GestorDiarios {
  constructor({ elementos, estado, diarios, audio, alCompletarTodos }) {
    this.elementos = elementos;
    this.estado = estado;
    this.diarios = diarios;
    this.audio = audio;
    this.alCompletarTodos = alCompletarTodos;
  }

  inicializarEventos() {
    document.querySelectorAll('.newspaper').forEach((diario) => {
      diario.addEventListener('click', () => this.abrirDiario(Number(diario.dataset.paper)));
      diario.addEventListener('mouseenter', () => this.audio.reproducirHover());
    });

    this.elementos.botonCerrarDiario.addEventListener('click', () => this.cerrarDiario());
  }

  iniciar() {
    this.estado.frasesClaveActuales.clear();
    this.actualizarProgreso();
    establecerTexto(this.elementos.pistaInteraccion, 'HACÉ CLIC EN UN DIARIO PARA LEERLO');
  }

  abrirDiario(indice) {
    if (this.estado.diariosRecolectados.has(indice)) return;

    this.estado.diarioActual = indice;
    this.estado.frasesClaveActuales.clear();
    this.audio.reproducirHojas();

    const diario = this.diarios[indice];
    establecerTexto(this.elementos.tituloDiario, diario.title);
    establecerTexto(this.elementos.fechaDiario, diario.date);
    establecerTexto(this.elementos.edicionDiario, diario.issue);
    establecerTexto(this.elementos.seccionDiario, diario.kicker);
    establecerTexto(this.elementos.titularDiario, diario.headline);
    establecerTexto(this.elementos.bajadaDiario, diario.deck);

    this.renderizarContenido(diario);
    establecerTexto(this.elementos.progresoFrases, `0 / ${diario.keys.length} FRASES CLAVE`);
    this.elementos.progresoFrases.classList.remove('complete');
    mostrar(this.elementos.diarioModal);
  }

  renderizarContenido(diario) {
    const parrafos = diario.columns.flat();
    const coincidencias = [];

    diario.keys.forEach((clave, indiceClave) => {
      for (let indiceParrafo = 0; indiceParrafo < parrafos.length; indiceParrafo += 1) {
        const posicion = parrafos[indiceParrafo]
          .toLocaleLowerCase()
          .indexOf(clave.toLocaleLowerCase());

        if (posicion >= 0) {
          coincidencias.push({ indiceParrafo, posicion, clave, indiceClave });
          break;
        }
      }
    });

    const construirParrafo = (texto, indiceParrafo) => {
      const coincidencia = coincidencias.find((item) => item.indiceParrafo === indiceParrafo);

      if (!coincidencia) {
        const secundaria = indiceParrafo % 3 === 1 ? ' paper-irrelevant' : '';
        return `<p class="paper-secondary${secundaria}">${texto}</p>`;
      }

      const antes = texto.slice(0, coincidencia.posicion);
      const despues = texto.slice(coincidencia.posicion + coincidencia.clave.length);

      return `<p class="paper-relevant"><span class="paper-context">${antes}</span><button type="button" class="key-phrase" data-key="${coincidencia.indiceClave}" aria-label="Recolectar idea clave: ${coincidencia.clave}">${coincidencia.clave}</button><span class="paper-context">${despues}</span></p>`;
    };

    const mitad = Math.ceil(parrafos.length / 2);
    const izquierda = parrafos.slice(0, mitad);
    const derecha = parrafos.slice(mitad);
    const indicesIzquierda = parrafos.map((_, indice) => indice).slice(0, mitad);
    const indicesDerecha = parrafos.map((_, indice) => indice).slice(mitad);

    this.elementos.textoDiario.innerHTML = `
      <div class="paper-column">${izquierda.map((texto, indice) => construirParrafo(texto, indicesIzquierda[indice])).join('')}</div>
      <div class="paper-column">${derecha.map((texto, indice) => construirParrafo(texto, indicesDerecha[indice])).join('')}</div>
    `;

    // Respaldo para mantener siempre tres ideas seleccionables por diario.
    diario.keys.forEach((clave, indiceClave) => {
      if (!this.elementos.textoDiario.querySelector(`.key-phrase[data-key="${indiceClave}"]`)) {
        const respaldo = document.createElement('button');
        respaldo.type = 'button';
        respaldo.className = 'key-phrase key-extract';
        respaldo.dataset.key = indiceClave;
        respaldo.textContent = clave;
        respaldo.setAttribute('aria-label', `Recolectar idea clave: ${clave}`);
        this.elementos.textoDiario.appendChild(respaldo);
      }
    });

    this.elementos.textoDiario.querySelectorAll('.key-phrase').forEach((boton) => {
      boton.addEventListener('click', () => this.recolectarFraseClave(Number(boton.dataset.key)));
      boton.addEventListener('mouseenter', () => this.audio.reproducirHover());
    });
  }

  recolectarFraseClave(indice) {
    if (this.estado.frasesClaveActuales.has(indice)) return;

    this.estado.frasesClaveActuales.add(indice);
    const boton = this.elementos.textoDiario.querySelector(`.key-phrase[data-key="${indice}"]`);

    if (boton) {
      boton.classList.add('key-collected');
      boton.disabled = true;
    }

    const total = this.diarios[this.estado.diarioActual].keys.length;
    const actual = this.estado.frasesClaveActuales.size;

    establecerTexto(this.elementos.progresoFrases, `${actual} / ${total} FRASES CLAVE`);
    this.audio.reproducirClick();

    if (actual === total) {
      this.elementos.progresoFrases.classList.add('complete');
      // Se guarda automáticamente la fuente cuando se completan sus tres ideas.
      this.recolectarDiario();
    }
  }

  recolectarDiario() {
    const diario = this.diarios[this.estado.diarioActual];
    if (this.estado.frasesClaveActuales.size !== diario.keys.length) return;
    if (this.estado.diariosRecolectados.has(this.estado.diarioActual)) return;

    this.estado.diariosRecolectados.add(this.estado.diarioActual);
    document
      .querySelector(`.newspaper[data-paper="${this.estado.diarioActual}"]`)
      ?.classList.add('collected');

    this.actualizarProgreso();
    this.audio.reproducirClick();
  }

  actualizarProgreso() {
    const total = this.diarios.length;
    const actual = this.estado.diariosRecolectados.size;
    establecerTexto(this.elementos.progresoDiarios, `${actual} / ${total} DIARIOS LEÍDOS`);
    this.elementos.barraDiarios.style.width = `${(actual / total) * 100}%`;
  }

  cerrarDiario() {
    ocultar(this.elementos.diarioModal);
    this.audio.detenerHojas();
    this.audio.reproducirHojas();
    this.audio.reproducirClick();

    if (this.estado.diariosRecolectados.size === this.diarios.length) {
      this.alCompletarTodos();
    }
  }
}

export { GestorDiarios };
