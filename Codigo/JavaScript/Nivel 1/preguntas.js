/**
 * Gestiona el cuestionario posterior a la lectura.
 * Renderiza preguntas, muestra retroalimentación y registra la puntuación.
 */

import { mostrar, ocultar, establecerTexto } from '../Compartido/interfaz.js';

class GestorPreguntas {
  constructor({ elementos, estado, preguntas, audio, alFinalizar }) {
    this.elementos = elementos;
    this.estado = estado;
    this.preguntas = preguntas;
    this.audio = audio;
    this.alFinalizar = alFinalizar;
    this.opcionesActuales = [];
    this.respuestaCorrectaActual = 0;
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
    // Mezcla las opciones en cada pregunta, conservando cuál es la correcta.
    this.opcionesActuales = pregunta.options.map((texto, indiceOriginal) => ({ texto, indiceOriginal }));
    for (let i = this.opcionesActuales.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.opcionesActuales[i], this.opcionesActuales[j]] = [
        this.opcionesActuales[j], this.opcionesActuales[i]
      ];
    }
    this.respuestaCorrectaActual = this.opcionesActuales.findIndex(
      (opcion) => opcion.indiceOriginal === pregunta.answer
    );

    this.elementos.contenidoCuestionario.innerHTML = `
      <div class="quiz-number">PREGUNTA ${this.estado.indicePregunta + 1} / ${this.preguntas.length}</div>
      <h3>${pregunta.q}</h3>
      <div class="quiz-options">
        ${this.opcionesActuales.map((opcion, indice) => `<button type="button" data-answer="${indice}">${opcion.texto}</button>`).join('')}
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
    const respuestaCorrecta = this.respuestaCorrectaActual;
    const botones = [...this.elementos.contenidoCuestionario.querySelectorAll('.quiz-options button')];

    botones.forEach((boton) => { boton.disabled = true; });

    botones[respuesta]?.classList.add(
      respuesta === respuestaCorrecta ? 'correct' : 'wrong'
    );

    if (respuesta === respuestaCorrecta) {
      this.estado.puntuacionPreguntas += 1;
      establecerTexto(this.elementos.retroalimentacionCuestionario, `CORRECTO · ${pregunta.explain}`);
    } else {
      botones[respuestaCorrecta]?.classList.add('correct');
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
