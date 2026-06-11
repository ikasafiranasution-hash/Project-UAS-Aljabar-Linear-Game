export class AudioEngine {
  private static ctx: AudioContext | null = null;
  private static musicNode: OscillatorNode | null = null;
  private static musicGain: GainNode | null = null;
  private static sequenceInterval: any = null;
  private static isPlayingMusic = false;
  private static isMuted = false;
  public static currentLevelIdx = 0; // Dynamic level tracker for adaptative BGM!

  private static init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public static toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }

  public static getMuteStatus(): boolean {
    return this.isMuted;
  }

  public static playShoot() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  public static playPop(pitchModifier = 1.0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Sweet popping sound using two sine oscillators
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    const baseFreq = 300 * pitchModifier;
    osc1.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, this.ctx.currentTime + 0.08);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.12);
    osc2.stop(this.ctx.currentTime + 0.12);
  }

  public static playWallBounce() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public static playExplosion() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Synthesize low-frequency rumble
    const osc = this.ctx.createOscillator();
    const noise = this.ctx.createOscillator(); // Or filtered noise
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(15, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  public static playLaser() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.42);
  }

  public static playCombo(comboCount: number) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const noteIndex = Math.min(comboCount - 1, pentatonicScale.length - 1);
    const frequency = pentatonicScale[noteIndex] || 440.00;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    
    // Nice vibrating chime
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  public static playFreeze() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.25);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1020, this.ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(980, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.26);
    osc2.stop(this.ctx.currentTime + 0.26);
  }

  public static playSwap() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public static startMusic() {
    if (this.isPlayingMusic || this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    this.isPlayingMusic = true;
    let step = 0;

    const playSequenceStep = () => {
      if (!this.isPlayingMusic || this.isMuted || !this.ctx) return;

      const lIdx = AudioEngine.currentLevelIdx;
      // Level 1: Cozy Meadows, Level 2: Whispering Canyon Minor, Level 3: Mystic Woods twilight
      const chordProgressions = lIdx === 0 ? [
        [261.63, 329.63, 392.00, 523.25], // C Major
        [196.00, 246.94, 293.66, 392.00], // G Major
        [220.00, 261.63, 329.63, 440.00], // A Minor
        [174.61, 220.00, 261.63, 349.23], // F Major
      ] : lIdx === 1 ? [
        [196.00, 233.08, 293.66, 392.00], // G Minor
        [233.08, 293.66, 349.23, 466.16], // Bb Major (Canyon gold)
        [261.63, 311.13, 392.00, 523.25], // C Minor
        [293.66, 349.23, 440.00, 587.33], // D Minor
      ] : [
        [220.00, 261.63, 329.63, 493.88], // A Minor 9
        [164.81, 196.00, 246.94, 329.63], // E Minor
        [174.61, 220.00, 261.63, 392.00], // F Major 7
        [196.00, 246.94, 293.66, 440.00], // G Major 6
      ];

      const chordIndex = Math.floor(step / 8) % chordProgressions.length;
      const notes = chordProgressions[chordIndex];
      const noteIndex = step % 4; // pick notes from chord
      const noteFreq = notes[noteIndex];

      const osc = this.ctx.createOscillator();
      const oscFilter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      // Change synth characteristics per level index!
      if (lIdx === 0) {
        osc.type = 'triangle'; // standard cozy acoustic triangle
        oscFilter.type = 'lowpass';
        oscFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
        oscFilter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      } else if (lIdx === 1) {
        osc.type = 'sine'; // whistle wind chimes!
        oscFilter.type = 'bandpass';
        oscFilter.frequency.setValueAtTime(1100, this.ctx.currentTime);
        oscFilter.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.042, this.ctx.currentTime);
      } else {
        osc.type = 'sawtooth'; // celestial aurora filter strings!
        oscFilter.type = 'lowpass';
        oscFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
        oscFilter.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.022, this.ctx.currentTime);
      }

      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (lIdx === 2 ? 1.2 : 0.8));

      osc.connect(oscFilter);
      oscFilter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + (lIdx === 2 ? 1.3 : 0.95));

      step++;
    };

    // Trigger step every 500ms
    this.sequenceInterval = setInterval(playSequenceStep, 500);
  }

  public static stopMusic() {
    this.isPlayingMusic = false;
    if (this.sequenceInterval) {
      clearInterval(this.sequenceInterval);
      this.sequenceInterval = null;
    }
  }
}
