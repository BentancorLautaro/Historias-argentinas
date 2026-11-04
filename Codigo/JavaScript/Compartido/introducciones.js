/** Presentaciones narrativas reutilizables para capítulos y minijuegos. */
let modal;
// Bloquea controles del juego mientras una introducción narrativa está abierta.
document.addEventListener('keydown', (evento) => {
  const visible = document.querySelector('.intro-narrativa:not(.hidden)');
  if (!visible) return;
  evento.preventDefault();
  evento.stopImmediatePropagation();
}, true);
function mostrarIntroduccion({ etiqueta = 'BITÁCORA DE INVESTIGACIÓN', titulo, texto, boton = 'CONTINUAR', alContinuar = () => {} }) {
  if (!modal) {
    modal = document.createElement('section');
    modal.className = 'intro-narrativa hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '<div class="intro-narrativa-panel"><p class="intro-etiqueta"></p><h2 class="intro-titulo"></h2><p class="intro-texto"></p><button class="intro-continuar" type="button"></button></div>';
    document.body.appendChild(modal);
  }
  modal.querySelector('.intro-etiqueta').textContent = etiqueta;
  modal.querySelector('.intro-titulo').textContent = titulo;
  modal.querySelector('.intro-texto').textContent = texto;
  const botonContinuar = modal.querySelector('.intro-continuar');
  botonContinuar.textContent = boton;
  botonContinuar.onclick = () => {
    modal.classList.add('hidden');
    alContinuar();
  };
  modal.classList.remove('hidden');
  botonContinuar.focus();
}
export { mostrarIntroduccion };
