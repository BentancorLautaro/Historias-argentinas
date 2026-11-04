/**
 * Gestiona la mecánica de interrogatorio del Nivel 2.
 * Su responsabilidad termina cuando los cuatro personajes fueron
 * interrogados por completo, igual que GestorDiarios termina cuando se
 * recolectan los cuatro diarios del Nivel 1.
 *
 * A diferencia del Nivel 1, cada personaje no abre un modal dentro del
 * mismo escenario: lleva a una pantalla completa propia, con su propia
 * ambientación, donde se juega una mecánica distinta (secuencia,
 * bifurcaciones, tono o versos). Este gestor no conoce los detalles de
 * cada mecánica: solo decide qué clase instanciar según
 * personaje.tipoMecanica y en qué escena montarla, y escucha su callback
 * onPista.
 */

import { alternarPantalla, establecerTexto } from '../Compartido/interfaz.js';
import { MecanicaRastreador } from '../Nivel 2/mecanicaRastreador.js';
import { MecanicaBaqueano } from '../Nivel 3/mecanicaBaqueano.js';
import { MecanicaGauchoMalo } from './mecanicaGauchoMalo.js';
import { MecanicaCantor } from './mecanicaCantor.js';
import { mostrarIntroduccion } from '../Compartido/introducciones.js';

// Relaciona cada "tipoMecanica" de datosNivelDos.js con su clase de mecánica.
const CLASES_POR_TIPO_MECANICA = {
  rastreador: MecanicaRastreador,
  baqueano: MecanicaBaqueano,
  gauchoMalo: MecanicaGauchoMalo,
  cantor: MecanicaCantor
};

class GestorInterrogatorio {
  constructor({ elementos, estado, personajes, audio, alCompletarTodos }) {
    this.elementos = elementos;
    this.estado = estado;
    this.personajes = personajes;
    this.audio = audio;
    this.alCompletarTodos = alCompletarTodos;
    this.mecanicaActual = null;
    this.escenaActual = null;
  }

  /** Conecta los eventos de clic/hover de los personajes y el botón de volver de cada escena. */
  inicializarEventos() {
    document.querySelectorAll('.personaje').forEach((boton) => {
      boton.addEventListener('click', () => {
        if (!boton.classList.contains('personaje-cerca')) {
          establecerTexto(this.elementos.pistaInteraccion, 'ACERCATE AL PERSONAJE PARA PODER HABLAR');
          return;
        }
        this.abrirPersonaje(Number(boton.dataset.personaje));
      });
      boton.addEventListener('mouseenter', () => this.audio.reproducirHover());
    });

    Object.values(this.elementos.escenasMecanica).forEach((escena) => {
      escena.botonVolver.addEventListener('click', () => this.volverALaPulperia());
    });
  }

  /** Prepara el estado inicial de la escena y muestra la pista de interacción. */
  iniciar() {
    this.estado.pistasActuales.clear();
    this.actualizarProgreso();
    establecerTexto(this.elementos.pistaInteraccion, 'ACERCATE A UN HABITANTE Y PRESIONÁ ESPACIO PARA HABLAR');
  }

  /** Interactúa con personajes del mapa; Don Eusebio solo entrega una misión. */
  abrirPersonaje(indice, introduccionMostrada = false) {
    // La misión del Baqueano se realiza conversando con tres vecinos nuevos del pueblo.
    if (indice === 1) {
      if (this.estado.misionBaqueanoPendienteInforme) {
        this.mostrarDialogoMapa('DON EUSEBIO · EL BAQUEANO', '¿Y bien? Los testimonios de Doña Jacinta, Mateo y Tomasa no coinciden en todos los detalles, pero juntos permiten reconstruir el recorrido de la recua. La referencia al vado, las huellas hacia el monte y el sendero bajo forman una explicación más sólida que cualquier relato aislado. Buen trabajo: comparaste versiones y encontraste una ruta probable.', () => {
          this.estado.misionBaqueanoPendienteInforme = false;
          this.estado.misionBaqueanoCompletada = true;
          this.estado.personajesInterrogados.add(1);
          document.querySelector('.personaje[data-personaje="1"]')?.classList.add('interrogado');
          this.actualizarProgreso();
          if (this.estado.personajesInterrogados.size === this.personajes.length) this.alCompletarTodos();
        });
        return;
      }
      if (this.estado.misionBaqueanoCompletada) {
        this.mostrarDialogoMapa('DON EUSEBIO · EL BAQUEANO', 'Ya me informaste lo que descubriste. Cada testimonio aportó una pista distinta para reconstruir el recorrido.');
        return;
      }
      if (!this.estado.misionBaqueanoIniciada) {
        this.estado.misionBaqueanoIniciada = true;
        this.estado.misionBaqueanoActiva = true;
        this.estado.misionBaqueanoHablados = new Set();
        this.mostrarDialogoMapa('DON EUSEBIO · EL BAQUEANO', 'Necesito que averigües qué pasó con una recua de mulas que nunca llegó al pueblo. Hablá con tres vecinos que suelen andar por acá: Doña Jacinta, la pulpera; Mateo, el arriero; y Tomasa, la curandera. Cada uno sabe una parte distinta. Acercate a ellos y presioná ESPACIO.');
      } else if (this.estado.misionBaqueanoActiva) {
        this.mostrarDialogoMapa('DON EUSEBIO · EL BAQUEANO', `Todavía te faltan testimonios. Ya hablaste con ${this.estado.misionBaqueanoHablados.size} de 3 vecinos: Doña Jacinta, Mateo y Tomasa.`);
      }
      return;
    }

    if ([4, 5, 6].includes(indice) && !this.estado.misionBaqueanoIniciada) {
      this.mostrarDialogoMapa('VECINO DEL PUEBLO', 'Estoy ocupado con mis cosas. Si necesitás algo, primero hablá con Don Eusebio, el Baqueano.');
      return;
    }

    // Mientras el encargo está activo, hablar con los NPC nuevos registra
    // testimonios mediante diálogos propios, no solo mensajes en la barra HUD.
    if (this.estado.misionBaqueanoActiva && [4, 5, 6].includes(indice)) {
      this.registrarTestimonioBaqueano(indice);
      return;
    }

    // Una misión activa bloquea el inicio de cualquier otra.
    if (this.estado.misionRastreadorActiva && indice !== this.estado.personajeActual) {
      establecerTexto(this.elementos.pistaInteraccion, 'TENÉS UNA MISIÓN EN CURSO. Completala antes de aceptar otra.');
      return;
    }
    if (this.estado.personajesInterrogados.has(indice)) {
      // Cirilo sigue disponible después de recoger las tres pistas: el jugador
      // puede volver a hablarle y recibir una confirmación, sin reiniciar la misión.
      if (indice === 0 && this.estado.misionRastreadorPendienteEntrega) {
        // La misión solo se completa cuando el jugador vuelve a hablar con Cirilo.
        this.estado.misionRastreadorPendienteEntrega = false;
        this.estado.misionRastreadorCompletada = true;
        document.querySelector('#mundo-dos .rastreador-aviso-mapa')?.remove();
        this.mostrarDialogoMapa(
          'CIRILO · EL RASTREADOR',
          '¡Buen trabajo! Me trajiste las tres hojas. El encargo está completo. Ahora podés revisar las pistas en tu registro y compararlas con los testimonios de los demás habitantes.'
        );
      } else if (indice === 0) {
        this.mostrarDialogoMapa('CIRILO · EL RASTREADOR', '¿Encontraste las tres hojas que escondí por el pueblo? Volvé a hablarme cuando las tengas todas.');
      }
      return;
    }

    const personaje = this.personajes[indice];
    if (!introduccionMostrada && personaje) {
      const contextos = {
        rastreador: 'En el mundo rural de los Llanos, antes de que existieran mapas precisos o comunicaciones rápidas, las huellas podían revelar movimientos que nadie había visto. Cirilo conoce ese lenguaje del suelo y aporta una cronología de las decisiones de Facundo. Por eso el desafío consiste en ordenar rastros: no alcanza con encontrar una marca, hay que interpretar qué ocurrió antes y después.',
        baqueano: 'Don Eusebio representa a quienes conocían caminos, aguadas, pasos y refugios mejor que cualquier mapa. En el capítulo, ese saber territorial ayuda a entender cómo Facundo podía desplazarse por los Llanos y evitar a sus perseguidores. Las bifurcaciones te hacen decidir usando señales del ambiente: el territorio también es una fuente de información histórica.',
        gauchoMalo: 'El Chileno vive fuera de la ley y conoce la desconfianza, la persecución y los códigos de quienes sobreviven al margen de la autoridad. Facundo también dependió de alianzas y refugios en momentos en que era perseguido. El desafío presenta decisiones bajo presión para que evalúes cómo la reputación de una persona, sus intereses y el contexto condicionan lo que hace y lo que cuenta.',
        cantor: 'El cantor conserva y transmite historias mediante versos, payadas y memoria oral, en una época en que gran parte de la población no dejaba sus experiencias por escrito. En el capítulo, su voz permite conocer cómo se construyen la fama y la leyenda de Facundo, pero una canción también expresa una mirada particular. El contrapunto de cartas convierte esa disputa por la memoria en un desafío de palabras, argumentos y réplicas.'
      };
      const descripciones = {
        rastreador: 'Ordenar las huellas permite practicar la reconstrucción cronológica a partir de indicios.',
        baqueano: 'Elegir caminos obliga a interpretar el terreno como evidencia y comprender la importancia de la geografía.',
        gauchoMalo: 'Resolver situaciones permite pensar cómo el contexto social, la persecución y la reputación influyen en las decisiones.',
        cantor: 'Responder con versos representa el contrapunto y la memoria oral, diferenciando un relato de una prueba documental.'
      };
      mostrarIntroduccion({
        etiqueta: 'CAPÍTULO 2 · CONTEXTO DEL PERSONAJE',
        titulo: personaje.nombre,
        texto: `${personaje.presentacion || 'Este personaje conserva una parte de la memoria del pueblo.'}\n\nSU LUGAR EN LA HISTORIA: ${contextos[personaje.tipoMecanica] || 'Este testigo ofrece una perspectiva particular sobre Facundo y su época.'}\n\n¿POR QUÉ ESTE DESAFÍO? ${descripciones[personaje.tipoMecanica] || 'La actividad representa la forma particular en que este personaje aporta información.'}\n\nOBJETIVO: ${personaje.datosMecanica?.instruccion || 'Conseguí sus pistas y comparalas con las de los demás testigos.'}`,
        boton: 'JUGAR ESTE MINIJUEGO',
        alContinuar: () => this.abrirPersonaje(indice, true)
      });
      return;
    }

    this.estado.personajeActual = indice;
    this.estado.pistasActuales.clear();
    this.escenaActual = this.elementos.escenasMecanica[personaje.tipoMecanica];
    alternarPantalla(this.elementos.juegoPantalla, false);
    this.iniciarMecanica(personaje);
    alternarPantalla(this.escenaActual.raiz, true);
  }

  registrarTestimonioBaqueano(indice) {
    this.estado.misionBaqueanoHablados ??= new Set();
    const nombres = { 4: 'DOÑA JACINTA · LA PULPERA', 5: 'MATEO · EL ARRIERO', 6: 'TOMASA · LA CURANDERA' };
    const dialogos = {
      4: '“La recua salió al amanecer. El capataz dijo que iba a tomar el camino del norte, pero al mediodía volvió un muchacho preguntando por el sendero del arroyo. Algo no le cerraba.”',
      5: '“Vi las mulas cerca del vado, aunque no cruzaron por donde cruza todo el mundo. Había huellas que se desviaban hacia el monte. Si buscás la recua, seguí ese rastro y no el camino ancho.”',
      6: '“Uno de los arrieros vino lastimado y pidió agua. Tenía barro oscuro en las botas y espinas de jarilla en el poncho: eso solo se encuentra en el sendero bajo, detrás del algarrobal.”'
    };
    if (this.estado.misionBaqueanoHablados.has(indice)) {
      this.mostrarDialogoMapa(nombres[indice], 'Ya te conté lo que sé de la recua perdida. ¿Pudiste hablar con los otros vecinos?');
      return;
    }
    this.estado.misionBaqueanoHablados.add(indice);
    document.querySelector(`.personaje[data-personaje="${indice}"]`)?.classList.add('interrogado');
    const cantidad = this.estado.misionBaqueanoHablados.size;
    if (cantidad >= 3) {
      this.estado.misionBaqueanoActiva = false;
      this.estado.misionBaqueanoPendienteInforme = true;
      this.actualizarProgreso();
      this.mostrarDialogoMapa(nombres[indice], `${dialogos[indice]}\n\nYa reuniste los tres testimonios. Ahora volvé con Don Eusebio para contarle lo que descubriste y comparar las pistas.`);
    } else {
      this.actualizarProgreso();
      this.mostrarDialogoMapa(nombres[indice], `${dialogos[indice]}\n\nTestimonios reunidos: ${cantidad}/3. Te falta hablar con los otros vecinos.`);
    }
  }

  mostrarDialogoMapa(nombre, texto, alCerrar = null) {
    const pantalla = this.elementos.juegoPantalla;
    pantalla.querySelector('.dialogo-mision-baqueano')?.remove();
    const dialogo = document.createElement('div');
    dialogo.className = 'dialogo-mision-baqueano';
    Object.assign(dialogo.style, {
      position: 'absolute', inset: 'auto 8% 8% 8%', zIndex: '10000',
      padding: '22px 26px', background: 'rgba(19, 25, 29, .96)',
      color: '#f7edcf', border: '2px solid #c9a96e', borderRadius: '12px',
      boxShadow: '0 10px 35px rgba(0,0,0,.55)', maxWidth: '900px', margin: '0 auto',
      fontFamily: 'inherit'
    });
    const titulo = document.createElement('h3');
    titulo.textContent = nombre;
    Object.assign(titulo.style, { margin: '0 0 10px', color: '#e7c783' });
    const cuerpo = document.createElement('p');
    cuerpo.textContent = texto;
    Object.assign(cuerpo.style, { whiteSpace: 'pre-line', lineHeight: '1.55', margin: '0 0 16px' });
    const cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.textContent = 'SEGUIR';
    cerrar.addEventListener('click', () => { dialogo.remove(); if (alCerrar) alCerrar(); });
    Object.assign(cerrar.style, { padding: '9px 20px', cursor: 'pointer', fontWeight: 'bold' });
    dialogo.append(titulo, cuerpo, cerrar);
    pantalla.appendChild(dialogo);
  }

  /** Instancia la mecánica de juego propia de este personaje y la dibuja en su escena. */
  iniciarMecanica(personaje) {
    const ClaseMecanica = CLASES_POR_TIPO_MECANICA[personaje.tipoMecanica];

    this.mecanicaActual = new ClaseMecanica({
      contenedor: this.escenaActual.contenedor,
      datos: personaje.datosMecanica,
      audio: this.audio,
      estado: this.estado,
      onPista: (indicePista) => this.recolectarPista(indicePista)
    });

    establecerTexto(this.escenaActual.progreso, `0 / ${this.mecanicaActual.obtenerTotalPistas()} PISTAS`);
    this.escenaActual.progreso.classList.remove('complete');
    this.mecanicaActual.render();
  }

  establecerPausa(pausado) {
    this.mecanicaActual?.establecerPausa?.(pausado);
  }

  detener() {
    this.mecanicaActual?.limpiar?.();
    this.mecanicaActual = null;
    this.escenaActual = null;
  }

  /** Suma una pista al progreso del personaje actual, sin importar qué mecánica la generó. */
  recolectarPista(indice) {
    if (this.estado.pistasActuales.has(indice)) return;

    this.estado.pistasActuales.add(indice);

    const total = this.mecanicaActual.obtenerTotalPistas();
    const actual = this.estado.pistasActuales.size;

    establecerTexto(this.escenaActual.progreso, `${actual} / ${total} PISTAS`);

    if (actual === total) {
      this.escenaActual.progreso.classList.add('complete');
      // Se marca automáticamente al personaje como interrogado al reunir sus pistas.
      this.recolectarPersonaje();
    }
  }

  /** Marca al personaje actual como completamente interrogado. */
  recolectarPersonaje() {
    const total = this.mecanicaActual.obtenerTotalPistas();
    if (this.estado.pistasActuales.size !== total) return;
    if (this.estado.personajesInterrogados.has(this.estado.personajeActual)) return;

    this.estado.personajesInterrogados.add(this.estado.personajeActual);
    document
      .querySelector(`.personaje[data-personaje="${this.estado.personajeActual}"]`)
      ?.classList.add('interrogado');

    this.actualizarProgreso();
    this.audio.reproducirClick();
  }

  /** Actualiza el contador y la barra de progreso de personajes interrogados. */
  actualizarProgreso() {
    const total = this.personajes.length;
    const actual = this.estado.personajesInterrogados.size;
    establecerTexto(this.elementos.progresoPersonajes, `${actual} / ${total} PERSONAJES INTERROGADOS`);
    this.elementos.barraPersonajes.style.width = `${(actual / total) * 100}%`;
  }

  /** Cierra el minijuego actual, vuelve a la pulpería y avanza al cuestionario si ya no falta nadie. */
  volverALaPulperia() {
    this.audio.detenerPayada();
    this.mecanicaActual?.limpiar?.();
    if (this.escenaActual) alternarPantalla(this.escenaActual.raiz, false);
    this.escenaActual = null;
    this.mecanicaActual = null;
    alternarPantalla(this.elementos.juegoPantalla, true);
    this.audio.reproducirClick();

    if (this.estado.personajesInterrogados.size === this.personajes.length) {
      this.alCompletarTodos();
    }
  }
}

export { GestorInterrogatorio };
