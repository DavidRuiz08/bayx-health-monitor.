/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Frontend API Client
 */

import { VitalSigns, HealthAlert, PatientProfile } from '../types/health';
import { CareTask } from '../types/task';
import { HardwareDeviceStatus, Esp32Payload } from '../types/hardware';

const API_BASE = '';

export interface TelemetryResponse {
  vitals: VitalSigns;
  device: HardwareDeviceStatus;
  patient: PatientProfile;
}

export const apiService = {
  async getLatestTelemetry(): Promise<TelemetryResponse> {
    const res = await fetch(`${API_BASE}/api/iot/telemetry/latest`);
    if (!res.ok) throw new Error('Error al obtener telemetría');
    return res.json();
  },

  async getHistory(limit: number = 100): Promise<{ count: number; history: VitalSigns[] }> {
    const res = await fetch(`${API_BASE}/api/iot/history?limit=${limit}`);
    if (!res.ok) throw new Error('Error al obtener historial');
    return res.json();
  },

  async postTelemetry(payload: Esp32Payload) {
    const res = await fetch(`${API_BASE}/api/iot/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Error al enviar telemetría');
    return res.json();
  },

  async simulateEvent(type: 'fall' | 'fever' | 'tachycardia' | 'low_o2' | 'smile' | 'reset', value?: number) {
    const res = await fetch(`${API_BASE}/api/iot/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, value }),
    });
    if (!res.ok) throw new Error('Error al simular evento');
    return res.json();
  },

  async getTasks(): Promise<{ tasks: CareTask[] }> {
    const res = await fetch(`${API_BASE}/api/tasks`);
    if (!res.ok) throw new Error('Error al obtener tareas');
    return res.json();
  },

  async createTask(taskData: Partial<CareTask>): Promise<{ success: boolean; task: CareTask }> {
    const res = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error('Error al crear tarea');
    return res.json();
  },

  async updateTask(id: string, updates: Partial<CareTask>): Promise<{ success: boolean; task: CareTask }> {
    const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar tarea');
    return res.json();
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar tarea');
    return res.json();
  },

  async getAlerts(): Promise<{ alerts: HealthAlert[] }> {
    const res = await fetch(`${API_BASE}/api/alerts`);
    if (!res.ok) throw new Error('Error al obtener alertas');
    return res.json();
  },

  async resolveAlert(id: string, resolvedBy: string): Promise<{ success: boolean; alert: HealthAlert }> {
    const res = await fetch(`${API_BASE}/api/alerts/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolvedBy }),
    });
    if (!res.ok) throw new Error('Error al resolver alerta');
    return res.json();
  },

  async getApiInfo(): Promise<unknown> {
    const res = await fetch(`${API_BASE}/api/info`);
    if (!res.ok) throw new Error('Error al obtener información de API');
    return res.json();
  },
};
