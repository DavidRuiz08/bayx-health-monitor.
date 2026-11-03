/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Real-Time ECG Oscilloscope Monitor
 * High-performance 60 FPS Canvas with P-Q-R-S-T wave generation synced with MAX30102 BPM
 */

import React, { useRef, useEffect, useState } from 'react';
import { soundService } from '../services/soundService';

interface EcgMonitorProps {
  heartRate: number;
  isNormal: boolean;
  className?: string;
  enableAudioPulse?: boolean;
}

export const EcgMonitor: React.FC<EcgMonitorProps> = ({
  heartRate,
  isNormal,
  className = '',
  enableAudioPulse = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lead, setLead] = useState<'DII' | 'V1' | 'V5'>('DII');
  const [audioPulse, setAudioPulse] = useState(enableAudioPulse);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 180);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 180;
    };
    window.addEventListener('resize', handleResize);

    // ECG sweep variables
    let x = 0;
    const speed = 2.2; // px per frame
    let lastY = height / 2;
    let phase = 0;
    let lastBeepTime = 0;

    // Buffer to hold fading trace
    const render = () => {
      // Draw scanline clear bar (erases ~14px ahead of the beam)
      ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#07090e' : '#f8fafc';
      ctx.fillRect(x, 0, 16, height);

      // Draw faint medical grid lines on the cleared area
      ctx.strokeStyle = document.documentElement.classList.contains('dark') ? 'rgba(30, 41, 59, 0.45)' : 'rgba(226, 232, 240, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gy = 0; gy < height; gy += 25) {
        ctx.moveTo(x, gy);
        ctx.lineTo(x + 16, gy);
      }
      ctx.stroke();

      // Cardiac cycle timing based on current BPM
      // BPM = heartRate -> duration of 1 beat in seconds = 60 / heartRate
      const safeBpm = Math.max(40, Math.min(200, heartRate || 72));
      const beatFrames = (60 / safeBpm) * 60; // frames per heartbeat at 60fps

      phase = (phase + 1) % beatFrames;
      const normalizedPhase = phase / beatFrames;

      // P-Q-R-S-T Wave Mathematical Approximation
      let waveOffset = 0;
      if (normalizedPhase > 0.08 && normalizedPhase < 0.16) {
        // P-wave (atrial depolarization)
        const pNorm = (normalizedPhase - 0.08) / 0.08;
        waveOffset = -12 * Math.sin(pNorm * Math.PI);
      } else if (normalizedPhase >= 0.18 && normalizedPhase < 0.20) {
        // Q-wave (septal depolarization)
        waveOffset = 8;
      } else if (normalizedPhase >= 0.20 && normalizedPhase < 0.25) {
        // R-wave peak (ventricular depolarization)
        const rNorm = (normalizedPhase - 0.20) / 0.05;
        waveOffset = -65 * Math.sin(rNorm * Math.PI);

        // Sound trigger on R-wave
        const now = Date.now();
        if (audioPulse && now - lastBeepTime > 400) {
          soundService.playHeartbeatBlip();
          lastBeepTime = now;
        }
      } else if (normalizedPhase >= 0.25 && normalizedPhase < 0.27) {
        // S-wave
        waveOffset = 18;
      } else if (normalizedPhase >= 0.35 && normalizedPhase < 0.50) {
        // T-wave (ventricular repolarization)
        const tNorm = (normalizedPhase - 0.35) / 0.15;
        waveOffset = -18 * Math.sin(tNorm * Math.PI);
      }

      // Add slight physiological jitter
      const jitter = (Math.random() - 0.5) * 1.5;
      const currentY = height / 2 + waveOffset + jitter;

      // Draw active ECG vector segment
      const nextX = x + speed;
      ctx.beginPath();
      ctx.moveTo(x, lastY);
      ctx.lineTo(nextX, currentY);

      // Color scheme: Bright medical phosphor green / cyan
      const isDark = document.documentElement.classList.contains('dark');
      ctx.strokeStyle = isNormal
        ? isDark
          ? '#10b981' // emerald green
          : '#059669'
        : '#f43f5e'; // rose/red for warning arrhythmia
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Draw glowing sweep head beam
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 6;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(nextX, currentY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      lastY = currentY;
      x = nextX;
      if (x >= width) {
        x = 0;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [heartRate, isNormal, audioPulse]);

  return (
    <div className={`relative flex flex-col bg-slate-950 dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-3 ${className}`}>
      {/* Top Telemetry Header of ECG */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-200/10 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-emerald-400">ECG {lead}</span>
            <span className="text-slate-400 text-[11px]">· 25mm/s · 10mm/mV</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-slate-300">MAX30102 SYNC</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio heart blip toggle */}
          <button
            onClick={() => setAudioPulse(!audioPulse)}
            className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
              audioPulse
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Activar / Silenciar pulso sonoro QRS"
          >
            {audioPulse ? '🔊 QRS BEEP ON' : '🔈 MUTE'}
          </button>

          {/* Lead selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded p-0.5">
            {(['DII', 'V1', 'V5'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLead(l)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  lead === l ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Oscilloscope Canvas */}
      <div className="relative w-full h-[180px]">
        <canvas ref={canvasRef} className="w-full h-full block" />
        
        {/* Floating Heart Rate Readout */}
        <div className="absolute top-2 right-3 pointer-events-none text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-mono font-bold tabular-nums text-emerald-400 drop-shadow">
              {heartRate}
            </span>
            <span className="text-xs font-mono text-emerald-500/80 uppercase">BPM</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {isNormal ? 'RITMO SINUSAL' : 'ARRITMIA / TAQUICARDIA'}
          </span>
        </div>
      </div>
    </div>
  );
};
