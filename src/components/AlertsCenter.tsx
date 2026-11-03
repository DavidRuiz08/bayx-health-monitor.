/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Medical Alerts & Incidents Center
 */

import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle,
  PhoneCall,
  Volume2,
  VolumeX,
  ShieldCheck,
} from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';
import { soundService } from '../services/soundService';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export const AlertsCenter: React.FC = () => {
  const { alerts, resolveAlert, isMuted, toggleMute, patient } = useHealthData();
  const { user } = useAuth();
  const [notifPermission, setNotifPermission] = useState(() => notificationService.getPermission());

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  const handleRequestPush = async () => {
    const granted = await notificationService.requestPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
  };

  const handleTestBuzzer = () => {
    soundService.playWarningBeep();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Control Settings */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-500" />
            Centro de Alertas Médicas y Protocolos SOS
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>{activeAlerts.length} alertas activas</span>
            <span aria-hidden="true">·</span>
            <span>Sensor MPU6050 & MAX30102 activo</span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mute buzzer button */}
          <button
            onClick={toggleMute}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isMuted
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isMuted ? 'Buzzer Silenciado' : 'Buzzer Activo'}
          </button>

          {/* Test buzzer sound */}
          <button
            onClick={handleTestBuzzer}
            className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-300 dark:border-slate-700"
          >
            Probar Tono
          </button>

          {/* Push Notifications Enable */}
          {notifPermission !== 'granted' && (
            <button
              onClick={handleRequestPush}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              Activar Push
            </button>
          )}
        </div>
      </div>

      {/* Emergency Contact Quick Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-600 text-white rounded-lg">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-950 dark:text-rose-200">
              Protocolo de Emergencia Rápida
            </h4>
            <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
              Contacto: {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
            </p>
          </div>
        </div>

        <a
          href={`tel:${patient.emergencyContact.phone.replace(/\\s+/g, '')}`}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          Llamar {patient.emergencyContact.phone}
        </a>
      </div>

      {/* Active Alerts Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Alertas Activas que Requieren Atención ({activeAlerts.length})
        </h3>

        {activeAlerts.length === 0 ? (
          <div className="flex items-center gap-3 p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Todos los parámetros se encuentran dentro de los límites seguros
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                No hay caídas detectadas, arritmias o fiebre activa en este momento.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border ${
                  alert.severity === 'critical'
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      alert.severity === 'critical'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {alert.severity === 'critical' ? (
                      <AlertOctagon className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1.5">
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      {alert.metricValue && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {alert.metricValue}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => resolveAlert(alert.id, user?.name || 'Personal Médico')}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors shadow-xs whitespace-nowrap"
                >
                  ✓ Marcar como Atendido
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Alerts Log */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-3 mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Historial de Alertas Atendidas
          </h3>
          <div className="space-y-2">
            {resolvedAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800/80 rounded-lg text-xs opacity-80"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">{alert.title}</span>
                  <span className="text-slate-400 font-mono">({alert.metricValue})</span>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  Atendido por {alert.resolvedBy || 'Cuidador'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
