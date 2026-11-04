/**
 * Persistencia mínima del progreso de niveles.
 * Aísla localStorage del resto de la aplicación.
 */

import {
  CLAVE_NIVEL_DESBLOQUEADO,
  NIVEL_MINIMO,
  NIVEL_MAXIMO,
  CLAVE_PARTIDA_GUARDADA
} from './configuracion.js';

// Versión del formato de guardado. Permite detectar guardados de versiones
// anteriores incompatibles sin romper la carga (Madurez: degradación segura).
const VERSION_GUARDADO = 1;

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

/**
 * Guarda el progreso de la partida en curso (puntaje, avance por diarios/
 * personajes, cuestionario y tablero, y nivel actual).
 *
 * Disponibilidad: la escritura se resuelve en una microtarea para no
 * bloquear el hilo principal del juego, de modo que la interfaz siga
 * respondiendo aunque el guardado se dispare durante la partida.
 *
 * Madurez: toda la operación está protegida con try/catch. Si el
 * almacenamiento no está disponible (modo privado, cuota superada, etc.)
 * la función nunca lanza una excepción hacia el llamador: devuelve un
 * resultado con "exito: false" y un mensaje para mostrarle al jugador.
 *
 * @param {number} nivel Nivel actualmente en juego (1 o 2).
 * @param {object} estado Instancia de EstadoJuego o EstadoNivelDos.
 * @returns {Promise<{exito: boolean, error?: string}>}
 */
function guardarPartida(nivel, estado) {
  return new Promise((resolve) => {
    queueMicrotask(() => {
      try {
        const partida = {
          version: VERSION_GUARDADO,
          nivel,
          fecha: new Date().toISOString(),
          diariosRecolectados: [...(estado.diariosRecolectados || [])],
          puntuacionPreguntas: estado.puntuacionPreguntas,
          gruposTableroCompletados: [...(estado.gruposTableroCompletados || [])],
          puntuacionTablero: estado.puntuacionTablero,
          personajesInterrogados: [...(estado.personajesInterrogados || [])],
          misionBaqueanoIniciada: Boolean(estado.misionBaqueanoIniciada),
          misionBaqueanoActiva: Boolean(estado.misionBaqueanoActiva),
          misionBaqueanoCompletada: Boolean(estado.misionBaqueanoCompletada),
          misionBaqueanoPendienteInforme: Boolean(estado.misionBaqueanoPendienteInforme),
          misionBaqueanoHablados: [...(estado.misionBaqueanoHablados || [])]
        };

        localStorage.setItem(CLAVE_PARTIDA_GUARDADA, JSON.stringify(partida));
        resolve({ exito: true });
      } catch (error) {
        // No se interrumpe el juego: se informa el fallo de forma controlada.
        resolve({ exito: false, error: 'No se pudo guardar la partida.' });
      }
    });
  });
}

/**
 * Recupera la partida guardada, si existe y es válida.
 *
 * Madurez: valida la forma de los datos antes de devolverlos. Un archivo
 * corrupto, incompleto o de una versión no soportada se descarta de forma
 * segura (se elimina y se devuelve null) en lugar de romper la carga del
 * nivel o dejar el estado del juego a medio construir.
 *
 * @returns {Promise<object|null>} Datos de la partida o null si no hay
 * guardado válido disponible.
 */
function cargarPartida() {
  return new Promise((resolve) => {
    queueMicrotask(() => {
      try {
        const crudo = localStorage.getItem(CLAVE_PARTIDA_GUARDADA);
        if (!crudo) {
          resolve(null);
          return;
        }

        const partida = JSON.parse(crudo);

        const esValida =
          partida &&
          partida.version === VERSION_GUARDADO &&
          Number.isInteger(partida.nivel) &&
          Array.isArray(partida.diariosRecolectados) &&
          Array.isArray(partida.gruposTableroCompletados) &&
          Number.isFinite(partida.puntuacionPreguntas) &&
          Number.isFinite(partida.puntuacionTablero);

        if (!esValida) {
          localStorage.removeItem(CLAVE_PARTIDA_GUARDADA);
          resolve(null);
          return;
        }

        resolve(partida);
      } catch (error) {
        // JSON corrupto u otro fallo de lectura: se limpia el guardado
        // dañado para que no vuelva a fallar en el próximo intento.
        try {
          localStorage.removeItem(CLAVE_PARTIDA_GUARDADA);
        } catch (errorSecundario) {
          // Si ni siquiera se puede limpiar, se ignora: no debe romper el juego.
        }
        resolve(null);
      }
    });
  });
}

function existePartidaGuardada() {
  try {
    return localStorage.getItem(CLAVE_PARTIDA_GUARDADA) !== null;
  } catch (error) {
    return false;
  }
}

function eliminarPartidaGuardada() {
  try {
    localStorage.removeItem(CLAVE_PARTIDA_GUARDADA);
  } catch (error) {
    // Sin efecto si el almacenamiento no está disponible.
  }
}

export {
  obtenerNivelDesbloqueado,
  guardarNivelDesbloqueado,
  guardarPartida,
  cargarPartida,
  existePartidaGuardada,
  eliminarPartidaGuardada
};
