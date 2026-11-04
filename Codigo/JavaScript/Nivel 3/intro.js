const botonComenzar = document.getElementById('btn-comenzar-intro');
botonComenzar?.addEventListener('click', () => {
  const intro = document.getElementById('intro-funcionamiento');
  if (intro) intro.remove();
});

// El iframe no comparte los eventos de teclado con la página principal.
// Reenviamos Escape para abrir/cerrar el menú de pausa del juego.
document.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Escape') return;
  const intro = document.getElementById('intro-funcionamiento');
  const historia = document.getElementById('historiaPuente');
  if (intro && intro.isConnected) return;
  if (historia && !historia.hidden) return;
  evento.preventDefault();
  window.parent.postMessage({ tipo: 'facundo-pausa-alternar', nivel: 3 }, '*');
});
