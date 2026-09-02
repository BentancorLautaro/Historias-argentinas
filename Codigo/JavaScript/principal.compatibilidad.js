
/* ===== configuracion.js ===== */
/**
 * Configuración central del juego.
 * Contiene valores compartidos y evita números mágicos entre módulos.
 */

const NIVEL_MINIMO = 1;
const NIVEL_MAXIMO = 5;
const NIVEL_JUGABLE = 1;
const CLAVE_NIVEL_DESBLOQUEADO = 'facundo-unlocked-level';
const VOLUMEN_INICIAL = 50;


/* ===== persistencia.js ===== */
/**
 * Persistencia mínima del progreso de niveles.
 * Aísla localStorage del resto de la aplicación.
 */


function obtenerNivelDesbloqueado() {
  const guardado = Number.parseInt(
    localStorage.getItem(CLAVE_NIVEL_DESBLOQUEADO),
    10
  );

  return Number.isFinite(guardado) && guardado >= NIVEL_MINIMO
    ? Math.min(guardado, NIVEL_MAXIMO)
    : NIVEL_MINIMO;
}

function guardarNivelDesbloqueado(nivel) {
  const actual = obtenerNivelDesbloqueado();
  const siguiente = Math.max(
    actual,
    Math.min(Number(nivel), NIVEL_MAXIMO)
  );

  localStorage.setItem(CLAVE_NIVEL_DESBLOQUEADO, String(siguiente));
  return siguiente;
}


/* ===== audio.js ===== */
/**
 * Gestiona todos los sonidos del juego.
 * Centraliza volumen, habilitación de efectos y reproducción.
 */


class GestorAudio {
  constructor() {
    const rutaRecursos = '../../Assets/Assets Sonidos/';

    this.efectosActivados = true;
    this.volumenGeneral = VOLUMEN_INICIAL;
    this.volumenMusica = VOLUMEN_INICIAL;
    this.ultimoHover = 0;

    this.sonidos = {
      hover: new Audio(`${rutaRecursos}SonidoBoton.mp3`),
      click: new Audio(`${rutaRecursos}SonidoClick.mp3`),
      hojas: new Audio(`${rutaRecursos}SonidoHojas.mp3`)
    };

    Object.values(this.sonidos).forEach((sonido) => {
      sonido.preload = 'auto';
    });

    // El efecto de hojas se reproduce una sola vez al abrir/cerrar un diario.
    this.sonidos.hojas.loop = false;
    this.aplicarVolumenes();
  }

  aplicarVolumenes() {
    const maestro = this.volumenGeneral / 100;
    this.sonidos.hover.volume = Math.min(1, maestro * 0.55);
    this.sonidos.click.volume = Math.min(1, maestro * 0.75);
    this.sonidos.hojas.volume = Math.min(
      1,
      maestro * (this.volumenMusica / 100) * 0.22
    );
  }

  reproducir(nombre, { reiniciar = true } = {}) {
    if (!this.efectosActivados) return;

    const audio = this.sonidos[nombre];
    if (!audio) return;

    try {
      if (reiniciar) audio.currentTime = 0;
      const promesa = audio.play();
      if (promesa && typeof promesa.catch === 'function') {
        promesa.catch(() => {});
      }
    } catch (_) {
      // Un bloqueo del navegador no debe interrumpir la partida.
    }
  }

  reproducirHover() {
    if (!this.efectosActivados) return;

    const ahora = performance.now();
    if (ahora - this.ultimoHover < 70) return;
    this.ultimoHover = ahora;
    this.reproducir('hover');
  }

  reproducirClick() {
    this.reproducir('click');
  }

  reproducirHojas() {
    this.reproducir('hojas');
  }

  detenerHojas() {
    const audio = this.sonidos.hojas;
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch (_) {
      // Se ignora si el navegador no permite reposicionar el audio en ese momento.
    }
  }

  establecerVolumenGeneral(valor) {
    this.volumenGeneral = Math.max(0, Math.min(100, Number(valor) || 0));
    this.aplicarVolumenes();
  }

  establecerVolumenMusica(valor) {
    this.volumenMusica = Math.max(0, Math.min(100, Number(valor) || 0));
    this.aplicarVolumenes();
  }

  establecerEfectosActivados(activados) {
    this.efectosActivados = Boolean(activados);
    if (!this.efectosActivados) this.detenerHojas();
  }
}


/* ===== interfaz.js ===== */
/**
 * Acceso centralizado al DOM del Nivel 1 y operaciones visuales simples.
 */

function obtenerElementosNivelUno() {
  return {
    juegoPantalla: document.getElementById('game-screen'),
    diarioModal: document.getElementById('newspaper-modal'),
    tituloDiario: document.getElementById('paper-title'),
    fechaDiario: document.getElementById('paper-date'),
    edicionDiario: document.getElementById('paper-issue'),
    seccionDiario: document.getElementById('paper-kicker'),
    titularDiario: document.getElementById('paper-headline'),
    bajadaDiario: document.getElementById('paper-deck'),
    textoDiario: document.getElementById('paper-text'),
    progresoFrases: document.getElementById('paper-key-progress'),
    progresoDiarios: document.getElementById('paper-progress'),
    barraDiarios: document.getElementById('paper-progress-fill'),
    pistaInteraccion: document.getElementById('interact-hint'),
    botonCerrarDiario: document.getElementById('close-paper'),

    cuestionarioModal: document.getElementById('quiz-modal'),
    contenidoCuestionario: document.getElementById('quiz-content'),
    retroalimentacionCuestionario: document.getElementById('quiz-feedback'),
    botonSiguientePregunta: document.getElementById('quiz-next'),

    tableroModal: document.getElementById('board-modal'),
    progresoTablero: document.getElementById('board-progress'),
    puntuacionTablero: document.getElementById('board-score'),
    recortesTablero: document.getElementById('board-clippings'),
    ideaFormada: document.querySelector('#formed-idea span'),
    retroalimentacionTablero: document.getElementById('board-feedback'),
    botonLimpiarTablero: document.getElementById('board-reset-selection'),
    botonContinuarTablero: document.getElementById('board-next'),

    nivelCompletadoModal: document.getElementById('level-complete'),
    resultadoDiarios: document.getElementById('final-papers'),
    resultadoPreguntas: document.getElementById('final-quiz'),
    botonVolverMenu: document.getElementById('return-menu')
  };
}

function mostrar(elemento) {
  elemento.classList.remove('hidden');
}

function ocultar(elemento) {
  elemento.classList.add('hidden');
}

function alternarPantalla(elemento, visible) {
  elemento.classList.toggle('hidden', !visible);
  elemento.classList.toggle('active', visible);
}

function establecerTexto(elemento, texto) {
  elemento.textContent = texto;
}


/* ===== ajustes.js ===== */
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
    const botonIdioma = document.getElementById('language-button');
    const botonControles = document.getElementById('controls-button');

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

    botonIdioma.addEventListener('click', () => {
      botonIdioma.textContent = 'ESPAÑOL';
    });

    botonControles.addEventListener('click', () => {});
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


/* ===== menu.js ===== */
/**
 * Navega entre menú principal, niveles, créditos y configuración.
 * El desbloqueo persistente se delega en persistencia.js.
 */





class GestorMenu {
  constructor(audio, alIniciarNivel) {
    this.audio = audio;
    this.alIniciarNivel = alIniciarNivel;
    this.claveAlmacenamiento = CLAVE_NIVEL_DESBLOQUEADO;

    this.pantallaInicio = document.getElementById('start-screen');
    this.pantallaNiveles = document.getElementById('level-select-screen');
    this.pantallaCreditos = document.getElementById('credits-screen');
    this.pantallaAjustes = document.getElementById('settings-screen');
    this.retroalimentacion = document.getElementById('level-select-feedback');

    this.gestorAjustes = new GestorAjustes(this.audio);
    this.inicializarEventos();
    this.gestorAjustes.inicializar();
    this.actualizarTarjetas();
  }

  obtenerNivelDesbloqueado() {
    return obtenerNivelDesbloqueado();
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

      const estado = tarjeta.querySelector('.level-card-status');
      if (estado) estado.textContent = habilitado ? 'DESBLOQUEADO' : 'BLOQUEADO';
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

    document.getElementById('btn-settings').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.navegarA(this.pantallaAjustes);
    });

    document.getElementById('btn-back-credits').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.navegarA(this.pantallaInicio);
    });

    document.getElementById('btn-back-settings').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.navegarA(this.pantallaInicio);
    });

    document.getElementById('btn-back-levels').addEventListener('click', () => {
      this.audio.reproducirClick();
      this.retroalimentacion.textContent = '';
      this.navegarA(this.pantallaInicio);
    });

    document.querySelectorAll('.level-card').forEach((tarjeta) => {
      tarjeta.addEventListener('click', () => this.seleccionarNivel(Number(tarjeta.dataset.level)));
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
    this.retroalimentacion.textContent = '';
    this.actualizarTarjetas();
    this.navegarA(this.pantallaNiveles);
  }

  mostrarSeleccionTrasCompletar(nivelCompletado) {
    const siguiente = Number(nivelCompletado) + 1;
    if (siguiente <= NIVEL_MAXIMO) this.establecerNivelDesbloqueado(siguiente);
    this.mostrarSeleccionNiveles();
  }

  navegarA(pantallaObjetivo) {
    [this.pantallaInicio, this.pantallaNiveles, this.pantallaCreditos, this.pantallaAjustes]
      .forEach((pantalla) => alternarPantalla(pantalla, false));
    alternarPantalla(pantallaObjetivo, true);
  }
}


/* ===== datosNivelUno.js ===== */
/**
 * Contenido didáctico del Nivel 1.
 * Mantiene los textos, preguntas y relaciones del proyecto original separados de la lógica.
 */

const diariosNivelUno = [
      {
        title: 'EL OBSERVADOR DE LA REPÚBLICA',
        shortTitle: 'EL OBSERVADOR',
        date: 'República Argentina · Introducción · Edición especial',
        issue: 'HISTORIA, POLÍTICA Y COSTUMBRES',
        kicker: 'LA FIGURA DE FACUNDO',
        headline: 'Facundo Quiroga como espejo de la vida argentina',
        deck: 'Sarmiento presenta a Facundo como una figura que permite estudiar las fuerzas, costumbres e ideas que atraviesan a la República.',
        columns: [
          [
            'Sombra terrible de Facundo: Sarmiento evoca al caudillo para interrogar la vida secreta y las convulsiones internas de la República Argentina.',
            'Facundo como espejo de la vida argentina: según la Introducción, no es solamente un caudillo; su figura permite observar una de las tendencias que luchan dentro de aquella sociedad y comprender una época marcada por la guerra civil.',
            'El autor sostiene que para comprender a Facundo hay que mirar los antecedentes nacionales y costumbres, la fisonomía del suelo y las tradiciones populares.',
            'La vida y los hechos de Facundo adquieren importancia histórica porque Sarmiento los relaciona con la naturaleza del territorio y con una manera de ser del pueblo argentino.'
          ],
          [
            'Facundo aparece como una expresión de las preocupaciones e instintos de un pueblo. El caudillo es presentado como el reflejo, en dimensiones colosales, de las creencias, necesidades y hábitos de una nación en una época determinada.',
            'La Introducción anuncia una obra dividida en dos movimientos: primero el terreno, el paisaje y el teatro donde ocurre la escena; después el personaje, sus ideas y su forma de actuar.',
            'Sarmiento vincula la figura de Facundo con la naturaleza campestre, colonial y bárbara, y contrapone esas fuerzas con las ideas de civilización y libertad.',
            'La pregunta central no es solamente quién fue Facundo, sino qué revela su figura sobre la organización política de la República y sobre la sociedad argentina de su tiempo.'
          ]
        ],
        keys: ['Facundo como espejo de la vida argentina', 'antecedentes nacionales y costumbres', 'organización política de la República']
      },
      {
        title: 'LA VOZ DE LA PAMPA',
        shortTitle: 'LA VOZ DE LA PAMPA',
        date: 'República Argentina · Capítulo I · Edición especial',
        issue: 'GEOGRAFÍA Y VIDA EN LAS CAMPAÑAS',
        kicker: 'EL TERRITORIO',
        headline: 'La extensión y el desierto marcan la vida de la República',
        deck: 'El primer capítulo comienza por el territorio: llanuras, bosques, ríos, soledad y enormes distancias condicionan las formas de vida.',
        columns: [
          [
            'La República Argentina es presentada como un territorio de enorme extensión. Al Oeste se levantan los Andes, al Este se encuentra el Atlántico y el Río de la Plata penetra hacia el interior.',
            'Sarmiento señala que el mal que aqueja a la República es la extensión: la extensión y el desierto la rodean y se introducen en sus entrañas, dejando grandes espacios de soledad entre las provincias.',
            'La llanura, los bosques y los ríos aparecen como elementos dominantes del paisaje. La inmensidad de la Pampa dificulta reconocer dónde termina la tierra y comienza el cielo.',
            'La inseguridad también forma parte de la vida de las campañas. El hombre del campo teme al ataque de los salvajes, al tigre y a la víbora, y aprende a convivir con el peligro.'
          ],
          [
            'Esta inseguridad permanente, sostiene Sarmiento, imprime en el carácter argentino cierta resignación ante la muerte violenta y ayuda a explicar la familiaridad con el peligro.',
            'El territorio habitado presenta distintas fisonomías: al norte predominan los bosques; en el centro se alternan Pampa y selva; al sur domina la Pampa abierta e infinita.',
            'Los grandes ríos podrían favorecer los ríos y comunicación, la civilización y la riqueza, pero Sarmiento observa que son poco aprovechados por los habitantes de sus márgenes.',
            'La llanura también dificulta la acción organizada: los caminos encuentran pocos obstáculos naturales, pero la inmensidad hace débil e ineficaz el esfuerzo de la civilización.'
          ]
        ],
        keys: ['la extensión y el desierto', 'la inmensidad de la Pampa', 'ríos y comunicación']
      },
      {
        title: 'CORRESPONDENCIA DEL PLATA',
        shortTitle: 'CORRESPONDENCIA DEL PLATA',
        date: 'Buenos Aires y provincias · Capítulo I · Edición especial',
        issue: 'CIUDAD, PROVINCIAS Y CIVILIZACIÓN',
        kicker: 'BUENOS AIRES Y EL INTERIOR',
        headline: 'Una ciudad concentrada frente a un interior aislado',
        deck: 'El territorio y la ubicación de Buenos Aires producen relaciones desiguales entre la ciudad, los ríos y las provincias interiores.',
        columns: [
          [
            'Buenos Aires ocupa una posición privilegiada por su contacto con el comercio extranjero y por su acceso al Río de la Plata. Sarmiento destaca la concentración de Buenos Aires: allí se concentran poder, rentas y comercio.',
            'Las provincias interiores dependen de las salidas disponibles para sus productos. El autor observa que la política de Buenos Aires no ha distribuido por igual la civilización, la industria y la población europea.',
            'Sarmiento relaciona la configuración del suelo con la organización política: la concentración geográfica favorece una tendencia hacia la unidad, aunque esa unidad puede presentarse como civilización y libertad o como barbarie y esclavitud.',
            'La Pampa dificulta la circulación de los progresos acumulados en Buenos Aires hacia las provincias. El espacio físico aparece así ligado a las diferencias sociales y políticas.'
          ],
          [
            'El capítulo distingue con claridad la ciudad de la campaña. La ciudad como centro de civilización concentra talleres, comercio, escuelas, juzgados, gobierno regular e ideas de progreso.',
            'Fuera de la ciudad cambia el aspecto de la vida. El hombre de la campaña tiene otros hábitos, necesidades y formas de vestir, y Sarmiento llega a describirlos como dos sociedades distintas.',
            'El desierto rodea a muchas ciudades y las convierte en pequeños oasis de civilización dentro de extensiones rurales. Buenos Aires y Córdoba aparecen como centros que han podido extender mayor cantidad de villas sobre la campaña.',
            'La oposición entre ciudad y campaña será fundamental para entender la interpretación de Sarmiento sobre la civilización y la barbarie.'
          ]
        ],
        keys: ['concentración de Buenos Aires', 'ciudad como centro de civilización', 'ciudad y campaña']
      },
      {
        title: 'EL DIARIO DE LA CAMPAÑA',
        shortTitle: 'EL DIARIO DE LA CAMPAÑA',
        date: 'Campañas argentinas · Capítulo I · Edición especial',
        issue: 'VIDA PASTORIL Y COSTUMBRES',
        kicker: 'EL HOMBRE DEL CAMPO',
        headline: 'El aislamiento transforma las costumbres y la vida del gaucho',
        deck: 'La vida pastoril, la distancia entre las viviendas y la lucha cotidiana con la naturaleza forman hábitos particulares en la campaña.',
        columns: [
          [
            'En muchas provincias la mayor parte de la población vive en los campos. La vida pastoril y ganado constituyen el medio de subsistencia y las viviendas se encuentran separadas por grandes distancias.',
            'El aislamiento debilita las formas de asociación. La municipalidad, la policía y la justicia civil encuentran dificultades para actuar en una población tan dispersa.',
            'La falta de reunión también dificulta la educación. Sarmiento plantea que resulta casi imposible establecer una escuela para niños distribuidos a enormes distancias.',
            'La vida del campo exige resolver los problemas de manera individual. El aislamiento de la campaña hace que el hombre aprenda a enfrentarse con la naturaleza, soportar privaciones y confiar en su capacidad personal.'
          ],
          [
            'Desde la infancia, los niños de la campaña se acostumbran al caballo, al lazo y a las bolas. Más adelante aprenden a domar potros y desarrollan destrezas físicas vinculadas con la vida rural.',
            'La lucha constante con la naturaleza fortalece, según Sarmiento, la fuerza individual del gaucho, su sentimiento de importancia y superioridad. El gaucho aparece fuerte, altivo y enérgico.',
            'El hombre de la campaña rechaza con frecuencia el lujo, los modales y los signos europeos de la ciudad. Ciudad y campo parecen responder a hábitos y necesidades muy diferentes.',
            'El capítulo muestra así cómo el territorio no es solamente un paisaje: la extensión, el aislamiento y la vida pastoril producen costumbres e ideas que ayudan a explicar la sociedad argentina.'
          ]
        ],
        keys: ['aislamiento de la campaña', 'vida pastoril y ganado', 'fuerza individual del gaucho']
      }

];

const preguntasNivelUno = [
      {
        q: '¿Por qué Sarmiento considera importante estudiar a Facundo Quiroga?',
        options: ['Porque su figura permite comprender una de las tendencias de la sociedad argentina', 'Porque fue solamente un personaje militar sin relación con su época', 'Porque su vida ocurre fuera de la historia de la República'],
        answer: 0,
        explain: 'En la Introducción, Facundo aparece como una manifestación de la vida argentina y como una figura que permite explicar una de las tendencias que luchan dentro de la sociedad.'
      },
      {
        q: '¿Qué elemento del territorio Sarmiento presenta como un problema central de la República?',
        options: ['La extensión y el desierto', 'La falta de montañas en Europa', 'El exceso de ciudades costeras'],
        answer: 0,
        explain: 'El capítulo I afirma que el mal que aqueja a la República Argentina es la extensión y describe el desierto, la soledad y las grandes distancias.'
      },
      {
        q: '¿Qué diferencia fundamental establece Sarmiento entre la ciudad y la campaña?',
        options: ['La ciudad concentra instituciones, comercio y educación, mientras la campaña vive más aislada', 'La campaña posee todas las instituciones y la ciudad carece de ellas', 'No existe ninguna diferencia entre ambas'],
        answer: 0,
        explain: 'Sarmiento presenta a la ciudad como centro de civilización, con escuelas, comercio, juzgados y gobierno regular, mientras la campaña está marcada por el aislamiento y la vida pastoril.'
      },
      {
        q: '¿Cómo influye el territorio en las costumbres, según el capítulo I?',
        options: ['La extensión, el aislamiento y la vida pastoril producen hábitos particulares', 'El territorio no influye en la vida de sus habitantes', 'Solo las ciudades determinan las costumbres del país'],
        answer: 0,
        explain: 'El capítulo relaciona la naturaleza del suelo y las formas de vida con los hábitos de la población, especialmente en las campañas.'
      }

];

const gruposTableroNivelUno = [
      {
        id: 'facundo',
        title: 'FACUNDO Y LA VIDA ARGENTINA',
        fragments: [
          { text: 'Facundo como espejo de la vida argentina', source: 'EL OBSERVADOR' },
          { text: 'antecedentes nacionales y costumbres', source: 'EL OBSERVADOR' },
          { text: 'organización política de la República', source: 'EL OBSERVADOR' }
        ]
      },
      {
        id: 'territorio',
        title: 'TERRITORIO Y DESIERTO',
        fragments: [
          { text: 'la extensión y el desierto', source: 'LA VOZ DE LA PAMPA' },
          { text: 'la inmensidad de la Pampa', source: 'LA VOZ DE LA PAMPA' },
          { text: 'ríos y comunicación', source: 'LA VOZ DE LA PAMPA' }
        ]
      },
      {
        id: 'ciudad-campana',
        title: 'CIUDAD Y CAMPAÑA',
        fragments: [
          { text: 'concentración de Buenos Aires', source: 'CORRESPONDENCIA DEL PLATA' },
          { text: 'ciudad como centro de civilización', source: 'CORRESPONDENCIA DEL PLATA' },
          { text: 'ciudad y campaña', source: 'CORRESPONDENCIA DEL PLATA' }
        ]
      },
      {
        id: 'vida-rural',
        title: 'VIDA PASTORIL Y GAUCHO',
        fragments: [
          { text: 'aislamiento de la campaña', source: 'EL DIARIO DE LA CAMPAÑA' },
          { text: 'vida pastoril y ganado', source: 'EL DIARIO DE LA CAMPAÑA' },
          { text: 'fuerza individual del gaucho', source: 'EL DIARIO DE LA CAMPAÑA' }
        ]
      }

];

const recortesTableroNivelUno = gruposTableroNivelUno.flatMap((grupo) =>
  grupo.fragments.map((fragmento, indiceFragmento) => ({
    id: `${grupo.id}-${indiceFragmento}`,
    groupId: grupo.id,
    groupTitle: grupo.title,
    text: fragmento.text,
    source: fragmento.source
  }))
);


/* ===== estadoJuego.js ===== */
/**
 * Estado mutable de una partida del Nivel 1.
 * Centraliza el progreso y evita variables globales repartidas.
 */
class EstadoJuego {
  constructor() {
    this.reiniciar();
  }

  reiniciar() {
    this.diariosRecolectados = new Set();
    this.diarioActual = 0;
    this.frasesClaveActuales = new Set();
    this.indicePregunta = 0;
    this.puntuacionPreguntas = 0;
    this.seleccionTablero = [];
    this.gruposTableroCompletados = new Set();
    this.puntuacionTablero = 0;
  }
}


/* ===== diarios.js ===== */
/**
 * Gestiona la lectura de los diarios y la recolección de frases clave.
 * Su responsabilidad termina cuando todas las fuentes fueron recolectadas.
 */


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


/* ===== preguntas.js ===== */
/**
 * Gestiona el cuestionario posterior a la lectura.
 * Renderiza preguntas, muestra retroalimentación y registra la puntuación.
 */


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


/* ===== tablero.js ===== */
/**
 * Gestiona el tablero de investigación y las tríadas de recortes.
 * Encapsula selección, validación, progreso y finalización del tablero.
 */


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


/* ===== nivelUno.js ===== */
/**
 * Orquestador del Nivel 1.
 * Coordina módulos especializados sin concentrar toda la lógica en una sola clase.
 */







class NivelUno {
  constructor(audio, alSalir) {
    this.audio = audio;
    this.alSalir = alSalir;
    this.elementos = obtenerElementosNivelUno();
    this.estado = new EstadoJuego();

    this.gestorDiarios = new GestorDiarios({
      elementos: this.elementos,
      estado: this.estado,
      diarios: diariosNivelUno,
      audio: this.audio,
      alCompletarTodos: () => this.gestorPreguntas.abrir()
    });

    this.gestorPreguntas = new GestorPreguntas({
      elementos: this.elementos,
      estado: this.estado,
      preguntas: preguntasNivelUno,
      audio: this.audio,
      alFinalizar: () => this.gestorTablero.abrir()
    });

    this.gestorTablero = new GestorTablero({
      elementos: this.elementos,
      estado: this.estado,
      grupos: gruposTableroNivelUno,
      recortes: recortesTableroNivelUno,
      audio: this.audio,
      alFinalizar: () => this.finalizarNivel()
    });

    this.inicializarEventos();
  }

  inicializarEventos() {
    this.gestorDiarios.inicializarEventos();
    this.gestorPreguntas.inicializarEventos();
    this.gestorTablero.inicializarEventos();

    this.elementos.botonVolverMenu.addEventListener('click', () => {
      this.audio.reproducirClick();
      this.audio.detenerHojas();
      this.alSalir(1);
    });
  }

  iniciar() {
    this.reiniciar();
    this.audio.reproducirClick();
    alternarPantalla(this.elementos.juegoPantalla, true);
  }

  reiniciar() {
    this.estado.reiniciar();

    document.querySelectorAll('.newspaper').forEach((diario) => {
      diario.classList.remove('collected');
    });

    this.gestorDiarios.iniciar();
    [
      this.elementos.diarioModal,
      this.elementos.cuestionarioModal,
      this.elementos.tableroModal,
      this.elementos.nivelCompletadoModal
    ].forEach(ocultar);

    this.audio.detenerHojas();
  }

  finalizarNivel() {
    this.elementos.resultadoDiarios.textContent =
      `${this.estado.diariosRecolectados.size} / ${diariosNivelUno.length} DIARIOS`;
    this.elementos.resultadoPreguntas.textContent =
      `${this.estado.puntuacionPreguntas} / ${preguntasNivelUno.length} RESPUESTAS · ${this.estado.puntuacionTablero} / ${gruposTableroNivelUno.length} TRÍADAS`;

    this.elementos.nivelCompletadoModal.classList.remove('hidden');
    this.audio.detenerHojas();
    this.audio.reproducirClick();
  }
}


/* ===== inicializacion.js ===== */
/**
 * Inicializa la aplicación y conecta los módulos principales.
 * Es el punto de composición donde se crean servicios y callbacks.
 */






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


/* ===== principal.js ===== */
/**
 * Punto de entrada de la aplicación.
 * Espera al DOM y delega la composición en inicializacion.js.
 */


document.addEventListener('DOMContentLoaded', inicializarAplicacion);
