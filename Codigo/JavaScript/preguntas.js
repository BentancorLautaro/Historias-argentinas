/**
 * Gestiona el cuestionario posterior a la lectura.
 * Renderiza preguntas, muestra retroalimentación y registra la puntuación.
 */

import { mostrar, ocultar, establecerTexto } from './interfaz.js';

class GestorPreguntas {
  constructor({ elementos, estado, preguntas, audio, alFinalizar }) {
    this.elementos = elementos;
    this.estado = estado;
    this.preguntas = preguntas;
    this.audio = audio;
    this.alFinalizar = alFinalizar;
  }

  inicializarEventos() {
    this.elementos.botonSiguientePregunta.addEventListener('click', () => this.siguientePregunta());
  }

  abrir() {
    this.estado.indicePregunta = 0;
    this.estado.puntuacionPreguntas = 0;
    mostrar(this.elementos.cuestionarioModal);
    this.renderizarPregunta();
  }

  renderizarPregunta() {
    const pregunta = this.preguntas[this.estado.indicePregunta];

    this.elementos.contenidoCuestionario.innerHTML = `
      <div class="quiz-number">PREGUNTA ${this.estado.indicePregunta + 1} / ${this.preguntas.length}</div>
      <h3>${pregunta.q}</h3>
      <div class="quiz-options">
        ${pregunta.options.map((opcion, indice) => `<button type="button" data-answer="${indice}">${opcion}</button>`).join('')}
      </div>
    `;

    establecerTexto(this.elementos.retroalimentacionCuestionario, '');
    ocultar(this.elementos.botonSiguientePregunta);

    this.elementos.contenidoCuestionario.querySelectorAll('button').forEach((boton) => {
      boton.addEventListener('mouseenter', () => this.audio.reproducirHover());
      boton.addEventListener('click', () => {
        this.audio.reproducirClick();
        this.responder(Number(boton.dataset.answer));
      });
    });
  }

  responder(respuesta) {
    const pregunta = this.preguntas[this.estado.indicePregunta];
    const botones = [...this.elementos.contenidoCuestionario.querySelectorAll('.quiz-options button')];

    botones.forEach((boton) => { boton.disabled = true; });

    botones[respuesta]?.classList.add(
      respuesta === pregunta.answer ? 'correct' : 'wrong'
    );

    if (respuesta === pregunta.answer) {
      this.estado.puntuacionPreguntas += 1;
      establecerTexto(this.elementos.retroalimentacionCuestionario, `CORRECTO · ${pregunta.explain}`);
    } else {
      botones[pregunta.answer]?.classList.add('correct');
      establecerTexto(this.elementos.retroalimentacionCuestionario, `PARA AVANZAR: ${pregunta.explain}`);
    }

    establecerTexto(
      this.elementos.botonSiguientePregunta,
      this.estado.indicePregunta === this.preguntas.length - 1 ? 'IR AL TABLERO' : 'SIGUIENTE'
    );
    mostrar(this.elementos.botonSiguientePregunta);
  }

  siguientePregunta() {
    if (this.estado.indicePregunta < this.preguntas.length - 1) {
      this.estado.indicePregunta += 1;
      this.renderizarPregunta();
      return;
    }

    ocultar(this.elementos.cuestionarioModal);
    this.alFinalizar();
  }
}

export { GestorPreguntas };
