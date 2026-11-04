/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Main Clinical Telemetry Dashboard
 * Matches BAYX Health Monitor PDF specifications (Pages 3 & 6)
 */

import React from 'react';
import {
  Heart,
  Droplet,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  User,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  Cpu,
  Video,
  CheckSquare,
  Download,
} from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';
import { VitalCard } from './VitalCard';
import { EcgMonitor } from './EcgMonitor';
import { NavTab } from './Navbar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { vitals, patient, device, activeAlertCount, tasks } = useHealthData();

  const isHrWarning = vitals.heartRate > patient.thresholds.maxHeartRate;
  const isSpo2Warning = vitals.spO2 < patient.thresholds.minSpO2;
  const isTempWarning = vitals.temperature >= patient.thresholds.maxTemperature;
  const isFallActive = vitals.fallDetected;

  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Patient & Device Header Strip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-mono font-bold text-lg">
            DR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {patient.name}
              </h1>
              <span className="text-xs text-slate-500 font-mono">({patient.bloodType})</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{patient.age} años</span>
              <span aria-hidden="true">·</span>
              <span>{patient.roomOrBed}</span>
              <span aria-hidden="true">·</span>
              <span>{patient.condition}</span>
            </div>
          </div>
        </div>

        {/* Device Status Badge & Code Access */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => onNavigate('code')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors font-sans font-medium"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            Descargar .ZIP
          </button>
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <span className="text-slate-400">DISPOSITIVO: </span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">{device.model}</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-emerald-700 dark:text-emerald-300">
            <span className="font-bold">● ONLINE</span> (I2C OK)
          </div>
        </div>
      </div>

      {/* Critical Fall Alert Banner (High prominence if MPU6050 detected a fall) */}
      {isFallActive && (
        <div className="p-4 bg-rose-600 text-white rounded-xl flex items-center justify-between gap-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                ¡ALERTA DE SEGURIDAD: IMPACTO / CAÍDA DETECTADA POR MPU6050!
              </h3>
              <p className="text-xs text-rose-100">
                Se ha disparado el buzzer acústico. Verifique de inmediato el estado del paciente.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="px-4 py-2 bg-white text-rose-700 font-bold text-xs rounded-lg hover:bg-rose-50 transition-colors whitespace-nowrap"
          >
            Atender Alerta
          </button>
        </div>
      )}

      {/* Primary ECG Oscilloscope Waveform */}
      <EcgMonitor
        heartRate={vitals.heartRate}
        isNormal={!isHrWarning}
        enableAudioPulse={false}
      />

      {/* 4 Big Medical Telemetry Cards (Matching PDF Page 3 & 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Frecuencia Cardíaca */}
        <VitalCard
          title="Frecuencia Cardíaca"
          sensor="Sensor MAX30102"
          value={vitals.heartRate}
          unit="BPM"
          statusText={
            isHrWarning ? 'TAQUICARDIA (> 115 BPM)' : 'RITMO SINUSAL NORMAL'
          }
          isWarning={isHrWarning}
          icon={Heart}
          subInfo="Fotopletismografía I2C"
        />

        {/* Card 2: Saturación de Oxígeno (SpO2) */}
        <VitalCard
          title="Saturación de Oxígeno"
          sensor="Sensor MAX30102"
          value={vitals.spO2}
          unit="%"
          statusText={
            isSpo2Warning ? 'DESATURACIÓN (< 92%)' : 'OXIGENACIÓN ÓPTIMA'
          }
          isCritical={isSpo2Warning}
          icon={Droplet}
          subInfo="Pulsioximetría Óptica"
        />

        {/* Card 3: Temperatura Corporal */}
        <VitalCard
          title="Temperatura Corporal"
          sensor="Sensor MLX90614"
          value={vitals.temperature.toFixed(1)}
          unit="°C"
          statusText={
            isTempWarning ? 'FIEBRE DETECTADA (≥ 37.8°C)' : 'NORMOTERMIA'
          }
          isWarning={isTempWarning}
          icon={Thermometer}
          subInfo="Infrarrojo Sin Contacto"
        />

        {/* Card 4: Movimiento y Caídas */}
        <VitalCard
          title="Movimiento y Seguridad"
          sensor="Sensor MPU6050"
          value={vitals.fallDetected ? '¡CAÍDA!' : 'NORMAL'}
          statusText={
            vitals.fallDetected
              ? 'IMPACTO BRUSCO DETECTADO'
              : 'SIN CAÍDAS DETECTADAS'
          }
          isCritical={vitals.fallDetected}
          icon={ShieldCheck}
          subInfo={vitals.movementState}
        />
      </div>

      {/* Two-Column Workspace: Quick Camera Preview & Care Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: ESP32-CAM Gesture Recognition Quick Preview */}
        <div className="p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Cámara ESP32-CAM & Detección de Gestos
                </h3>
              </div>
              <button
                onClick={() => onNavigate('camera')}
                className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
              >
                Abrir Live View <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Última Expresión / Gesto Detectado:
                  </span>
                  <p className="text-sm font-mono font-bold text-emerald-300">
                    {vitals.gestureDetected || 'GESTURE: SMILE (DETECTED)'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-cyan-400">99.4% CONF</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              El algoritmo de visión computacional procesa los fotogramas del sensor OV2640 de la ESP32-CAM para reconocer sonrisas, señales de auxilio o gestos del paciente.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Stream: 24 FPS · OV2640</span>
            <button
              onClick={() => onNavigate('camera')}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              Ver Cámara en Directo
            </button>
          </div>
        </div>

        {/* Right: Clinical Tasks Quick Widget */}
        <div className="p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Tareas Clínicas del Día
                </h3>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
              >
                Ver Todas ({tasks.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tasks list preview */}
            <div className="space-y-2 mt-3">
              {tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        task.status === 'completed'
                          ? 'bg-emerald-500'
                          : task.priority === 'high'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    ></span>
                    <span
                      className={`font-medium text-slate-800 dark:text-slate-200 ${
                        task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {task.scheduledTime}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>{pendingTasksCount} tareas pendientes</span>
            <button
              onClick={() => onNavigate('tasks')}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
            >
              Gestionar Tareas
            </button>
          </div>
        </div>
      </div>

      {/* Academic Credits & Project Information (Matching Page 1 of the PDF) */}
      <footer className="mt-4 p-5 bg-slate-100 dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          BAYX HEALTH MONITOR · Prototipo IoT con ESP32-CAM & Sensores Biométricos
        </p>
        <p className="mt-1">
          Ingeniería de Sistemas – 2026 · Equipo demo BAYX · Datos ficticios para validación de sistema
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          Hardware: ESP32-S3-CAM · MAX30102 · MLX90614 · MPU6050 · OLED SSD1306 · Buzzer Piezoeléctrico
        </p>
      </footer>
    </div>
  );
};
