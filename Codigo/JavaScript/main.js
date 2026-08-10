function initializeApp() {
  const audioManager = new AudioManager();
  const handleStartGame = () => console.log('Iniciando juego...');

  new MainMenu(audioManager, handleStartGame);
}

document.addEventListener('DOMContentLoaded', initializeApp);
