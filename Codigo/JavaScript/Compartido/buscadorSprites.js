// Buscador global de sprites: usa un índice de todos los recursos gráficos del juego.
// No depende de que el archivo esté en la carpeta esperada ni de mayúsculas/minúsculas.
const INDICE_SPRITES_JUEGO = ["../../../Assets/Recursos Graficos/Nivel 4/vida.svg", "../../../Assets/Recursos Graficos/Nivel 4/Nivel cuatro imagen.png", "../../../Assets/Recursos Graficos/Nivel 4/nota-documento.svg", "../../../Assets/Recursos Graficos/Nivel 3/Nivel tres imagen.png", "../../../Assets/Recursos Graficos/Nivel 2/Sprites/6.png", "../../../Assets/Recursos Graficos/Nivel 2/Sprites/4.png", "../../../Assets/Recursos Graficos/Nivel 2/Sprites/5.png", "../../../Assets/Recursos Graficos/Nivel 2/Sprites/3.png", "../../../Assets/Recursos Graficos/Nivel 2/Sprites/7.png", "../../../Assets/Recursos Graficos/Nivel 2/Sprites/2.png", "../../../Assets/Recursos Graficos/Nivel 2/Sprites/1.png", "../../../Assets/Recursos Graficos/Nivel 2/Interior pulperia.png", "../../../Assets/Recursos Graficos/Nivel 2/Nivel dos imagen.png", "../../../Assets/Recursos Graficos/Nivel 2/Mapa Pueblo Nivel Dos.jpg", "../../../Assets/Recursos Graficos/Nivel 2/Mapa Pueblo Nivel Dos1.jpg", "../../../Assets/Recursos Graficos/Nivel 2/pista_rastreador.png", "../../../Assets/Recursos Graficos/Compartido/Boton apagado.png", "../../../Assets/Recursos Graficos/Compartido/Fondo del menu de Jugar.png", "../../../Assets/Recursos Graficos/Compartido/Div Configuracion.png", "../../../Assets/Recursos Graficos/Compartido/Boton de menu principal.png", "../../../Assets/Recursos Graficos/Compartido/Boton encendido.png", "../../../Assets/Recursos Graficos/Compartido/Boton de configuracion.png", "../../../Assets/Recursos Graficos/Compartido/Fondo.png", "../../../Assets/Recursos Graficos/Compartido/Icono configuracion cuadrado.png", "../../../Assets/Recursos Graficos/Compartido/Fondo de la Configuraci#U00f3n.png", "../../../Assets/Recursos Graficos/Compartido/gaucho-jugador.svg", "../../../Assets/Recursos Graficos/Nivel 1/Nivel uno imagen.png", "../../../Assets/Recursos Graficos/Nivel 5/Nivel cinco imagen.png", "../../../Assets/Sprites/Nivel 4/Peligros/Fogata.png", "../../../Assets/Sprites/Nivel 4/Peligros/Pinchos.png", "../../../Assets/Sprites/Nivel 4/Guardia/Quieto_Mirando_Izquierda.png", "../../../Assets/Sprites/Nivel 4/Guardia/Caminando_Mirando_Derecha.png", "../../../Assets/Sprites/Nivel 4/Guardia/Saltando_Mirando_Derecha.png", "../../../Assets/Sprites/Nivel 4/Guardia/Cayendo_Mirando_Derecha.png", "../../../Assets/Sprites/Nivel 4/Guardia/Saltando_Mirando_Izquierda.png", "../../../Assets/Sprites/Nivel 4/Guardia/Sentado_Mirando_Izquierda.png", "../../../Assets/Sprites/Nivel 4/Guardia/Sentado_Mirando_derecha.png", "../../../Assets/Sprites/Nivel 4/Guardia/En_El_Antes_De_Empezar_a_Caer_Mirando_Derecha.png", "../../../Assets/Sprites/Nivel 4/Guardia/Caminando_Mirando_Izquierda.png", "../../../Assets/Sprites/Nivel 4/Guardia/Cayendo_Mirando_Izquierda.png", "../../../Assets/Sprites/Nivel 4/Guardia/Quieto_Mirando_Derecha.png", "../../../Assets/Sprites/Nivel 4/Guardia/En_El_Antes_De_Empezar_a_Caer_Mirando_Izquierda.png", "../../../Assets/Sprites/Nivel 4/Jugador/Quieto_Mirando_Izquierda.png", "../../../Assets/Sprites/Nivel 4/Jugador/Caminando_Mirando_Derecha.png", "../../../Assets/Sprites/Nivel 4/Jugador/Saltando_Mirando_Derecha.png", "../../../Assets/Sprites/Nivel 4/Jugador/Cayendo_Mirando_Derecha.png", "../../../Assets/Sprites/Nivel 4/Jugador/Saltando_Mirando_Izquierda.png", "../../../Assets/Sprites/Nivel 4/Jugador/Sentado_Mirando_Izquierda.png", "../../../Assets/Sprites/Nivel 4/Jugador/En_El_Antes_De_Empezar_a_Caer_Mirando_Derecha.png", "../../../Assets/Sprites/Nivel 4/Jugador/Caminando_Mirando_Izquierda.png", "../../../Assets/Sprites/Nivel 4/Jugador/Cayendo_Mirando_Izquierda.png", "../../../Assets/Sprites/Nivel 4/Jugador/Quieto_Mirando_Derecha.png", "../../../Assets/Sprites/Nivel 4/Jugador/En_El_Antes_De_Empezar_a_Caer_Mirando_Izquierda.png", "../../../Assets/Sprites/Nivel 2/Npcs/npc-baqueano-frente.png", "../../../Assets/Sprites/Nivel 2/Npcs/npc-dona-jacinta-frente.png", "../../../Assets/Sprites/Nivel 2/Npcs/npc-cantor-frente.png", "../../../Assets/Sprites/Nivel 2/Npcs/npc-gaucho-malo-frente.png", "../../../Assets/Sprites/Nivel 2/Npcs/npc-rastreador-frente.png", "../../../Assets/Sprites/Nivel 2/Npcs/npc-tomasa-curandera-frente.png", "../../../Assets/Sprites/Nivel 2/Npcs/npc-mateo-arriero-frente.png"];
const normalizarSprite = (s) => String(s || '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const indiceNormalizado = INDICE_SPRITES_JUEGO.map((ruta) => ({
  ruta, path: normalizarSprite(ruta), nombre: normalizarSprite(ruta.split('/').pop()),
  base: normalizarSprite(ruta.split('/').pop().replace(/\.[^.]+$/, ''))
}));
export function buscarSpriteJuego(nombre) {
  const texto = String(nombre || '').replace(/\\\\/g, '/');
  const buscado = normalizarSprite(texto.replace(/\\.(png|jpe?g|gif|webp|svg)$/i,''));
  if (!buscado) return Promise.resolve(null);
  const rutaSolicitada = texto.includes('/') ? buscado : '';
  const candidatos = indiceNormalizado
    .filter(x => rutaSolicitada && normalizarSprite(x.ruta).endsWith(rutaSolicitada))
    .concat(indiceNormalizado.filter(x => x.base === buscado || x.nombre === buscado))
    .concat(indiceNormalizado.filter(x => x.base.includes(buscado) || buscado.includes(x.base)))
    .filter((x,i,a) => a.findIndex(y => y.ruta === x.ruta) === i);
  return (async () => {
    for (const item of candidatos) {
      const url = new URL(item.ruta, import.meta.url).href;
      try {
        const ok = await new Promise(resolve => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
        if (ok) return url;
      } catch (_) {}
    }
    // El navegador puede bloquear HEAD en algunos servidores; devolver la mejor coincidencia
    // y dejar que el propio elemento pruebe su carga.
    return candidatos.length ? new URL(candidatos[0].ruta, import.meta.url).href : null;
  })();
}
export async function repararSpritesNivelDos(contenedor = document) {
  const imagenes = [...contenedor.querySelectorAll('#game-screen-dos .personaje-sprite')];
  await Promise.all(imagenes.map(async img => {
    const nombre = img.getAttribute('src')?.split('/').pop();
    const encontrada = await buscarSpriteJuego(nombre);
    if (encontrada) {
      img.hidden = false;
      img.closest('.personaje-figura')?.classList.remove('sin-sprite');
      img.onerror = () => { img.hidden = true; img.closest('.personaje-figura')?.classList.add('sin-sprite'); };
      img.src = encontrada;
    }
  }));
  const jugador = contenedor.querySelector('#jugador-mapa');
  // La pulpería también se resuelve por nombre en todo el índice global.
  const fondoPulperia = await buscarSpriteJuego('Interior pulperia.png');
  const mundo = contenedor.querySelector('#mundo-dos');
  if (fondoPulperia && mundo) mundo.style.setProperty('--fondo-interior-pulperia', `url("${fondoPulperia}")`);

  // Los sprites del jugador del Nivel 2 se declaran en nivelDos.css
  // usando los nombres reales (south/north/east/west y diagonales).
}
