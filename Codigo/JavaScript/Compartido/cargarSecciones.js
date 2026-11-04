/**
 * Carga las secciones HTML antes de iniciar la lógica del juego.
 * Prueba varias bases y variantes de ruta para tolerar diferencias en la
 * ubicación desde la que se publica el proyecto. Abrir mediante un servidor
 * local (por ejemplo XAMPP); fetch no funciona correctamente con file://.
 */
const SECCIONES = [
  'Secciones HTML/Compartido/menu-principal.html',
  'Secciones HTML/Compartido/ayuda.html',
  'Secciones HTML/Compartido/seleccion-niveles.html',
  'Secciones HTML/Nivel 1/nivel-uno.html',
  'Secciones HTML/Nivel 2/nivel-dos.html',
  'Secciones HTML/Nivel 4/nivel-cuatro-plataformas.html',
  'Secciones HTML/Compartido/pantallas-secundarias.html'
];

const BASES_RUTA = [
  new URL('../../', import.meta.url), // raíz Codigo/
  new URL('../../../Codigo/', import.meta.url),
  new URL('../../../', import.meta.url),
  new URL('./', document.baseURI)
];

function variantesRuta(ruta) {
  const normalizada = ruta.replace(/\\/g, '/').replace(/^\.\//, '');
  const codificada = normalizada.split('/').map(encodeURIComponent).join('/');
  const sinEspacios = normalizada.replace(/ /g, '%20');
  return [...new Set([normalizada, codificada, sinEspacios])];
}

async function buscarYLeerArchivo(ruta) {
  const intentos = [];
  for (const base of BASES_RUTA) {
    for (const variante of variantesRuta(ruta)) {
      const url = new URL(variante, base);
      if (intentos.some((anterior) => anterior.href === url.href)) continue;
      intentos.push(url);
    }
  }

  const errores = [];
  // Intentar cada ruta de forma secuencial: un 404 no cancela la búsqueda.
  for (const url of intentos) {
    try {
      const respuesta = await fetch(url);
      if (respuesta.ok) {
        const contenido = await respuesta.text();
        console.info(`[cargarSecciones] Archivo encontrado: ${url.href}`);
        return contenido;
      }
      errores.push(`${url.href} (${respuesta.status})`);
    } catch (error) {
      errores.push(`${url.href} (${error?.message || 'error de red'})`);
    }
  }

  throw new Error(
    `No se encontró el archivo "${ruta}". Rutas probadas:\n${errores.join('\n')}`
  );
}

async function cargarSecciones() {
  const app = document.getElementById('game-app');
  const indicador = document.getElementById('app-sections-loading');

  try {
    if (!app) throw new Error('No existe el contenedor #game-app');

    const fragmentos = [];
    const fallos = [];
    // Cargar cada sección independientemente para informar todos los faltantes.
    for (const ruta of SECCIONES) {
      try {
        fragmentos.push(await buscarYLeerArchivo(ruta));
      } catch (error) {
        fallos.push(error.message);
        console.error(`[cargarSecciones] Falló "${ruta}":`, error);
      }
    }

    if (fallos.length) {
      throw new Error(
        `No se pudieron encontrar ${fallos.length} sección(es):\n${fallos.join('\n\n')}`
      );
    }

    indicador?.remove();
    for (const html of fragmentos) app.insertAdjacentHTML('beforeend', html);

    // El Nivel 3 tiene un único documento HTML (nivelTres.html).
    // Su marco de navegación se genera aquí para evitar mantener un segundo HTML.
    if (!document.getElementById('level-three-screen')) {
      app.insertAdjacentHTML('beforeend', '<section id="level-three-screen" class="screen level-three-screen hidden" aria-label="Nivel 3: Constructora del Paraná"><iframe id="level-three-frame" title="Constructora del Paraná, nivel 3" src="./Secciones%20HTML/Nivel%203/nivelTres.html" allow="autoplay"></iframe></section>');
    }

    const { repararSpritesNivelDos } = await import('./buscadorSprites.js');
    await repararSpritesNivelDos(app);
    const { inicializarAplicacion } = await import('./inicializacion.js');
    inicializarAplicacion();
  } catch (error) {
    console.error('Error al cargar el juego:', error);
    if (error?.stack) console.error('Pila completa del error:', error.stack);
    if (indicador) {
      indicador.textContent =
        'No se pudieron cargar algunos archivos. Abrí el juego desde el servidor local de XAMPP y revisá la consola: se muestran todas las rutas probadas.';
    }
  }
}

cargarSecciones();
