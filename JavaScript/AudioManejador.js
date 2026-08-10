/**
 * Centraliza el estado de audio para que las pantallas no tengan que
 * conocer cómo se reproducen los sonidos.
 */
class AudioManager {
  constructor() {
    this.soundEffectsEnabled = true;
    this.generalVolume = 50;
    this.musicVolume = 50;
  }

  playHoverSound() {
    if (!this.soundEffectsEnabled) return;
    // Los archivos de audio todavía no forman parte de los assets entregados.
  }

  playClickSound() {
    if (!this.soundEffectsEnabled) return;
    // Los archivos de audio todavía no forman parte de los assets entregados.
  }

  setGeneralVolume(value) {
    this.generalVolume = Number(value);
  }

  setMusicVolume(value) {
    this.musicVolume = Number(value);
  }

  setSoundEffectsEnabled(enabled) {
    this.soundEffectsEnabled = Boolean(enabled);
  }
}
