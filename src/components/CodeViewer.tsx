/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Interactive Code Viewer & Git / GitHub Guide
 */

import React, { useState } from 'react';
import {
  Download,
  FileCode,
  Folder,
  Copy,
  Check,
  Github,
  ExternalLink,
  Code2,
  Terminal,
  HelpCircle,
} from 'lucide-react';

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
    path: 'vercel.json',
    category: 'Configuraciones',
    description: 'Configuración para despliegue automático y funciones serverless en Vercel',
    content: `{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`,
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
      {/* Download & GitHub Overview Card */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-500/30 rounded-xl text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase font-semibold">
              <Github className="w-4 h-4" />
              Acceso Directo al Código & Descarga
            </div>
            <h2 className="text-xl font-bold mt-1">
              Descarga tu proyecto completo en archivo .ZIP
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Aquí tienes todo el código fuente listo para usar en tu computadora. Puedes descargarlo en un solo clic o ver las instrucciones para crear tu repositorio en GitHub sin comandos difíciles.
            </p>
          </div>

          <a
            href="/bayx-health-monitor.zip"
            download="bayx-health-monitor.zip"
            className="flex items-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            Descargar Código en .ZIP (855 KB)
          </a>
        </div>
      </div>

      {/* Guide: ¿Por qué la IA no puede crear el repo en tu GitHub directamente? */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            ¿Por qué no puedo crear el repositorio por ti?
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
            GitHub requiere la <strong>clave o contraseña personal de tu cuenta</strong> por motivos de seguridad. Ninguna inteligencia artificial tiene acceso a tu usuario de GitHub personal ni permisos para crearte repositorios sin tus credenciales.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            Sin embargo, ¡crearlo tú mismo toma <strong>menos de 1 minuto</strong> siguiendo los 3 pasos de la derecha!
          </p>
        </div>

        {/* Step-by-Step 1-Minute GitHub Creation */}
        <div className="p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800">
            <Github className="w-4 h-4 text-cyan-500" />
            Cómo subirlo a tu GitHub en 3 pasos (Sin Terminal)
          </div>
          <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 mt-3 list-decimal list-inside leading-relaxed">
            <li>
              Descarga el archivo <strong>.ZIP</strong> con el botón azul de arriba y descomprímelo en tu computadora.
            </li>
            <li>
              Entra a <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-cyan-600 dark:text-cyan-400 font-bold underline inline-flex items-center gap-0.5">github.com/new <ExternalLink className="w-3 h-3" /></a>, escribe de nombre <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-cyan-500 font-mono">bayx-health-monitor</code> y pulsa <strong>Create repository</strong>.
            </li>
            <li>
              En la pantalla que aparece, haz clic en el enlace azul <strong>"uploading an existing file"</strong> y arrastra todos los archivos de la carpeta descomprimida. ¡Listo! Ya tienes tu repositorio público y con link propio.
            </li>
          </ol>
        </div>
      </div>

      {/* Interactive In-App Code Explorer */}
      <div className="p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-500" />
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Explorador de Archivos del Proyecto
              </h3>
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
