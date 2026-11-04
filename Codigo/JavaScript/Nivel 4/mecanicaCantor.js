/**
 * Mecánica del Cantor: "El Cantor de la Pampa", contrapunto de cartas.
 *
 * Basado en el Capítulo 2 ("Orijinalidad i caracteres arjentinos") del
 * Facundo. La IA (Payador Adversario) y el jugador empiezan con 20 puntos
 * de Gloria Criolla cada uno y se turnan:
 *   - Turno de la IA: tira una chicana y el jugador se defiende con una
 *     carta de su mano (esa carta YA ES el verso completo: con tocarla
 *     alcanza, siempre logra la réplica). Cada defensa lograda le saca
 *     bastante vida a la IA y entrega una de las tres pistas del
 *     personaje.
 *   - Turno del jugador: el jugador elige una de sus propias cartas de
 *     ataque y se la tira a la IA, que intenta defenderse sola con una
 *     réplica al azar (puede bloquear o no). Si bloquea, contragolpea con
 *     un daño chico; si no, la IA pierde un poco de vida extra.
 *
 * Las tres pistas se siguen ganando siempre en el turno de la IA (mismo
 * contrato de siempre: onPista(indice) y obtenerTotalPistas() = 3), así
 * que el resto del Nivel 2 no necesita saber nada de este rediseño. El
 * daño de la defensa está calibrado para que la vida de la IA llegue
 * más o menos a cero justo cuando se ganan las tres pistas, así las
 * barras de vida reflejan de verdad cómo va la partida.
 *
 * Todo se resuelve de forma visual sobre una mesa de naipes: cada lado
 * tiene su propia pila (nunca se mezclan entre sí) y cada carta nueva se
 * apila justo arriba de la anterior de ese mismo lado, dejando ver solo
 * un poco del resto del mazo.
 *
 * Las voces habladas de cada carta (this.audio.reproducirVozCarta) están
 * preparadas pero silenciosas hasta que se carguen los audios definitivos
 * (ver RUTAS_VOCES_CARTAS en audio.js).
 */

// Ícono SVG (viewBox 0 0 64 64) de cada carta, para que cada una tenga su
// propia ilustración en vez de ser un cartel de solo texto.
const ICONOS_CARTA = {
  'aeda-sin-letras': '<rect x="16" y="14" width="32" height="36" rx="2" fill="none" stroke="currentColor" stroke-width="3"/><line x1="32" y1="14" x2="32" y2="50" stroke="currentColor" stroke-width="2"/><line x1="21" y1="24" x2="43" y2="40" stroke="currentColor" stroke-width="3"/><line x1="43" y1="24" x2="21" y2="40" stroke="currentColor" stroke-width="3"/>',
  'himno-tragedias': '<circle cx="32" cy="30" r="18" fill="none" stroke="currentColor" stroke-width="3"/><line x1="23" y1="24" x2="29" y2="30" stroke="currentColor" stroke-width="3"/><line x1="29" y1="24" x2="23" y2="30" stroke="currentColor" stroke-width="3"/><line x1="35" y1="24" x2="41" y2="30" stroke="currentColor" stroke-width="3"/><line x1="41" y1="24" x2="35" y2="30" stroke="currentColor" stroke-width="3"/><path d="M22 42 Q32 34 42 42" fill="none" stroke="currentColor" stroke-width="3"/>',
  'pampa-desierta': '<circle cx="32" cy="24" r="10" fill="none" stroke="currentColor" stroke-width="3"/><line x1="8" y1="46" x2="56" y2="46" stroke="currentColor" stroke-width="3"/><line x1="16" y1="52" x2="20" y2="44" stroke="currentColor" stroke-width="2"/><line x1="26" y1="52" x2="30" y2="44" stroke="currentColor" stroke-width="2"/><line x1="44" y1="52" x2="40" y2="44" stroke="currentColor" stroke-width="2"/>',
  'desprecio-urbe': '<rect x="10" y="30" width="10" height="20" fill="none" stroke="currentColor" stroke-width="3"/><rect x="24" y="18" width="12" height="32" fill="none" stroke="currentColor" stroke-width="3"/><rect x="40" y="26" width="10" height="24" fill="none" stroke="currentColor" stroke-width="3"/><line x1="8" y1="50" x2="56" y2="50" stroke="currentColor" stroke-width="3"/>',
  'historia-sin-papel': '<rect x="18" y="12" width="24" height="32" fill="none" stroke="currentColor" stroke-width="3" transform="rotate(-8 30 28)"/><path d="M42 18 Q52 14 50 22" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M44 26 Q54 24 52 32" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M40 34 Q50 34 49 42" fill="none" stroke="currentColor" stroke-width="2.5"/>',
  'memoria-desierto': '<path d="M8 22 Q24 14 40 22 Q52 28 30 30" fill="none" stroke="currentColor" stroke-width="3"/><path d="M12 34 Q28 28 44 34 Q54 38 34 40" fill="none" stroke="currentColor" stroke-width="3"/><path d="M14 46 Q26 42 38 46" fill="none" stroke="currentColor" stroke-width="3"/>',
  'bardo-pampa': '<path d="M6 44 Q20 20 32 40 Q44 18 58 44" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="46" cy="16" r="7" fill="none" stroke="currentColor" stroke-width="3"/>',
  'tristeza-triste': '<path d="M32 12 C40 26 46 34 46 42 A14 14 0 0 1 18 42 C18 34 24 26 32 12 Z" fill="none" stroke="currentColor" stroke-width="3"/>',
  'acompanante-vihuela': '<circle cx="26" cy="40" r="13" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="26" cy="40" r="4" fill="none" stroke="currentColor" stroke-width="2"/><rect x="23" y="10" width="6" height="24" fill="none" stroke="currentColor" stroke-width="3"/><line x1="18" y1="14" x2="34" y2="14" stroke="currentColor" stroke-width="2.5"/>',
  'cronica-matrero': '<path d="M14 16 h36 v8 a4 4 0 0 1 -4 4 h-28 a4 4 0 0 0 -4 4 v20" fill="none" stroke="currentColor" stroke-width="3"/><path d="M14 44 a4 4 0 0 0 4 4 h32" fill="none" stroke="currentColor" stroke-width="3"/><line x1="24" y1="26" x2="42" y2="26" stroke="currentColor" stroke-width="2"/><line x1="24" y1="32" x2="42" y2="32" stroke="currentColor" stroke-width="2"/>'
};

// Probabilidad de que la IA logre bloquear una chicana del jugador.
// Cada chicana pertenece a un estilo y algunas réplicas son mejores
// respuestas que otras. La relación es estratégica, no una victoria segura.
const TIPOS_ATAQUE = {
  'aeda-sin-letras': 'Burla a la ignorancia',
  'himno-tragedias': 'Tragedia y muerte',
  'pampa-desierta': 'Soledad y paisaje',
  'desprecio-urbe': 'Ataque de la ciudad',
  'historia-sin-papel': 'Olvido y memoria'
};
const TIPOS_DEFENSA = {
  'memoria-desierto': 'Memoria oral',
  'bardo-pampa': 'Tradición épica',
  'tristeza-triste': 'Sentimiento criollo',
  'acompanante-vihuela': 'Música y guitarra',
  'cronica-matrero': 'Leyenda gaucha'
};
const DEFENSAS_EFICACES = {
  'aeda-sin-letras': ['bardo-pampa', 'memoria-desierto'],
  'himno-tragedias': ['tristeza-triste', 'cronica-matrero'],
  'pampa-desierta': ['bardo-pampa', 'acompanante-vihuela'],
  'desprecio-urbe': ['acompanante-vihuela', 'cronica-matrero'],
  'historia-sin-papel': ['memoria-desierto', 'cronica-matrero']
};

class MecanicaCantor {
  constructor({ contenedor, datos, audio, onPista }) {
    this.contenedor = contenedor;
    // Evita que ESPACIO llegue al mapa del pueblo y vuelva a abrir/reiniciar
    // la interacción mientras el minijuego está activo.
    this.bloquearEspacio = (evento) => {
      if (evento.key === ' ' || evento.code === 'Space' || evento.key === 'Spacebar') {
        evento.preventDefault();
        evento.stopPropagation();
      }
    };
    this.contenedor.addEventListener('keydown', this.bloquearEspacio);
    this.cartasAtaque = datos.cartasAtaque;
    this.cartasDefensa = datos.cartasDefensa;
    this.pistas = datos.pistas;
    this.vidaInicial = datos.vidaInicial || 20;
    this.audio = audio;
    this.onPista = onPista;

    this.vidaJugador = this.vidaInicial;
    this.vidaIA = this.vidaInicial;
    this.pistasGanadas = 0;

    // Mazos rotativos independientes: mano de ataque (para cuando le toca
    // atacar al jugador) y mano de defensa (para cuando le toca
    // defenderse de la chicana de la IA).
    this.mazoAtaque = this.mezclar([...this.cartasAtaque]);
    this.mazoDefensa = this.mezclar([...this.cartasDefensa]);

    this.turno = 'ia'; // 'ia' = la IA ataca y el jugador se defiende; 'jugador' = al revés.
    this.cartaIAActual = null; // la chicana de la IA pendiente de respuesta, en el turno de la IA.
    this.ataqueIAPreparadoEsteTurno = false; // evita duplicar ataques si render() se ejecuta varias veces.
    this.ultimoAtaqueIA = null;
    this.mostrarImpacto = false;
    this.mensajeCombate = '';
    this.resolviendo = false;
    this.mostrarIntro = true;
    this.temporizadores = [];
    this.pausado = false;

    // Pila de cartas ya jugadas por cada lado (mezcla ataques y
    // defensas, según lo que haya jugado cada uno). Cada carta nueva se
    // apila arriba de la anterior DE ESE MISMO LADO; las dos pilas nunca
    // se superponen entre sí. Se guardan como máximo las últimas 4 cartas
    // de cada lado, mostrando solo un poco de las de más abajo.
    this.pilaJugador = [];
    this.pilaCantor = [];

    // El tablero (cabecera, mesa, mano) se arma UNA sola vez como DOM real;
    // de ahí en más cada render() solo actualiza lo que cambió (textos,
    // barras de vida, clases) en vez de tirar todo y reconstruirlo de
    // cero. Esto es lo que permite que la pila de cartas se anime de
    // forma fluida en vez de "saltar" de golpe: los naipes que ya
    // estaban en la pila siguen siendo el mismo elemento del DOM, así
    // que la transición CSS de su posición (--offset) se ve.
    this.tableroConstruido = false;
    this.dom = null;
    // Mapa entrada-de-pila -> elemento del DOM, para saber qué naipe ya
    // existe y solo hay que reacomodar, y cuál es nuevo y hay que crear.
    this.mapaPilaJugador = new Map();
    this.mapaPilaCantor = new Map();
  }

  /** Quita el bloqueo de teclado al abandonar la escena del Cantor. */
  limpiar() {
    this.contenedor.removeEventListener('keydown', this.bloquearEspacio);
    this.limpiarTemporizadores();
    this.pausado = false;
  }

  /** Cantidad total de pistas que entrega esta mecánica. */
  obtenerTotalPistas() {
    return this.pistas.length;
  }

  mezclar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  obtenerManoAtaque() {
    return this.mazoAtaque.slice(0, 4);
  }

  obtenerManoDefensa() {
    return this.mazoDefensa.slice(0, 4);
  }

  rotarCartaAtaqueUsada(carta) {
    this.mazoAtaque = this.mazoAtaque.filter((c) => c.id !== carta.id);
    this.mazoAtaque.push(carta);
  }

  rotarCartaDefensaUsada(carta) {
    this.mazoDefensa = this.mazoDefensa.filter((c) => c.id !== carta.id);
    this.mazoDefensa.push(carta);
  }

  elegirAlAzar(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  tipoAtaque(carta) {
    return TIPOS_ATAQUE[carta?.id] || 'Chicana';
  }

  tipoDefensa(carta) {
    return TIPOS_DEFENSA[carta?.id] || 'Réplica';
  }

  defensaEficaz(ataque, defensa) {
    return (DEFENSAS_EFICACES[ataque?.id] || []).includes(defensa?.id);
  }

  // La IA prioriza chicanas contundentes y evita repetir el mismo ataque dos turnos seguidos.
  elegirAtaqueIA() {
    const candidatas = this.cartasAtaque.filter((c) => c.id !== this.ultimoAtaqueIA);
    const pool = candidatas.length ? candidatas : this.cartasAtaque;
    // La IA alterna estilos y no elige siempre la carta de mayor daño.
    return this.elegirAlAzar(pool);
  }

  programarTemporizador(entrada) {
    entrada.inicio = Date.now();
    entrada.id = setTimeout(() => {
      entrada.id = null;
      this.temporizadores = this.temporizadores.filter((temporizador) => temporizador !== entrada);
      if (!this.pausado) entrada.fn();
      else { entrada.restante = 0; this.temporizadores.push(entrada); }
    }, entrada.restante);
  }

  esperar(ms, fn) {
    const entrada = { fn, restante: ms, inicio: 0, id: null };
    this.temporizadores.push(entrada);
    if (!this.pausado) this.programarTemporizador(entrada);
    return entrada.id;
  }

  establecerPausa(pausado) {
    const nuevo = Boolean(pausado);
    if (this.pausado === nuevo) return;
    this.pausado = nuevo;
    if (nuevo) {
      const ahora = Date.now();
      this.temporizadores.forEach((temporizador) => {
        if (temporizador.id !== null) {
          clearTimeout(temporizador.id);
          temporizador.restante = Math.max(0, temporizador.restante - (ahora - temporizador.inicio));
          temporizador.id = null;
        }
      });
    } else {
      this.temporizadores.filter((temporizador) => temporizador.id === null)
        .forEach((temporizador) => this.programarTemporizador(temporizador));
    }
  }

  limpiarTemporizadores() {
    this.temporizadores.forEach((temporizador) => clearTimeout(temporizador.id));
    this.temporizadores = [];
  }

  /** Agrega una carta arriba de la pila de ese lado (deja como máximo 4 a la vista). */
  apilar(pila, carta, tipo) {
    this.audio.reproducirBarajar();
    pila.push({ carta, tipo });
    if (pila.length > 4) pila.shift();
  }

  /** Naipe de una carta de ataque (chicana), con su ilustración propia. */
  tarjetaAtaque(carta, extraClase = '') {
    return `
      <div class="payada-carta payada-carta-ataque ${extraClase}">
        <div class="payada-carta-cabecera">
          <span class="payada-carta-nombre">${carta.nombre}</span>
          <span class="payada-carta-stat">${carta.dano} DAÑO</span>
          <span class="payada-carta-tipo">${this.tipoAtaque(carta)}</span>
        </div>
        <div class="payada-carta-arte payada-arte-ataque">
          <svg viewBox="0 0 64 64" class="payada-carta-icono">${ICONOS_CARTA[carta.id] || ''}</svg>
        </div>
        <div class="payada-carta-caja">
          <span class="payada-energia payada-energia-ataque"></span>
          <span class="payada-carta-texto">${carta.frase}</span>
        </div>
        <div class="payada-carta-pie">CHICANA · FACUNDO, CAP. 2</div>
      </div>
    `;
  }

  /** Naipe de una carta de defensa (réplica), con su ilustración propia. */
  tarjetaDefensa(carta, extraClase = '', jugable = false) {
    return `
      <${jugable ? 'button type="button"' : 'div'} class="payada-carta payada-carta-defensa ${extraClase}" ${jugable ? `data-carta="${carta.id}"` : ''}>
        <div class="payada-carta-cabecera">
          <span class="payada-carta-nombre">${carta.nombre}</span>
          <span class="payada-carta-tipo">${this.tipoDefensa(carta)}</span>
        </div>
        <div class="payada-carta-arte payada-arte-defensa">
          <svg viewBox="0 0 64 64" class="payada-carta-icono">${ICONOS_CARTA[carta.id] || ''}</svg>
        </div>
        <div class="payada-carta-caja">
          <span class="payada-energia payada-energia-defensa"></span>
          <span class="payada-carta-texto">${carta.verso}</span>
        </div>
        <div class="payada-carta-pie">RÉPLICA · EL CANTOR</div>
      </${jugable ? 'button' : 'div'}>
    `;
  }

  /** Naipe de ataque, pero clicable (para cuando le toca atacar al jugador). */
  tarjetaAtaqueJugable(carta) {
    return `
      <button type="button" class="payada-carta payada-carta-ataque payada-carta-ataque-jugable" data-carta-ataque="${carta.id}">
        <div class="payada-carta-cabecera">
          <span class="payada-carta-nombre">${carta.nombre}</span>
          <span class="payada-carta-stat">${carta.dano} DAÑO</span>
          <span class="payada-carta-tipo">${this.tipoAtaque(carta)}</span>
        </div>
        <div class="payada-carta-arte payada-arte-ataque">
          <svg viewBox="0 0 64 64" class="payada-carta-icono">${ICONOS_CARTA[carta.id] || ''}</svg>
        </div>
        <div class="payada-carta-caja">
          <span class="payada-energia payada-energia-ataque"></span>
          <span class="payada-carta-texto">${carta.frase}</span>
        </div>
        <div class="payada-carta-pie">CHICANA · FACUNDO, CAP. 2</div>
      </button>
    `;
  }

  /** Crea un elemento del DOM a partir de un string de HTML de un solo naipe. */
  crearElementoNaipe(html) {
    const envoltorio = document.createElement('div');
    envoltorio.innerHTML = html.trim();
    return envoltorio.firstElementChild;
  }

  /**
   * Sincroniza el DOM de una pila con su array de datos, sin tirar abajo
   * los naipes que ya estaban ahí: agrega solo la carta nueva (con su
   * animación de entrada) y reacomoda el resto cambiando su variable
   * CSS --offset, que ya tiene una transición suave definida. Así cada
   * carta nueva queda apilando arriba de la anterior de forma fluida,
   * como en el solitario, en vez de que todo el tablero se reconstruya
   * de golpe.
   */
  sincronizarPila(pila, contenedorPilaEl, mapa, extraClaseTope) {
    if (pila.length === 0) {
      mapa.clear();
      contenedorPilaEl.innerHTML = '<div class="payada-carta payada-carta-dorso payada-carta-pila-vacia"><span>?</span></div>';
      return;
    }

    // Si la pila estaba vacía (mostrando el dorso "?"), sacamos ese
    // placeholder antes de empezar a poner naipes reales.
    if (contenedorPilaEl.querySelector('.payada-carta-pila-vacia')) {
      contenedorPilaEl.innerHTML = '';
    }

    // Sacar del DOM (con un breve fundido) los naipes que ya salieron de
    // la pila (se van descartando los más viejos cuando pasa de 4).
    mapa.forEach((el, entrada) => {
      if (!pila.includes(entrada)) {
        el.classList.add('payada-carta-saliendo');
        this.esperar(200, () => el.remove());
        mapa.delete(entrada);
      }
    });

    const clasesTope = extraClaseTope.split(' ').filter(Boolean);

    pila.forEach((entrada, indice) => {
      const offset = pila.length - 1 - indice; // 0 = la de arriba de todo
      const esTope = offset === 0;
      let el = mapa.get(entrada);

      if (!el) {
        const claseExtra = `payada-carta-pila-item payada-carta-jugando ${esTope ? extraClaseTope : 'payada-carta-pila-fondo'}`;
        const html = entrada.tipo === 'ataque'
          ? this.tarjetaAtaque(entrada.carta, claseExtra)
          : this.tarjetaDefensa(entrada.carta, claseExtra, false);
        el = this.crearElementoNaipe(html);
        el.style.setProperty('--offset', offset);
        contenedorPilaEl.appendChild(el);
        mapa.set(entrada, el);
      } else {
        // Naipe que ya existía: solo lo reacomodamos. Cambiar --offset
        // en el MISMO elemento es lo que dispara la transición suave
        // (en vez de que "salte" a la posición nueva).
        el.style.setProperty('--offset', offset);
        el.classList.remove('payada-carta-pila-fondo', 'payada-carta-jugando', 'payada-carta-impactada');
        if (esTope) {
          clasesTope.forEach((c) => el.classList.add(c));
        } else {
          el.classList.add('payada-carta-pila-fondo');
        }
      }
    });
  }

  /** Arma el tablero como DOM real, una sola vez por partida. */
  construirTablero() {
    this.contenedor.innerHTML = `
      <div class="payada-tablero">
        <div class="payada-cabecera-jugadores">
          <div class="payada-jugador payada-jugador-rival">
            <div class="payada-avatar payada-avatar-rival">🎭</div>
            <div class="payada-jugador-info">
              <span class="payada-jugador-nombre">Payador Adversario</span>
              <div class="payada-vida-barra payada-vida-rival"><div class="payada-vida-relleno" data-rol="vida-ia"></div><span class="payada-vida-numero" data-rol="vida-ia-numero"></span></div>
            </div>
          </div>
          <div class="payada-turno-indicador" data-rol="turno"></div>
          <div class="payada-jugador payada-jugador-vos">
            <div class="payada-jugador-info payada-jugador-info-vos">
              <span class="payada-jugador-nombre">Vos</span>
              <div class="payada-vida-barra"><div class="payada-vida-relleno" data-rol="vida-jugador"></div><span class="payada-vida-numero" data-rol="vida-jugador-numero"></span></div>
            </div>
            <div class="payada-avatar payada-avatar-vos">🎤</div>
          </div>
        </div>

        <div class="payada-pistas-indicador" data-rol="pistas"></div>

        <div class="payada-mesa-fieltro">
          <div class="payada-mesa payada-mesa-pilas">
            <div class="payada-mesa-pila-slot">
              <span class="payada-mesa-pila-etiqueta">PAYADOR ADVERSARIO</span>
              <div class="payada-pila" data-rol="pila-cantor"></div>
            </div>
            <div class="payada-mesa-pila-slot">
              <span class="payada-mesa-pila-etiqueta">VOS</span>
              <div class="payada-pila" data-rol="pila-jugador"></div>
            </div>
          </div>
        </div>

        <p class="payada-instruccion" data-rol="instruccion"></p>

        <div class="payada-mano" data-rol="mano"></div>
      </div>
    `;

    this.dom = {
      vidaIA: this.contenedor.querySelector('[data-rol="vida-ia"]'),
      vidaIANumero: this.contenedor.querySelector('[data-rol="vida-ia-numero"]'),
      vidaJugador: this.contenedor.querySelector('[data-rol="vida-jugador"]'),
      vidaJugadorNumero: this.contenedor.querySelector('[data-rol="vida-jugador-numero"]'),
      turno: this.contenedor.querySelector('[data-rol="turno"]'),
      pistas: this.contenedor.querySelector('[data-rol="pistas"]'),
      pilaCantor: this.contenedor.querySelector('[data-rol="pila-cantor"]'),
      pilaJugador: this.contenedor.querySelector('[data-rol="pila-jugador"]'),
      instruccion: this.contenedor.querySelector('[data-rol="instruccion"]'),
      mano: this.contenedor.querySelector('[data-rol="mano"]'),
    };
  }

  /** Dibuja el estado completo del contrapunto (vida, mesa de juego, mano). */
  render() {
    if (this.mostrarIntro) {
      this.tableroConstruido = false;
      this.renderIntro();
      return;
    }

    if (this.pistasGanadas >= this.obtenerTotalPistas()) {
      this.tableroConstruido = false;
      this.renderVictoria();
      return;
    }

    if (this.turno === 'ia' && !this.cartaIAActual && !this.ataqueIAPreparadoEsteTurno && !this.resolviendo) {
      // El ataque se prepara una sola vez por turno; render() puede ejecutarse
      // varias veces por animaciones y no debe volver a tirar otra carta.
      this.ataqueIAPreparadoEsteTurno = true;
      this.cartaIAActual = this.elegirAtaqueIA();
      this.ultimoAtaqueIA = this.cartaIAActual.id;
      this.apilar(this.pilaCantor, this.cartaIAActual, 'ataque');
      this.audio.reproducirVozCarta(this.cartaIAActual.audioId);
    }

    if (!this.tableroConstruido) {
      this.construirTablero();
      this.tableroConstruido = true;
    }

    const esTurnoIA = this.turno === 'ia';
    const mano = esTurnoIA ? this.obtenerManoDefensa() : this.obtenerManoAtaque();
    const extraTopeJugador = this.resolviendo ? 'payada-carta-jugando' : '';
    const extraTopeCantor = this.resolviendo && !esTurnoIA && this.mostrarImpacto
      ? 'payada-carta-jugando payada-carta-impactada'
      : (this.resolviendo ? 'payada-carta-jugando' : '');

    this.dom.vidaIA.style.width = `${(Math.max(this.vidaIA, 0) / this.vidaInicial) * 100}%`;
    this.dom.vidaIANumero.textContent = `${Math.max(this.vidaIA, 0)} / ${this.vidaInicial}`;
    this.dom.vidaJugador.style.width = `${(Math.max(this.vidaJugador, 0) / this.vidaInicial) * 100}%`;
    this.dom.vidaJugadorNumero.textContent = `${Math.max(this.vidaJugador, 0)} / ${this.vidaInicial}`;
    this.dom.turno.textContent = esTurnoIA ? 'TE ATACA' : 'ATACÁS VOS';
    this.dom.pistas.textContent = `${this.pistasGanadas} / ${this.obtenerTotalPistas()} PISTAS GANADAS`;
    this.dom.instruccion.textContent = this.mensajeCombate || (esTurnoIA
      ? 'Elegí una carta de réplica para defenderte.'
      : 'Elegí una chicana para atacar al Payador Adversario.');

    this.sincronizarPila(this.pilaCantor, this.dom.pilaCantor, this.mapaPilaCantor, extraTopeCantor);
    this.sincronizarPila(this.pilaJugador, this.dom.pilaJugador, this.mapaPilaJugador, extraTopeJugador);

    this.dom.mano.className = `payada-mano ${this.resolviendo ? 'payada-mano-bloqueada' : ''}`;
    this.dom.mano.innerHTML = mano.map((carta, indice) => `<div class="payada-mano-item" style="--i:${indice}">${esTurnoIA ? this.tarjetaDefensa(carta, '', !this.resolviendo) : this.tarjetaAtaqueJugable(carta)}</div>`).join('');

    this.dom.mano.querySelectorAll('.payada-carta-defensa[data-carta]').forEach((boton) => {
      boton.addEventListener('mouseenter', () => this.audio.reproducirHoverCarta());
      boton.addEventListener('click', () => this.jugadorDefiende(boton.dataset.carta));
    });

    this.dom.mano.querySelectorAll('.payada-carta-ataque-jugable[data-carta-ataque]').forEach((boton) => {
      boton.addEventListener('mouseenter', () => this.audio.reproducirHoverCarta());
      boton.addEventListener('click', () => this.jugadorAtaca(boton.dataset.cartaAtaque));
    });
  }

  /**
   * Pantalla explicativa antes de arrancar el contrapunto: explica la
   * mecánica con íconos y muy poco texto, no con un párrafo largo. La
   * música de fondo del contrapunto arranca recién cuando el jugador ya
   * vio esta pantalla y toca "¡A CANTAR!", no antes.
   */
  renderIntro() {
    this.contenedor.closest('.escena-cantor')?.classList.add('cantor-intro-scroll');
    this.contenedor.innerHTML = `
      <div class="payada-tablero payada-intro">
        <p class="payada-intro-titulo">EL CANTOR DE LA PAMPA</p>
        <p class="payada-intro-subtitulo">Contrapunto criollo · ${this.vidaInicial} de Gloria Criolla cada uno</p>

        <div class="payada-intro-pasos">
          <div class="payada-intro-paso">
            <span class="payada-intro-icono">🎭</span>
            <span class="payada-intro-flecha">→</span>
            <span class="payada-intro-icono">🎤</span>
            <span class="payada-intro-texto">Cuando ataca la IA, respondés con una réplica de tu mano que siempre acierta.</span>
          </div>
          <div class="payada-intro-paso">
            <span class="payada-intro-icono">🎤</span>
            <span class="payada-intro-flecha">→</span>
            <span class="payada-intro-icono">🎭</span>
            <span class="payada-intro-texto">Cuando te toca a vos, elegís una chicana: la IA puede bloquearla y contragolpear.</span>
          </div>
          <div class="payada-intro-paso">
            <span class="payada-intro-icono">⚔️</span>
            <span class="payada-intro-flecha">→</span>
            <span class="payada-intro-icono">🏆</span>
            <span class="payada-intro-texto">3 réplicas ganadas = 3 pistas = Gran Cantor de la Pampa.</span>
          </div>
        </div>

        <section class="payada-intro-tipos" aria-label="Guía de tipos de cartas">
          <h3>CONOCÉ LOS TIPOS ANTES DE JUGAR</h3>
          <div class="payada-intro-tipos-columnas">
            <div><h4>CHICANAS (ATAQUE)</h4><ul>
              <li><b>Burla a la ignorancia:</b> cuestiona la falta de letras.</li>
              <li><b>Tragedia y muerte:</b> apela al dolor y la desgracia.</li>
              <li><b>Soledad y paisaje:</b> usa la inmensidad de la pampa.</li>
              <li><b>Ataque de la ciudad:</b> contrapone ciudad y campo.</li>
              <li><b>Olvido y memoria:</b> discute cómo se recuerda la historia.</li>
            </ul></div>
            <div><h4>RÉPLICAS (DEFENSA)</h4><ul>
              <li><b>Memoria oral:</b> la tradición conserva lo ocurrido.</li>
              <li><b>Tradición épica:</b> responde con hazañas y leyendas.</li>
              <li><b>Sentimiento criollo:</b> devuelve el golpe con emoción.</li>
              <li><b>Música y guitarra:</b> la canción sostiene la voz del gaucho.</li>
              <li><b>Leyenda gaucha:</b> defiende la historia del matrero.</li>
            </ul></div>
          </div>
          <p><b>ESTRATEGIA:</b> no elijas al azar. La memoria oral y la leyenda gaucha sirven contra «Olvido y memoria»; la música y guitarra puede contrarrestar el «Ataque de la ciudad». Una réplica eficaz mejora tus probabilidades, pero nunca garantiza el éxito.</p>
        </section>

        <button type="button" class="payada-boton-empezar">¡A CANTAR!</button>
      </div>
    `;

    this.contenedor.querySelector('.payada-boton-empezar').addEventListener('click', () => {
      this.contenedor.closest('.escena-cantor')?.classList.remove('cantor-intro-scroll');
      this.audio.reproducirClick();
      this.audio.reproducirPayada();
      this.mostrarIntro = false;
      this.render();
    });
  }

  /** Turno de la IA: el jugador se defiende con una carta de su mano (siempre acierta). */
  jugadorDefiende(idCarta) {
    if (this.resolviendo || this.turno !== 'ia') return;
    const carta = this.cartasDefensa.find((c) => c.id === idCarta);
    if (!carta) return;

    this.resolviendo = true;
    this.mostrarImpacto = false;
    this.mensajeCombate = `${this.cartaIAActual?.nombre || 'El Cantor'}: «${this.cartaIAActual?.frase || ''}»\nTu réplica, ${carta.nombre}: «${carta.verso}»`;
    this.apilar(this.pilaJugador, carta, 'defensa');
    this.audio.reproducirVozCarta(carta.audioId);
    this.render();

    this.esperar(650, () => {
      this.mostrarImpacto = true;
      this.render();
    });

    this.esperar(1500, () => {
      this.rotarCartaDefensaUsada(carta);

      const ataqueEnemigo = this.cartaIAActual;
      const esContra = this.defensaEficaz(ataqueEnemigo, carta);
      const probExito = esContra ? 0.72 : 0.30;
      const replicaAcertada = Math.random() < probExito;
      const danoContraIA = esContra ? 6 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 3);
      const indicePista = this.pistasGanadas;
      const esUltimaPista = indicePista === this.obtenerTotalPistas() - 1;
      // Mientras falten pistas, la barra no puede vaciarse del todo: si
      // llegara a 0 antes de tiempo, parecería que la pelea ya terminó
      // aunque en realidad sigue. Solo la réplica que gana la última
      // pista puede dejarla en 0 de verdad.
      const pisoVida = esUltimaPista ? 0 : 1;
      if (replicaAcertada) {
        this.vidaIA = Math.max(pisoVida, this.vidaIA - danoContraIA);
        this.pistasGanadas += 1;
        this.onPista(indicePista, this.pistas[indicePista]);
        this.mensajeCombate = `¡Buena réplica! ${esContra ? 'Elegiste un contraataque eficaz.' : 'Esta vez tu réplica funcionó, aunque no era la mejor respuesta.'} «${carta.verso}»
El Cantor cede: pista ${this.pistasGanadas} de ${this.obtenerTotalPistas()}.`;
      } else {
        const dano = 3 + Math.floor(Math.random() * 3);
        this.vidaJugador = Math.max(0, this.vidaJugador - dano);
        if (this.vidaJugador <= 0) { this.renderDerrota(); return; }
        this.mensajeCombate = `El Cantor retruca: «${this.cartaIAActual?.frase || ''}»
${esContra ? 'Tu réplica era eficaz, pero no alcanzó esta vez.' : `Tu defensa no contrarresta bien el estilo «${this.tipoAtaque(ataqueEnemigo)}».`} Perdès ${dano} de Gloria Criolla; intentá otra vez.`;
      }

      this.cartaIAActual = null;
      this.ataqueIAPreparadoEsteTurno = false;
      this.mostrarImpacto = false;
      this.resolviendo = false;
      this.turno = 'jugador';
      this.render();
    });
  }

  /** Turno del jugador: ataca a la IA, que intenta defenderse sola. */
  jugadorAtaca(idCarta) {
    if (this.resolviendo || this.turno !== 'jugador') return;
    const carta = this.cartasAtaque.find((c) => c.id === idCarta);
    if (!carta) return;

    this.resolviendo = true;
    this.mostrarImpacto = false;
    this.mensajeCombate = `Tu chicana, ${carta.nombre}: «${carta.frase}»`;
    this.apilar(this.pilaJugador, carta, 'ataque');
    this.audio.reproducirVozCarta(carta.audioId);

    // El ataque de la IA pertenece al turno anterior. Quitarlo antes de
    // mostrar la réplica evita que parezca que el Cantor juega ataque y
    // defensa a la vez; durante este turno solo se verá su defensa.
    this.pilaCantor = this.pilaCantor.filter((entrada) => entrada.tipo !== 'ataque');
    this.mapaPilaCantor = new Map();
    this.render();

    // La IA lee el daño de la chicana: ante cartas fuertes intenta bloquear
    // más; ante cartas débiles conserva recursos y deja pasar más ataques.
    const cartaDefensaIA = this.elegirAlAzar(this.cartasDefensa);
    const esContra = this.defensaEficaz(carta, cartaDefensaIA);
    const danoCarta = Number(carta.dano) || 0;
    const probBloqueo = esContra ? 0.72 : 0.28;
    const iaBloquea = Math.random() < probBloqueo;
    // La defensa del cantor es una sola respuesta al ataque recibido.

    this.esperar(650, () => {
      this.apilar(this.pilaCantor, cartaDefensaIA, 'defensa');
      this.mostrarImpacto = iaBloquea;
      this.audio.reproducirVozCarta(cartaDefensaIA.audioId);
      this.render();
    });

    this.esperar(1500, () => {
      this.rotarCartaAtaqueUsada(carta);

      if (iaBloquea) {
        const contragolpe = 2 + Math.floor(Math.random() * 2); // 2 o 3
        this.vidaJugador = Math.max(0, this.vidaJugador - contragolpe);
        if (this.vidaJugador <= 0) { this.renderDerrota(); return; }
      } else {
        // Mismo resguardo que en la defensa: un ataque exitoso del
        // jugador no puede vaciar la barra antes de tiempo si todavía
        // quedan pistas por ganar.
        const pisoVida = this.pistasGanadas >= this.obtenerTotalPistas() ? 0 : 1;
        this.vidaIA = Math.max(pisoVida, this.vidaIA - carta.dano);
      }

      this.mensajeCombate = iaBloquea
        ? `Vos: «${carta.frase}»\nEl Cantor responde con ${cartaDefensaIA.nombre} (${this.tipoDefensa(cartaDefensaIA)}): «${cartaDefensaIA.verso}» y bloquea tu ataque${esContra ? ' con una réplica eficaz' : ''}.`
        : `Vos: «${carta.frase}»\nEl Cantor intenta ${cartaDefensaIA.nombre} (${this.tipoDefensa(cartaDefensaIA)}): «${cartaDefensaIA.verso}», pero no logra bloquear. ¡Tu ataque entra!`;
      this.mostrarImpacto = false;
      this.resolviendo = false;
      this.turno = 'ia';
      this.cartaIAActual = null;
      this.ataqueIAPreparadoEsteTurno = false;
      this.render();
    });
  }

  /** El jugador pierde cuando la Gloria Criolla llega a cero. */
  renderDerrota() {
    this.limpiarTemporizadores();
    this.resolviendo = true;
    this.contenedor.innerHTML = `
      <div class="payada-tablero payada-victoria payada-derrota">
        <p class="payada-victoria-titulo">¡Te quedaste sin Gloria Criolla!</p>
        <p>El Payador Adversario ganó este contrapunto. Podés volver a intentarlo y probar otra estrategia de chicanas y réplicas.</p>
        <button type="button" class="payada-boton-empezar">VOLVER A INTENTAR</button>
      </div>
    `;
    this.contenedor.querySelector('.payada-boton-empezar').addEventListener('click', () => {
      this.vidaJugador = this.vidaInicial;
      this.vidaIA = this.vidaInicial;
      this.pistasGanadas = 0;
      this.mazoAtaque = this.mezclar([...this.cartasAtaque]);
      this.mazoDefensa = this.mezclar([...this.cartasDefensa]);
      this.turno = 'ia';
      this.cartaIAActual = null;
      this.ataqueIAPreparadoEsteTurno = false;
      this.ultimoAtaqueIA = null;
      this.mostrarImpacto = false;
      this.mensajeCombate = '';
      this.resolviendo = false;
      this.mostrarIntro = true;
      this.pilaJugador = [];
      this.pilaCantor = [];
      this.mapaPilaJugador = new Map();
      this.mapaPilaCantor = new Map();
      this.tableroConstruido = false;
      this.dom = null;
      this.render();
    });
  }

  /** Pantalla final cuando ya se ganaron las tres pistas. */
  renderVictoria() {
    this.limpiarTemporizadores();
    this.contenedor.innerHTML = `
      <div class="payada-tablero payada-victoria">
        <p class="payada-victoria-titulo">¡Sos coronado el Gran Cantor de la Pampa!</p>
        <p>Tres réplicas bien cantadas bastaron para hacer callar al Payador Adversario.</p>
      </div>
    `;
  }
}

export { MecanicaCantor };
