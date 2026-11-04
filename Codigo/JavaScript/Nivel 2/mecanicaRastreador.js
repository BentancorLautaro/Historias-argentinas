/**
 * Mecánica del Rastreador: Cirilo encarga la búsqueda y el jugador explora
 * un pequeño mapa para encontrar hojas con pistas. Cada hoja se abre, se lee
 * y se guarda antes de poder buscar la siguiente.
 */
const POSICIONES_HOJAS = [
  { left: '15%', top: '26%' },
  { left: '52%', top: '62%' },
  { left: '80%', top: '23%' }
];

class MecanicaRastreador {
  constructor({ contenedor, datos, audio, onPista, estado }) {
    this.contenedor = contenedor;
    this.instruccion = datos.instruccion;
    this.huellas = datos.huellas;
    this.audio = audio;
    this.onPista = onPista;
    this.estado = estado;
    this.leidaActual = null;
    this.recolectadas = new Set();
    this.hojaSeleccionada = null;
  }

  obtenerTotalPistas() { return Math.min(3, this.huellas.length); }

  render() {
    this.leidaActual = null;
    this.recolectadas.clear();
    this.mostrarEncargo();
  }

  mostrarEncargo() {
    this.contenedor.innerHTML = `
      <section class="rastreador-encargo" aria-labelledby="rastreador-encargo-titulo">
        <div class="rastreador-retrato" aria-hidden="true">🧔🏻</div>
        <p class="rastreador-dialogo-etiqueta">CIRILO · EL RASTREADOR</p>
        <h3 id="rastreador-encargo-titulo">Tengo un encargo para vos</h3>
        <p>Facundo dejó un rastro en los Llanos. Escondí exactamente tres hojas por todo el pueblo. Las tres están ahí desde el principio, pero el primer papel que encuentres siempre será la pista 1, el segundo la pista 2 y el último la pista 3.</p>
        <p class="rastreador-objetivo"><strong>Tu tarea:</strong> encontrar y leer las 3 hojas en orden.</p>
        <button type="button" class="rastreador-aceptar">ACEPTAR ENCARGO</button>
      </section>`;
    this.contenedor.querySelector('.rastreador-aceptar').addEventListener('click', () => {
      if (this.estado) this.estado.misionRastreadorActiva = true;
      this.audio.reproducirClick();
      this.mostrarHojasEnEscenario();
    });
  }

  // Las hojas aparecen dentro del mismo pueblo que el jugador ya recorre.
  // El encargo se acepta primero en el diálogo de Cirilo; recién entonces
  // se colocan los objetos interactivos sobre #mundo-dos.
  mostrarHojasEnEscenario() {
    const mundo = document.getElementById('mundo-dos');
    const pantalla = document.getElementById('game-screen-dos');
    const escena = document.getElementById('escena-rastreador');
    if (!mundo || !pantalla || !escena) return;

    escena.classList.add('hidden');
    pantalla.classList.remove('hidden');
    mundo.querySelectorAll('.rastreador-hoja-mapa, .rastreador-aviso-mapa').forEach(e => e.remove());
    document.querySelectorAll('.rastreador-lectura-mapa').forEach(e => e.remove());
    window.clearTimeout(this.temporizadorAvisoRastreador);
    if (this.teclaRastreador) window.removeEventListener('keydown', this.teclaRastreador);

    // Las tres hojas quedan sobre suelo transitable, fuera de los techos.
    // Están separadas y sin rótulos para que cueste encontrarlas.
    // Posiciones verificadas contra las zonas de colisión del mapa:
    // plaza central, camino este y claro al sur. Evitar edificios, árboles,
    // fuente, vallas y cajas para que el jugador siempre pueda acercarse.
    const posiciones = [
      { x: 490, y: 690 },
      { x: 930, y: 690 },
      { x: 1120, y: 650 }
    ];
    const aviso = document.createElement('div');
    aviso.className = 'rastreador-aviso-mapa';
    aviso.textContent = 'ENCARGO DE CIRILO: encontrá las 3 hojas en orden. Revisá bien el entorno.';
    mundo.appendChild(aviso);

    this.recolectadas.clear();
    this.leidaActual = null;
    this.hojaSeleccionada = null;
    this.huellas.slice(0, 3).forEach((hoja, indice) => {
      const hojaElemento = document.createElement('div');
      hojaElemento.className = 'rastreador-hoja-mapa';
      hojaElemento.style.left = `${(posiciones[indice].x / 1376) * 100}%`;
      hojaElemento.style.top = `${(posiciones[indice].y / 768) * 100}%`;
      hojaElemento.dataset.indice = String(indice);
      hojaElemento.setAttribute('role', 'img');
      hojaElemento.setAttribute('aria-label', `Hoja escondida ${indice + 1}; acercate y presioná E o Espacio`);
      hojaElemento.innerHTML = `<img src="/Assets/Recursos Graficos/Nivel 2/pista_rastreador.png" alt="" class="rastreador-icono-pista">`;
      // Las tres hojas están presentes desde el principio. El orden de la pista
      // depende del orden en que el jugador encuentre cualquier hoja, no de su posición.
      mundo.appendChild(hojaElemento);
      // También se puede abrir con clic, además de acercarse y pulsar E/Espacio.
      hojaElemento.addEventListener('click', () => {
        const jugador = mundo.querySelector('#jugador-mapa, #jugador-mapa-dos, #jugador, .jugador-mapa, .jugador, [data-jugador]');
        if (!jugador || this.leidaActual || this.recolectadas.size >= this.obtenerTotalPistas()) return;
        const xJugador = Number.parseFloat(jugador.style.left) || 0;
        const yJugador = (Number.parseFloat(jugador.style.top) || 0) - (jugador.offsetHeight || 80) / 2;
        const distancia = Math.hypot(hojaElemento.offsetLeft - xJugador, hojaElemento.offsetTop - yJugador);
        if (distancia <= 68) this.abrirHojaEnEscenario(this.recolectadas.size, mundo, hojaElemento);
      });
    });

    const lectura = document.createElement('div');
    lectura.className = 'rastreador-lectura-mapa hidden';
    lectura.innerHTML = `<div class="rastreador-papel-mapa" role="dialog" aria-modal="true" aria-labelledby="rastreador-hoja-mapa-titulo"><div class="rastreador-papel-ilustracion" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div><p class="rastreador-dialogo-etiqueta">DOCUMENTO ENCONTRADO</p><h3 id="rastreador-hoja-mapa-titulo">Pista</h3><p class="rastreador-texto-pista-mapa"></p><p class="rastreador-ayuda-teclas">Presioná E o ESPACIO para guardar y cerrar</p><button type="button" class="rastreador-guardar-mapa">LEÍ Y GUARDÉ LA PISTA</button></div>`;
    // El lector va en el documento, no dentro del mapa con zoom/cámara.
    document.body.appendChild(lectura);
    // E o Espacio interactúan con la hoja más cercana al jugador; dentro de la lectura guardan/cierra.
    this.teclaRastreador = (evento) => {
      const tecla = evento.key.toLowerCase();
      if (tecla !== 'e' && tecla !== ' ') return;
      if (document.documentElement.classList.contains('menu-pausa-abierto')) return;
      if (lectura.classList.contains('hidden')) {
        const jugador = mundo.querySelector('#jugador-mapa, #jugador-mapa-dos, #jugador, .jugador-mapa, .jugador, [data-jugador]');
        if (!jugador) return;
        const xJugador = Number.parseFloat(jugador.style.left) || 0;
        const yJugador = (Number.parseFloat(jugador.style.top) || 0) - (jugador.offsetHeight || 80) / 2;
        let cercana = null, distancia = Infinity;
        mundo.querySelectorAll('.rastreador-hoja-mapa:not(.rastreador-hoja-mapa-leida)').forEach((b) => {
          const d = Math.hypot(b.offsetLeft - xJugador, b.offsetTop - yJugador);
          if (d < distancia) { distancia = d; cercana = b; }
        });
        if (cercana && distancia <= 68) {
          evento.preventDefault();
          // La primera hoja encontrada entrega la pista 1, la segunda la 2, etc.
          const indicePista = this.recolectadas.size;
          this.abrirHojaEnEscenario(indicePista, mundo, cercana);
        }
      } else if (this.leidaActual !== null) {
        evento.preventDefault(); lectura.querySelector('.rastreador-guardar-mapa').click();
      }
    };
    window.addEventListener('keydown', this.teclaRastreador);
    lectura.querySelector('.rastreador-guardar-mapa').addEventListener('click', (evento) => {
      evento.preventDefault();
      evento.stopPropagation();
      if (this.leidaActual === null) return;
      const i = this.leidaActual;
      if (this.recolectadas.has(i) || !this.huellas[i]) return;
      this.recolectadas.add(i);
      this.leidaActual = null;
      lectura.classList.add('hidden');
      const b = this.hojaSeleccionada;
      if (b) b.remove();
      this.hojaSeleccionada = null;
      this.audio.detenerHojas?.();
      this.audio.reproducirClick?.();
      // La pista asignada es la siguiente del orden de encuentro, no la
      // posición física de la hoja encontrada.
      this.onPista(i, this.huellas[i].pista);
      if (this.recolectadas.size === this.obtenerTotalPistas()) {
        if (this.estado) {
          this.estado.misionRastreadorActiva = false;
          // Las pistas están reunidas, pero el encargo no se completa hasta
          // regresar con Cirilo y entregárselas.
          this.estado.misionRastreadorPendienteEntrega = true;
          this.estado.misionRastreadorCompletada = false;
        }
        // Ya no necesitamos capturar E/Espacio: devolver esas teclas al
        // controlador del mapa permite moverse y hablar con Cirilo sin quedar trabado.
        if (this.teclaRastreador) {
          window.removeEventListener('keydown', this.teclaRastreador);
          this.teclaRastreador = null;
        }
        mundo.querySelectorAll('.rastreador-hoja-mapa').forEach(e => e.remove());
        aviso.textContent = '¡Encontraste las tres hojas! Volvé a hablar con Cirilo.';
        aviso.classList.add('rastreador-aviso-completo');
        // Mantener la instrucción visible hasta que el jugador vuelva a hablar con Cirilo.
        // Así no desaparece antes de que el jugador pueda leerla.
        window.clearTimeout(this.temporizadorAvisoRastreador);
        aviso.setAttribute('role', 'status');
        aviso.setAttribute('aria-live', 'polite');
      } else {
        aviso.textContent = `ENCARGO DE CIRILO: ${this.recolectadas.size} / ${this.obtenerTotalPistas()} hojas leídas`;
      }
    });
  }

  abrirHojaEnEscenario(indice, mundo, elementoHoja) {
    if (indice >= this.obtenerTotalPistas() || this.recolectadas.has(indice)) return;
    this.leidaActual = indice;
    this.hojaSeleccionada = elementoHoja;
    const lectura = document.querySelector('.rastreador-lectura-mapa');
    lectura.querySelector('.rastreador-texto-pista-mapa').textContent = this.huellas[indice].pista;
    lectura.querySelector('#rastreador-hoja-mapa-titulo').textContent = `Pista ${indice + 1} de ${this.obtenerTotalPistas()}`;
    lectura.classList.remove('hidden');
    this.audio.reproducirHojas?.();
  }

  mostrarMapa() {
    this.contenedor.innerHTML = `
      <p class="mecanica-instruccion">Buscá las hojas en el mapa. Hacé clic en cada una para abrirla y leer la pista.</p>
      <div class="rastreador-mapa" role="group" aria-label="Mapa de búsqueda de hojas">
        <div class="rastreador-mapa-rio" aria-hidden="true"></div>
        <div class="rastreador-mapa-camino" aria-hidden="true"></div>
        ${this.huellas.map((hoja, indice) => `
          <button type="button" class="rastreador-hoja" data-indice="${indice}"
            style="left:${POSICIONES_HOJAS[indice].left};top:${POSICIONES_HOJAS[indice].top}"
            aria-label="Abrir hoja ${indice + 1}" ${this.recolectadas.has(indice) ? 'disabled' : ''}>
            <span aria-hidden="true">📜</span><small>HOJA ${indice + 1}</small>
          </button>`).join('')}
      </div>
      <div class="rastreador-lectura hidden" role="dialog" aria-modal="true" aria-labelledby="rastreador-hoja-titulo">
        <div class="rastreador-papel">
          <p class="rastreador-dialogo-etiqueta">HOJA ENCONTRADA</p>
          <h3 id="rastreador-hoja-titulo">Pista</h3>
          <p class="rastreador-texto-pista"></p>
          <button type="button" class="rastreador-guardar">LEÍ Y GUARDÉ LA PISTA</button>
        </div>
      </div>`;

    this.contenedor.querySelectorAll('.rastreador-hoja').forEach((boton) => {
      boton.addEventListener('mouseenter', () => this.audio.reproducirHover());
      boton.addEventListener('click', () => this.abrirHoja(Number(boton.dataset.indice)));
    });
  }

  abrirHoja(indice) {
    if (this.recolectadas.has(indice)) return;
    this.leidaActual = indice;
    const modal = this.contenedor.querySelector('.rastreador-lectura');
    this.contenedor.querySelector('.rastreador-texto-pista').textContent = this.huellas[indice].pista;
    this.contenedor.querySelector('#rastreador-hoja-titulo').textContent = `Pista ${indice + 1} de ${this.obtenerTotalPistas()}`;
    modal.classList.remove('hidden');
    this.audio.reproducirHojas?.();
    this.contenedor.querySelector('.rastreador-guardar').onclick = () => this.guardarHoja();
  }

  guardarHoja() {
    if (this.leidaActual === null || this.recolectadas.has(this.leidaActual)) return;
    const indice = this.leidaActual;
    this.recolectadas.add(indice);
    this.leidaActual = null;
    this.contenedor.querySelector('.rastreador-lectura').classList.add('hidden');
    const boton = this.contenedor.querySelector(`.rastreador-hoja[data-indice="${indice}"]`);
    if (boton) {
      boton.disabled = true;
      boton.classList.add('rastreador-hoja-leida');
      boton.querySelector('small').textContent = 'LEÍDA';
    }
    this.audio.detenerHojas?.();
    this.audio.reproducirClick();
    this.onPista(indice, this.huellas[indice].pista);
    if (this.recolectadas.size === this.obtenerTotalPistas()) {
      if (this.estado) this.estado.misionRastreadorActiva = false;
      const mensaje = document.createElement('p');
      mensaje.className = 'rastreador-finalizado';
      mensaje.textContent = '¡Encontraste y leíste las tres hojas! Ya reconstruiste el rastro de Facundo.';
      this.contenedor.appendChild(mensaje);
    }
  }
}

export { MecanicaRastreador };
