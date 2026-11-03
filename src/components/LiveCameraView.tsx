/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Live View & Gestures (ESP32-CAM Video Stream)
 * As specified in BAYX Health Monitor PDF (Page 3 & 6)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Eye, Sparkles, Video, Wifi, Maximize2, ShieldAlert } from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';

export const LiveCameraView: React.FC = () => {
  const { vitals, simulateEvent } = useHealthData();
  const [streamMode, setStreamMode] = useState<'simulation' | 'webcam' | 'esp32_ip'>('simulation');
  const [esp32IpUrl, setEsp32IpUrl] = useState<string>('http://192.168.1.145:81/stream');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [fps, setFps] = useState(24);
  const [gestureText, setGestureText] = useState(vitals.gestureDetected || 'GESTURE: SMILE (DETECTED)');
  const [flashLed, setFlashLed] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync gesture text with vitals
  useEffect(() => {
    if (vitals.gestureDetected) {
      setGestureText(vitals.gestureDetected);
    }
  }, [vitals.gestureDetected]);

  // Webcam activation
  const startWebcam = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsWebcamActive(true);
      setStreamMode('webcam');
    } catch {
      alert('No se pudo acceder a la cámara web. Asegúrese de otorgar permisos o use el modo simulación.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const handleModeChange = (mode: 'simulation' | 'webcam' | 'esp32_ip') => {
    if (mode !== 'webcam' && isWebcamActive) {
      stopWebcam();
    }
    if (mode === 'webcam') {
      startWebcam();
    } else {
      setStreamMode(mode);
    }
  };

  const triggerGesture = (gesture: string) => {
    setGestureText(gesture);
    simulateEvent('smile');
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Stream Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Video className="w-4 h-4 text-cyan-500" />
            Transmisión de Video en Vivo ("Live View & Gestures")
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Flujo capturado por ESP32-CAM · Algoritmo de Visión Computacional
          </p>
        </div>

        {/* Stream Source Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-medium">
          <button
            onClick={() => handleModeChange('simulation')}
            className={`px-3 py-1 rounded-md transition-colors ${
              streamMode === 'simulation'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Simulador ESP32-CAM
          </button>
          <button
            onClick={() => handleModeChange('webcam')}
            className={`px-3 py-1 rounded-md transition-colors ${
              streamMode === 'webcam'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Cámara Web Real
          </button>
          <button
            onClick={() => handleModeChange('esp32_ip')}
            className={`px-3 py-1 rounded-md transition-colors ${
              streamMode === 'esp32_ip'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            IP Hardware (MJPEG)
          </button>
        </div>
      </div>

      {/* Main Video Screen Container */}
      <div className="relative w-full aspect-video sm:max-h-[460px] bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Source: ESP32-CAM IP Stream */}
        {streamMode === 'esp32_ip' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <img
              src={esp32IpUrl}
              alt="ESP32-CAM Live Stream"
              className="w-full h-full object-contain"
              onError={(e) => {
                // If local IP is unreachable in sandbox
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="mt-4 p-4 bg-slate-900/90 border border-slate-800 rounded-lg max-w-md">
              <span className="text-xs font-mono text-cyan-400">Stream URL ESP32:</span>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={esp32IpUrl}
                  onChange={(e) => setEsp32IpUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-slate-200"
                  placeholder="http://192.168.1.145:81/stream"
                />
                <button
                  onClick={() => {
                    const img = document.querySelector('img[alt="ESP32-CAM Live Stream"]') as HTMLImageElement;
                    if (img) {
                      img.style.display = 'block';
                      img.src = `${esp32IpUrl}?t=${Date.now()}`;
                    }
                  }}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded font-medium"
                >
                  Conectar
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Introduce la IP local asignada a tu ESP32-CAM en tu red Wi-Fi para ver el streaming directo.
              </p>
            </div>
          </div>
        )}

        {/* Source: Real Webcam */}
        {streamMode === 'webcam' && (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
        )}

        {/* Source: High-fidelity ESP32-CAM Clinical Simulation (matching screenshot on page 3 of PDF) */}
        {streamMode === 'simulation' && (
          <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
            {/* Visual patient model graphic */}
            <div className="relative flex flex-col items-center justify-center">
              {/* Patient Silhouette with face detection bounding box */}
              <div className="relative w-44 h-44 rounded-2xl border-2 border-dashed border-cyan-400/80 flex items-center justify-center shadow-lg shadow-cyan-500/10 backdrop-blur-xs">
                {/* Face feature landmarks */}
                <div className="w-28 h-32 rounded-full border border-cyan-400/40 flex flex-col items-center justify-around py-4">
                  {/* Eyes */}
                  <div className="flex gap-8">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
                  </div>
                  {/* Smile Arc */}
                  <div className="w-10 h-4 border-b-2 border-emerald-400 rounded-b-full"></div>
                </div>

                {/* Corner reticles */}
                <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-300"></span>
                <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-300"></span>
                <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-300"></span>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-300"></span>

                {/* Subtitle tag */}
                <div className="absolute -bottom-7 bg-slate-950/90 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300">
                  FACE_ID #2026-01 · 99.4% CONF
                </div>
              </div>
            </div>

            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40"></div>
          </div>
        )}

        {/* HUD OVERLAY 1: Gesture Detection Banner (Exactly as shown in PDF page 3 & 6) */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-950/85 border border-cyan-500/40 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs sm:text-sm font-mono font-bold tracking-wide text-emerald-300 uppercase">
              {gestureText}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-950/85 border border-slate-800 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-300">
            <span className="text-cyan-400">● LIVE</span>
            <span>·</span>
            <span>{fps} FPS</span>
            <span>·</span>
            <span>OV2640 SENSOR</span>
          </div>
        </div>

        {/* HUD OVERLAY 2: Bottom Status & Hardware Telemetry */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none">
          <div className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
            ESP32-S3-CAM · V1.5 / GOOUUU
          </div>
          <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>RSSI: {vitals.signalRssi || -58} dBm</span>
          </div>
        </div>
      </div>

      {/* Camera & Gesture Interactive Action Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Probar Detección:</span>
          <button
            onClick={() => triggerGesture('GESTURE: SMILE (DETECTED)')}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-100 transition-colors"
          >
            😊 Sonrisa
          </button>
          <button
            onClick={() => triggerGesture('GESTURE: WAVE (DETECTED)')}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/50 hover:bg-cyan-100 transition-colors"
          >
            👋 Saludo
          </button>
          <button
            onClick={() => triggerGesture('GESTURE: EMERGENCY_SIGN (DETECTED)')}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50 hover:bg-rose-100 transition-colors"
          >
            ⚠️ Auxilio
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFlashLed(!flashLed)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              flashLed
                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            {flashLed ? '💡 Flash LED Encendido' : '💡 Flash LED'}
          </button>
        </div>
      </div>
    </div>
  );
};
