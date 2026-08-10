/**
 * Controla la navegación entre la pantalla principal, créditos y configuración.
 */
class MainMenu {
  constructor(audioManager, onStartGameCallback) {
    this.audioManager = audioManager;
    this.onStartGame = onStartGameCallback;

    this.startScreen = document.getElementById('start-screen');
    this.creditsScreen = document.getElementById('credits-screen');
    this.settingsScreen = document.getElementById('settings-screen');

    this.initEventListeners();
    this.initSettings();
  }

  initEventListeners() {
    const btnPlay = document.getElementById('btn-play');
    const btnCredits = document.getElementById('btn-credits');
    const btnSettings = document.getElementById('btn-settings');
    const btnBackCredits = document.getElementById('btn-back-credits');
    const btnBackSettings = document.getElementById('btn-back-settings');

    btnPlay.addEventListener('click', () => {
      this.audioManager.playClickSound();
      this.onStartGame();
    });

    btnCredits.addEventListener('click', () => {
      this.audioManager.playClickSound();
      this.navigateTo(this.creditsScreen);
    });

    btnSettings.addEventListener('click', () => {
      this.audioManager.playClickSound();
      this.navigateTo(this.settingsScreen);
    });

    btnBackCredits.addEventListener('click', () => {
      this.audioManager.playClickSound();
      this.navigateTo(this.startScreen);
    });

    btnBackSettings.addEventListener('click', () => {
      this.audioManager.playClickSound();
      this.navigateTo(this.startScreen);
    });

    document.querySelectorAll('button').forEach((button) => {
      button.addEventListener('mouseenter', () => this.audioManager.playHoverSound());
    });
  }

  initSettings() {
    const generalVolume = document.getElementById('general-volume');
    const musicVolume = document.getElementById('music-volume');
    const effectsOn = document.getElementById('effects-on');
    const effectsOff = document.getElementById('effects-off');
    const languageButton = document.getElementById('language-button');
    const controlsButton = document.getElementById('controls-button');

    const updateRangeVisual = (range) => {
      range.style.setProperty('--range-value', `${range.value}%`);
    };

    [generalVolume, musicVolume].forEach((range) => {
      updateRangeVisual(range);
      range.addEventListener('input', () => updateRangeVisual(range));
    });

    generalVolume.addEventListener('input', () => {
      this.audioManager.setGeneralVolume(generalVolume.value);
    });

    musicVolume.addEventListener('input', () => {
      this.audioManager.setMusicVolume(musicVolume.value);
    });

    effectsOn.addEventListener('click', () => {
      this.setEffectsState(true, effectsOn, effectsOff);
    });

    effectsOff.addEventListener('click', () => {
      this.setEffectsState(false, effectsOn, effectsOff);
    });

    // El idioma y los controles quedan preparados para los siguientes sprints.
    languageButton.addEventListener('click', () => {
      languageButton.textContent = languageButton.textContent === 'ESPAÑOL' ? 'ESPAÑOL' : 'ESPAÑOL';
    });

    controlsButton.addEventListener('click', () => {
      // La referencia solo muestra el botón; no se agrega otra pantalla.
    });
  }

  setEffectsState(enabled, effectsOn, effectsOff) {
    this.audioManager.setSoundEffectsEnabled(enabled);
    effectsOn.classList.toggle('is-selected', enabled);
    effectsOff.classList.toggle('is-selected', !enabled);
  }

  navigateTo(targetScreen) {
    [this.startScreen, this.creditsScreen, this.settingsScreen].forEach((screen) => {
      screen.classList.add('hidden');
      screen.classList.remove('active');
    });

    targetScreen.classList.remove('hidden');
    targetScreen.classList.add('active');
  }
}
