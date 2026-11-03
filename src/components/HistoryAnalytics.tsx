/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - History & Analytics
 * Time-series telemetry visualization, tabular records, and CSV export
 */

import React, { useState } from 'react';
import { Download, Calendar, Filter, FileSpreadsheet, Activity, Thermometer, Heart } from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';

export const HistoryAnalytics: React.FC = () => {
  const { history } = useHealthData();
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'hr' | 'spo2' | 'temp'>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h');

  // Export to CSV
  const exportToCsv = () => {
    if (history.length === 0) return;
    const headers = ['Timestamp', 'HeartRate_BPM', 'SpO2_Percent', 'Temperature_C', 'MovementState', 'FallDetected', 'Gesture'];
    const rows = history.map((h) => [
      h.timestamp,
      h.heartRate,
      h.spO2,
      h.temperature,
      `"${h.movementState}"`,
      h.fallDetected,
      `"${h.gestureDetected}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bayx_telemetry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const exportToJson = () => {
    if (history.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(history, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `bayx_telemetry_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sparkline generator
  const renderSvgTrend = (
    data: number[],
    minVal: number,
    maxVal: number,
    color: string,
    unit: string,
    label: string
  ) => {
    if (data.length < 2) return null;
    const height = 90;
    const width = 360;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const normalizedY = (val - minVal) / (maxVal - minVal || 1);
      const y = height - normalizedY * (height - 20) - 10;
      return `${x},${y}`;
    });
    const pathD = `M ${points.join(' L ')}`;

    const currentVal = data[data.length - 1];

    return (
      <div className="p-4 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
          <span className="font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
            {currentVal} {unit}
          </span>
        </div>
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20 overflow-visible">
            {/* Grid baseline */}
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
            {/* Trend curve */}
            <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  };

  const hrData = history.map((h) => h.heartRate);
  const spo2Data = history.map((h) => h.spO2);
  const tempData = history.map((h) => h.temperature);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Historial de Mediciones y Tendencias
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro continuo de telemetría biométrica de sensores IoT
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            Exportar CSV
          </button>
          <button
            onClick={exportToJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-500" />
            Descargar JSON
          </button>
        </div>
      </div>

      {/* Trend Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderSvgTrend(hrData, 50, 140, '#10b981', 'BPM', 'Frecuencia Cardíaca (MAX30102)')}
        {renderSvgTrend(spo2Data, 85, 100, '#06b6d4', '%', 'Saturación SpO2 (MAX30102)')}
        {renderSvgTrend(tempData, 35, 40, '#f59e0b', '°C', 'Temperatura (MLX90614)')}
      </div>

      {/* Historical Logs Table */}
      <div className="bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Registros Detallados ({history.length} lecturas)
          </h3>
          <span className="text-xs text-slate-500 font-mono">Últimas transmisiones</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 font-mono text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-4">Hora</th>
                <th className="py-2.5 px-4">FC (BPM)</th>
                <th className="py-2.5 px-4">SpO2 (%)</th>
                <th className="py-2.5 px-4">Temp (°C)</th>
                <th className="py-2.5 px-4">Movimiento</th>
                <th className="py-2.5 px-4">Caída</th>
                <th className="py-2.5 px-4">Gesto / Expresión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {history.slice(-15).reverse().map((rec, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 tabular-nums">
                    {new Date(rec.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {rec.heartRate}
                  </td>
                  <td className="py-2.5 px-4 text-cyan-600 dark:text-cyan-400 tabular-nums">
                    {rec.spO2}%
                  </td>
                  <td className="py-2.5 px-4 text-amber-600 dark:text-amber-400 tabular-nums">
                    {rec.temperature.toFixed(1)}°C
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-sans">
                    {rec.movementState}
                  </td>
                  <td className="py-2.5 px-4">
                    {rec.fallDetected ? (
                      <span className="text-rose-600 font-bold">¡DETECTADA!</span>
                    ) : (
                      <span className="text-slate-400">Normal</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 font-sans">
                    {rec.gestureDetected}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
