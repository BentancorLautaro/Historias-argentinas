/**
 * Configuración central del juego.
 * Contiene valores compartidos y evita números mágicos entre módulos.
 */

const NIVEL_MINIMO = 1;
const NIVEL_MAXIMO = 5;
const NIVEL_JUGABLE = 1;
// Segundo nivel con instancia jugable integrada: "Voces en la Pulpería".
const NIVEL_DOS_JUGABLE = 2;
const CLAVE_NIVEL_DESBLOQUEADO = 'facundo-unlocked-level';
const VOLUMEN_INICIAL = 50;

// Clave de almacenamiento para la funcionalidad de guardar/recuperar partida.
const CLAVE_PARTIDA_GUARDADA = 'facundo-partida-guardada';

export {
  NIVEL_MINIMO,
  NIVEL_MAXIMO,
  NIVEL_JUGABLE,
  NIVEL_DOS_JUGABLE,
  CLAVE_NIVEL_DESBLOQUEADO,
  VOLUMEN_INICIAL,
  CLAVE_PARTIDA_GUARDADA
};
