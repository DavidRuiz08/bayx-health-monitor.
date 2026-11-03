/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Audio Synthesizer (Buzzer Piezoeléctrico Simulation)
 * Mimics physical buzzer on ESP32 GPIO 4
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private alarmInterval: number | null = null;

  constructor() {
    const saved = localStorage.getItem('bayx_muted');
    this.isMuted = saved === 'true';
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('bayx_muted', String(muted));
    if (muted) {
      this.stopAlarm();
    }
  }

  /**
   * Gentle medical heartbeat pulse blip (synced with ECG)
   */
  public playHeartbeatBlip() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Critical Emergency Alarm (matches physical ESP32 piezo buzzer high-pitch alert)
   */
  public startCriticalAlarm() {
    if (this.isMuted || this.alarmInterval) return;

    this.playBuzzerTone(1760, 0.2); // A6 note
    this.alarmInterval = window.setInterval(() => {
      if (this.isMuted) {
        this.stopAlarm();
        return;
      }
      this.playBuzzerTone(2093, 0.15); // C7 high alarm
      setTimeout(() => {
        if (!this.isMuted && this.alarmInterval) {
          this.playBuzzerTone(1760, 0.15);
        }
      }, 180);
    }, 600);
  }

  public stopAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  /**
   * Warning Beep (e.g. slight temperature rise or high BPM warning)
   */
  public playWarningBeep() {
    if (this.isMuted) return;
    this.playBuzzerTone(1174, 0.25);
  }

  private playBuzzerTone(frequency: number, duration: number) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle'; // Crisp piezoelectric tone
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Silence if blocked
    }
  }
}

export const soundService = new SoundService();
