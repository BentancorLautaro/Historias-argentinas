/**
 * Punto de entrada de la aplicación.
 * Espera al DOM y delega la composición en inicializacion.js.
 */

import { inicializarAplicacion } from './inicializacion.js';

document.addEventListener('DOMContentLoaded', inicializarAplicacion);
