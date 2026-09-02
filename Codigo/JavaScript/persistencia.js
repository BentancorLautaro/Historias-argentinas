/**
 * Persistencia mínima del progreso de niveles.
 * Aísla localStorage del resto de la aplicación.
 */

import {
  CLAVE_NIVEL_DESBLOQUEADO,
  NIVEL_MINIMO,
  NIVEL_MAXIMO
} from './configuracion.js';

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

export { obtenerNivelDesbloqueado, guardarNivelDesbloqueado };
