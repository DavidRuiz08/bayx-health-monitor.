/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Interactive Code Viewer
 */

import React, { useState } from 'react';
import { FileCode, Copy, Check } from 'lucide-react';

interface ProjectFile {
  path: string;
  category: 'Backend' | 'Frontend' | 'Configuraciones' | 'Hardware';
  description: string;
  content: string;
}

const PROJECT_FILES: ProjectFile[] = [
  {
    path: 'server.ts',
    category: 'Backend',
    description: 'Servidor Express con endpoint POST /api/iot/telemetry y Server-Sent Events (SSE)',
    content: `// Servidor Full-Stack Express para BAYX Health Monitor
import express from 'express';
// Recibe los POST del ESP32-CAM:
app.post('/api/iot/telemetry', (req, res) => {
  const { heartRate, spO2, temperature, fallDetected } = req.body;
  // Sincroniza en tiempo real vía SSE con el frontend
  broadcastEvent('telemetry', req.body);
  res.json({ success: true, message: "Telemetría recibida" });
});`,
  },
  {
    path: 'src/components/EcgMonitor.tsx',
    category: 'Frontend',
    description: 'Osciloscopio ECG a 60 FPS en Canvas sincronizado con el sensor MAX30102',
    content: `// Osciloscopio médico a 60 FPS
export const EcgMonitor = ({ heartRate, isNormal }) => {
  // Genera complejos P-Q-R-S-T al ritmo exacto de los BPM del MAX30102
  // Dibuja el barrido de fósforo y emite pulso sonoro
};`,
  },
  {
    path: 'src/components/TaskManager.tsx',
    category: 'Frontend',
    description: 'Gestión de tareas clínicas (medicamentos, chequeos y cuidados)',
    content: `// Gestor de Tareas Clínicas
export const TaskManager = () => {
  // Permite agendar tomas de medicamentos, pruebas de signos vitales
  // y rondas médicas sincronizadas en tiempo real.
};`,
  },
  {
    path: 'src/components/HardwareApiGuide.tsx',
    category: 'Hardware',
    description: 'Simulador de sensores y código C++ completo para Arduino IDE',
    content: `// Código para ESP32-S3-CAM en Arduino IDE
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_MLX90614.h>
#include "MAX30105.h"

// Realiza HTTP POST cada 2 segundos a:
// https://.../api/iot/telemetry`,
  },
  {
    path: 'src/context/HealthDataContext.tsx',
    category: 'Frontend',
    description: 'Estado de signos vitales y sincronización en tiempo real con el servidor',
    content: `// Suscripción a los eventos enviados por el servidor
const events = new EventSource('/api/iot/events');

events.addEventListener('telemetry', (event) => {
  const telemetry = JSON.parse(event.data);
  // Actualiza signos vitales, estado del dispositivo y alertas
});`,
  },
];

export const CodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Interactive In-App Code Explorer */}
      <div className="p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-500" />
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Código fuente
              </h2>
              <p className="text-xs text-slate-500">{selectedFile.description}</p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors text-slate-800 dark:text-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? '¡Copiado!' : 'Copiar Archivo'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {/* File selector sidebar */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
              Archivos clave:
            </span>
            {PROJECT_FILES.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                  selectedFile.path === file.path
                    ? 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800/60'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <span className="truncate">{file.path}</span>
                <span className="text-[10px] text-slate-400 ml-2 shrink-0">{file.category}</span>
              </button>
            ))}
          </div>

          {/* Code content viewer */}
          <div className="md:col-span-3 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[420px]">
            <pre className="whitespace-pre">{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
