/**
 * Inicializa la aplicación y conecta los módulos principales.
 * Es el punto de composición donde se crean servicios y callbacks.
 */

import { GestorAudio } from './audio.js';
import { GestorMenu } from './menu.js';
import { NivelUno } from '../Nivel 1/nivelUno.js';
import { NivelDos } from '../Nivel 2/nivelDos.js';
import { NivelCuatroPlataformas } from '../Nivel 4/nivelCuatroPlataformas.js';
import { NIVEL_JUGABLE, NIVEL_DOS_JUGABLE } from './configuracion.js';
import { alternarPantalla } from './interfaz.js';
import { eliminarPartidaGuardada } from './persistencia.js';
import { mostrarIntroduccion } from './introducciones.js';

function inicializarAplicacion() {
  const audio = new GestorAudio();
  let nivelActual = NIVEL_JUGABLE;
  let nivelUno = null;
  let nivelDos = null;
  let nivelCuatro = null;
  let menu = null;

  const volverAlMenuTrasNivel = (idPantallaJuego, nivelCompletado) => {
    try { sessionStorage.removeItem('facundo-nivel-en-curso'); } catch (_) {}
    const pantallaJuego = document.getElementById(idPantallaJuego);
    alternarPantalla(pantallaJuego, false);
    audio.detenerHojas();
    menu.mostrarSeleccionTrasCompletar(nivelCompletado);
  };

  const iniciarNivel = (nivelSeleccionado) => {
    nivelActual = Number(nivelSeleccionado);

    // Niveles con instancia jugable integrada.
    if (nivelActual === 3) {
      ['start-screen', 'level-select-screen', 'credits-screen', 'settings-screen', 'help-screen', 'game-screen-cuatro']
        .forEach((id) => {
          const pantalla = document.getElementById(id);
          if (pantalla) alternarPantalla(pantalla, false);
        });
      alternarPantalla(document.getElementById('level-three-screen'), true);
      // Cada entrada inicia una partida limpia del Nivel 3. Primero se muestra
      // el contexto narrativo del capítulo, como en los niveles 1 y 2; al
      // continuar, queda visible la introducción de controles propia del nivel.
      const marcoNivelTres = document.getElementById('level-three-frame');
      if (marcoNivelTres) marcoNivelTres.src = `./Secciones%20HTML/Nivel%203/nivelTres.html?entrada=${Date.now()}`;
      document.documentElement.classList.remove('resume-in-progress');
      try {
        sessionStorage.setItem('facundo-nivel-en-curso', '3');
        sessionStorage.removeItem('facundo-pantalla-actual');
      } catch (_) {}
      mostrarIntroduccion({
        etiqueta: 'CAPÍTULO 3 · CONSTRUCTORA DEL PARANÁ',
        titulo: 'Un puente para unir las orillas',
        texto: `El recorrido continúa en la campaña, junto al río Paraná. En este nivel vas a participar de la construcción de un puente: tendrás que obtener madera, transformarla en materiales útiles, organizar el trabajo y completar sus seis tramos.

La construcción sirve también como punto de partida para pensar cómo las obras, los caminos y el control de los pasos entre regiones se relacionaban con la organización del territorio en el siglo XIX. Prestá atención a los fragmentos históricos que aparecerán durante el trabajo: aportan contexto para interpretar la época, además de explicar la tarea que estás realizando.`,
        boton: 'ENTRAR AL CONTEXTO DEL NIVEL'
      });
      return;
    }

    if (![NIVEL_JUGABLE, NIVEL_DOS_JUGABLE, 4].includes(nivelActual)) {
      const retroalimentacion = document.getElementById('level-select-feedback');
      retroalimentacion.textContent = `NIVEL ${nivelActual} DESBLOQUEADO · SU INSTANCIA JUGABLE TODAVÍA NO ESTÁ INTEGRADA`;
      return;
    }

    // Ocultar todas las pantallas de navegación antes de mostrar el nivel.
    // Esto también evita que el menú principal quede visible detrás del juego.
    ['start-screen', 'level-select-screen', 'credits-screen', 'settings-screen', 'help-screen', 'game-screen-cuatro']
      .forEach((id) => {
        const pantalla = document.getElementById(id);
        if (pantalla) alternarPantalla(pantalla, false);
      });

    if (nivelActual === NIVEL_JUGABLE) {
      if (!nivelUno) {
        nivelUno = new NivelUno(audio, (nivelCompletado) => {
          volverAlMenuTrasNivel('game-screen', nivelCompletado);
        });
      }
      nivelUno.iniciar();
      document.documentElement.classList.remove('resume-in-progress');
      return;
    }

    if (nivelActual === 4) {
      if (!nivelCuatro) {
        nivelCuatro = new NivelCuatroPlataformas(
          () => volverAlMenuTrasNivel('game-screen-cuatro', 4),
          () => { alternarPantalla(document.getElementById('game-screen-cuatro'), false); menu.mostrarSeleccionNiveles(); }
        );
      }
      alternarPantalla(document.getElementById('game-screen-cuatro'), true);
      document.documentElement.classList.remove('resume-in-progress');
      // Contexto histórico previo, igual que en los otros niveles.
      // La instancia queda detenida hasta que el usuario cierre esta introducción.
      if (nivelCuatro) nivelCuatro.detener();
      mostrarIntroduccion({
        etiqueta: 'CAPÍTULO IV · REVOLUCIÓN DE 1810',
        titulo: 'El camino de las montoneras',
        texto: 'En 1810, la Revolución de Mayo abrió un período de cambios y conflictos en el territorio del antiguo Virreinato del Río de la Plata. La autoridad de la nueva Junta no fue aceptada de la misma manera en todas las regiones, y los caminos rurales conectaban ranchos, pueblos y campamentos en medio de las disputas políticas y militares. En este recorrido tendrás que llevar una carta desde el rancho hasta un asentamiento, superar peligros y leer documentos que ayudan a comprender la época.',
        boton: 'CONTINUAR AL NIVEL',
        alContinuar: () => {
          if (nivelCuatro) {
            nivelCuatro.reiniciarEstado();
            nivelCuatro.overlay.style.display = '';
            nivelCuatro.overlay.classList.remove('hidden');
            document.getElementById('plataformas-titulo').textContent = 'El camino de las montoneras';
            document.getElementById('plataformas-mensaje').textContent = 'Llevá la carta desde el rancho hasta el asentamiento. Saltá zanjas, evitá peligros y descubrí breves notas históricas.';
            document.getElementById('plataformas-jugar').textContent = 'JUGAR';
          }
        }
      });
      return;
    }

    if (!nivelDos) {
      nivelDos = new NivelDos(audio, (nivelCompletado) => {
        volverAlMenuTrasNivel('game-screen-dos', nivelCompletado);
      });
    }
    nivelDos.iniciar();
    document.documentElement.classList.remove('resume-in-progress');
  };

  menu = new GestorMenu(audio, iniciarNivel);
  // El Nivel 3 se ejecuta aislado en un iframe y avisa cuando se completa.
  window.addEventListener('message', (evento) => {
    if (Number(evento.data?.nivel) !== 3) return;
    if (evento.data?.tipo === 'facundo-pausa-alternar') {
      if (pausaAbierta) cerrarPausa(); else abrirPausa();
    } else if (evento.data?.tipo === 'facundo-nivel-completado') {
      try { sessionStorage.removeItem('facundo-nivel-en-curso'); } catch (_) {}
      alternarPantalla(document.getElementById('level-three-screen'), false);
      menu.mostrarSeleccionTrasCompletar(3);
    } else if (evento.data?.tipo === 'facundo-volver-a-niveles') {
      try { sessionStorage.removeItem('facundo-nivel-en-curso'); } catch (_) {}
      alternarPantalla(document.getElementById('level-three-screen'), false);
      menu.mostrarSeleccionNiveles();
    }
  });

  // Menú de pausa compartido: Escape en PC y botón ☰/× en móviles y tabletas.
  const pausa = document.getElementById('game-pause-menu');
  const musicaPausa = document.getElementById('pause-music-volume');
  const sonidosPausa = document.getElementById('pause-sfx-volume');
  const musicaValor = document.getElementById('pause-music-value');
  const sonidosValor = document.getElementById('pause-sfx-value');
  const efectosOn = document.getElementById('pause-effects-on');
  const efectosOff = document.getElementById('pause-effects-off');
  const botonConfiguracionPausa = document.getElementById('pause-open-settings');
  let configuracionDesdePausa = false;
  let pausaAbierta = false;
  const idsPantallasJuego = [
    'game-screen', 'game-screen-dos', 'game-screen-cuatro', 'level-three-screen',
    'escena-rastreador', 'escena-baqueano', 'escena-gaucho-malo', 'escena-cantor'
  ];
  const nivelVisible = () => idsPantallasJuego.some((id) => {
    const pantalla = document.getElementById(id);
    return pantalla && !pantalla.classList.contains('hidden');
  });
  const avisarPausaNivelTres = (pausado) => {
    const marco = document.getElementById('level-three-frame');
    try { marco?.contentWindow?.postMessage({ tipo: 'facundo-estado-pausa', pausado, nivel: 3 }, '*'); } catch (_) {}
  };
  const establecerPausaNiveles = (pausado) => {
    nivelDos?.establecerPausa?.(pausado);
    nivelCuatro?.establecerPausa?.(pausado);
    const nivelTresVisible = document.getElementById('level-three-screen') && !document.getElementById('level-three-screen').classList.contains('hidden');
    if (nivelTresVisible) avisarPausaNivelTres(pausado);
  };
  const abrirPausa = () => {
    if (!pausa || !nivelVisible() || pausaAbierta) return;
    pausaAbierta = true;
    establecerPausaNiveles(true);
    pausa.classList.remove('hidden');
    document.documentElement.classList.add('menu-pausa-abierto');
    document.getElementById('pause-resume')?.focus();
  };
  const cerrarPausa = ({ reanudar = true } = {}) => {
    if (!pausa) return;
    pausaAbierta = false;
    if (reanudar) {
      establecerPausaNiveles(false);
      document.documentElement.classList.remove('menu-pausa-abierto');
    }
    pausa.classList.add('hidden');
  };
  document.querySelectorAll('.game-pause-trigger').forEach((boton) => boton.addEventListener('click', abrirPausa));
  window.addEventListener('message', (evento) => {
    if (evento.data?.tipo === 'abrir-menu-pausa-nivel-tres') abrirPausa();
  });
  document.getElementById('game-pause-close')?.addEventListener('click', cerrarPausa);
  document.getElementById('pause-resume')?.addEventListener('click', cerrarPausa);
  document.addEventListener('keydown', (evento) => {
    if (configuracionDesdePausa && evento.key === 'Escape') {
      evento.preventDefault();
      alternarPantalla(document.getElementById('settings-screen'), false);
      document.getElementById('settings-screen')?.classList.remove('settings-from-pause');
      document.getElementById('level-three-screen')?.classList.remove('pausa-configuracion-activa');
      configuracionDesdePausa = false;
      abrirPausa();
      return;
    }
    if (pausaAbierta && evento.key !== 'Escape' && !['Tab','ArrowLeft','ArrowRight','Home','End'].includes(evento.key)) { evento.stopImmediatePropagation(); return; }
    if (evento.key === 'Escape' && nivelVisible()) {
      evento.preventDefault();
      if (pausaAbierta) cerrarPausa(); else abrirPausa();
    }
  });
  document.getElementById('pause-restart-level')?.addEventListener('click', () => {
    if (!nivelVisible()) return;
    const confirmar = window.confirm('¿Querés reiniciar este nivel desde el principio? Se perderá el progreso de la partida actual.');
    if (!confirmar) return;
    cerrarPausa();
    // Borrar el guardado persistente ANTES de iniciar: iniciar() carga el
    // progreso guardado de forma asíncrona y, si no se elimina, restaura
    // inmediatamente las pistas/preguntas que acabamos de reiniciar.
    eliminarPartidaGuardada();
    try {
      sessionStorage.setItem('facundo-nivel-en-curso', String(nivelActual));
      sessionStorage.removeItem('facundo-pantalla-actual');
    } catch (_) {}
    if (nivelActual === 3) {
      const marco = document.getElementById('level-three-frame');
      if (marco) marco.src = `./Secciones%20HTML/Nivel%203/nivelTres.html?reinicio=${Date.now()}`;
      alternarPantalla(document.getElementById('level-three-screen'), true);
    } else {
      iniciarNivel(nivelActual);
    }
  });

  document.getElementById('pause-level-select')?.addEventListener('click', () => {
    cerrarPausa({ reanudar: false });
    nivelUno?.detener?.();
    nivelDos?.detener?.();
    nivelCuatro?.detener?.();
    document.documentElement.classList.remove('menu-pausa-abierto');
    configuracionDesdePausa = false;
    idsPantallasJuego.forEach((id) => {
      const pantalla = document.getElementById(id);
      if (pantalla) alternarPantalla(pantalla, false);
    });
    try { sessionStorage.removeItem('facundo-nivel-en-curso'); sessionStorage.setItem('facundo-pantalla-actual', 'seleccion'); } catch (_) {}
    menu.mostrarSeleccionNiveles();
  });

  botonConfiguracionPausa?.addEventListener('click', () => {
    if (!nivelVisible()) return;
    configuracionDesdePausa = true;
    // La partida permanece detenida detrás de la pantalla de configuración.
    cerrarPausa({ reanudar: false });
    const nivelTres = document.getElementById('level-three-screen');
    if (nivelTres && !nivelTres.classList.contains('hidden')) {
      nivelTres.classList.add('pausa-configuracion-activa');
      // La pantalla de configuración se superpone al juego y al volver se recupera la partida.
    }
    const pantallaConfiguracion = document.getElementById('settings-screen');
    pantallaConfiguracion?.classList.add('settings-from-pause');
    alternarPantalla(pantallaConfiguracion, true);
  });

  document.addEventListener('click', (evento) => {
    if (evento.target?.closest('#btn-back-settings') && configuracionDesdePausa) {
      evento.preventDefault();
      evento.stopImmediatePropagation();
      alternarPantalla(document.getElementById('settings-screen'), false);
      document.getElementById('settings-screen')?.classList.remove('settings-from-pause');
      const nivelTres = document.getElementById('level-three-screen');
      nivelTres?.classList.remove('pausa-configuracion-activa');
      configuracionDesdePausa = false;
      abrirPausa();
    }
  }, true);
  const actualizarValor = (rango, salida) => { if (rango && salida) salida.value = `${rango.value}%`; };
  if (musicaPausa) {
    musicaPausa.value = String(audio.volumenMusica);
    actualizarValor(musicaPausa, musicaValor);
    musicaPausa.addEventListener('input', () => { audio.establecerVolumenMusica(musicaPausa.value); actualizarValor(musicaPausa, musicaValor); const ajuste = document.getElementById('music-volume'); if (ajuste) ajuste.value = musicaPausa.value; });
  }
  if (sonidosPausa) {
    sonidosPausa.value = String(audio.volumenGeneral);
    actualizarValor(sonidosPausa, sonidosValor);
    sonidosPausa.addEventListener('input', () => { audio.establecerVolumenGeneral(sonidosPausa.value); actualizarValor(sonidosPausa, sonidosValor); const ajuste = document.getElementById('general-volume'); if (ajuste) ajuste.value = sonidosPausa.value; });
  }
  const actualizarBotonesEfectos = () => { efectosOn?.classList.toggle('is-selected', audio.efectosActivados); efectosOff?.classList.toggle('is-selected', !audio.efectosActivados); };
  efectosOn?.addEventListener('click', () => { audio.establecerEfectosActivados(true); actualizarBotonesEfectos(); });
  efectosOff?.addEventListener('click', () => { audio.establecerEfectosActivados(false); actualizarBotonesEfectos(); });
  actualizarBotonesEfectos();

  // Si se recarga la página durante un nivel, volver directamente a ese nivel.
  // El nivel recupera su progreso desde persistencia.js al inicializarse.
  try {
    const pantallaGuardada = sessionStorage.getItem('facundo-pantalla-actual');
    const nivelEnCurso = Number(sessionStorage.getItem('facundo-nivel-en-curso'));
    // La pantalla de navegación guardada tiene prioridad: si el usuario está
    // en selección de niveles y pulsa F5, no debe reabrirse un nivel ni el inicio.
    // Si hay un nivel activo, siempre tiene prioridad sobre la pantalla guardada.
    // Así F5 dentro del Nivel 2 vuelve al Nivel 2, aunque antes se haya pasado por selección.
    if (nivelEnCurso === NIVEL_JUGABLE || nivelEnCurso === NIVEL_DOS_JUGABLE || nivelEnCurso === 4) {
      iniciarNivel(nivelEnCurso);
    } else if (pantallaGuardada === 'seleccion') {
      menu.mostrarSeleccionNiveles();
    }
    // Sin una pantalla guardada en esta sesión, se mantiene el menú principal por defecto.
  } catch (error) {
    // Si el almacenamiento no está disponible, se conserva el menú normal.
  }
}

export { inicializarAplicacion };
