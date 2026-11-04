/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Real-Time Health & IoT Data Context
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { VitalSigns, HealthAlert, PatientProfile } from '../types/health';
import { CareTask } from '../types/task';
import { HardwareDeviceStatus } from '../types/hardware';
import { apiService, TelemetryResponse } from '../services/apiService';
import { soundService } from '../services/soundService';
import { notificationService } from '../services/notificationService';

interface HealthDataContextType {
  vitals: VitalSigns;
  patient: PatientProfile;
  device: HardwareDeviceStatus;
  history: VitalSigns[];
  alerts: HealthAlert[];
  tasks: CareTask[];
  isConnected: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  resolveAlert: (id: string, resolvedBy: string) => Promise<void>;
  createTask: (task: Partial<CareTask>) => Promise<void>;
  updateTask: (id: string, updates: Partial<CareTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  simulateEvent: (type: 'fall' | 'fever' | 'tachycardia' | 'low_o2' | 'smile' | 'reset', value?: number) => Promise<void>;
  refreshData: () => Promise<void>;
  activeAlertCount: number;
}

const DEFAULT_VITALS: VitalSigns = {
  deviceId: 'ESP32-S3-CAM-BAYX',
  timestamp: new Date().toISOString(),
  heartRate: 72,
  spO2: 98,
  temperature: 36.6,
  movementState: 'NORMAL - ACTIVIDAD LEVE',
  fallDetected: false,
  gestureDetected: 'GESTURE: SMILE (DETECTED)',
  batteryLevel: 94,
  signalRssi: -58,
};

const DEFAULT_PATIENT: PatientProfile = {
  id: 'PAT-2026-01',
  name: 'Paciente Demo BAYX',
  age: 34,
  gender: 'Masculino',
  bloodType: 'O+',
  condition: 'Monitoreo Biométrico Continuo - Prototipo BAYX',
  roomOrBed: 'Habitación 302',
  emergencyContact: {
    name: 'Contacto de Emergencia',
    relationship: 'Familiar / Cuidador',
    phone: '+57 300 000 0000',
  },
  assignedPhysician: 'Dra. Sofia Romero (Cardiología / Telemedicina)',
  thresholds: {
    minHeartRate: 55,
    maxHeartRate: 115,
    minSpO2: 92,
    maxTemperature: 37.8,
  },
};

const DEFAULT_DEVICE: HardwareDeviceStatus = {
  deviceId: 'ESP32-S3-CAM-BAYX',
  model: 'ESP32-S3-CAM V1.5 / GOOUUU',
  ipAddress: '192.168.1.145',
  macAddress: '24:D7:EB:18:25:A1',
  status: 'ONLINE',
  lastPing: new Date().toISOString(),
  firmwareVersion: 'v1.4.2-bayx',
  sensors: {
    max30102: true,
    mlx90614: true,
    mpu6050: true,
    ssd1306: true,
    camera: true,
    buzzer: true,
  },
};

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vitals, setVitals] = useState<VitalSigns>(DEFAULT_VITALS);
  const [patient, setPatient] = useState<PatientProfile>(DEFAULT_PATIENT);
  const [device, setDevice] = useState<HardwareDeviceStatus>(DEFAULT_DEVICE);
  const [history, setHistory] = useState<VitalSigns[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundService.getIsMuted());

  const eventSourceRef = useRef<EventSource | null>(null);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundService.setMuted(nextMuted);
  };

  // Initial Data Fetch
  const refreshData = useCallback(async () => {
    try {
      const [telemetry, histData, tasksData, alertsData] = await Promise.all([
        apiService.getLatestTelemetry().catch(() => null),
        apiService.getHistory(50).catch(() => ({ history: [] })),
        apiService.getTasks().catch(() => ({ tasks: [] })),
        apiService.getAlerts().catch(() => ({ alerts: [] })),
      ]);

      if (telemetry) {
        setVitals(telemetry.vitals);
        setDevice(telemetry.device);
        setPatient(telemetry.patient);
      }
      if (histData && histData.history) {
        setHistory(histData.history);
      }
      if (tasksData && tasksData.tasks) {
        setTasks(tasksData.tasks);
      }
      if (alertsData && alertsData.alerts) {
        setAlerts(alertsData.alerts);
      }
    } catch (err) {
      console.warn('Initial data loading fallback:', err);
    }
  }, []);

  // Connect to SSE stream for real-time synchronization
  useEffect(() => {
    refreshData();

    const connectSSE = () => {
      try {
        const es = new EventSource('/api/iot/events');
        eventSourceRef.current = es;

        es.onopen = () => {
          setIsConnected(true);
        };

        es.addEventListener('initial', (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.vitals) setVitals(data.vitals);
            if (data.tasks) setTasks(data.tasks);
            if (data.alerts) setAlerts(data.alerts);
          } catch {
            // Ignore parse errors
          }
        });

        es.addEventListener('telemetry', (e) => {
          try {
            const newVitals: VitalSigns = JSON.parse(e.data);
            setVitals(newVitals);
            setHistory((prev) => [...prev.slice(-100), newVitals]);

            if (newVitals.fallDetected) {
              soundService.startCriticalAlarm();
              notificationService.notifyAlert('¡CAÍDA DETECTADA!', 'Impacto registrado por el MPU6050 en el paciente.', 'critical');
            }
          } catch {
            // Ignore parse errors
          }
        });

        es.addEventListener('new_alert', (e) => {
          try {
            const newAlert: HealthAlert = JSON.parse(e.data);
            setAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== newAlert.id)]);

            if (newAlert.severity === 'critical') {
              soundService.startCriticalAlarm();
            } else if (newAlert.severity === 'warning') {
              soundService.playWarningBeep();
            }
            notificationService.notifyAlert(newAlert.title, newAlert.message, newAlert.severity);
          } catch {
            // Ignore parse errors
          }
        });

        es.addEventListener('alert_resolved', (e) => {
          try {
            const resolved: HealthAlert = JSON.parse(e.data);
            setAlerts((prev) => prev.map((a) => (a.id === resolved.id ? resolved : a)));
            soundService.stopAlarm();
          } catch {
            // Ignore parse errors
          }
        });

        es.addEventListener('task_created', (e) => {
          try {
            const task: CareTask = JSON.parse(e.data);
            setTasks((prev) => [task, ...prev.filter((t) => t.id !== task.id)]);
          } catch {
            // Ignore parse errors
          }
        });

        es.addEventListener('task_updated', (e) => {
          try {
            const updatedTask: CareTask = JSON.parse(e.data);
            setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
          } catch {
            // Ignore parse errors
          }
        });

        es.addEventListener('task_deleted', (e) => {
          try {
            const { id } = JSON.parse(e.data);
            setTasks((prev) => prev.filter((t) => t.id !== id));
          } catch {
            // Ignore parse errors
          }
        });

        es.onerror = () => {
          setIsConnected(false);
          es.close();
          // Retry connection after 4 seconds
          setTimeout(connectSSE, 4000);
        };
      } catch {
        setIsConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      soundService.stopAlarm();
    };
  }, [refreshData]);

  const resolveAlert = async (id: string, resolvedBy: string) => {
    try {
      await apiService.resolveAlert(id, resolvedBy);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, resolved: true, resolvedAt: new Date().toISOString(), resolvedBy } : a))
      );
      soundService.stopAlarm();
    } catch {
      // Fallback local update
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, resolved: true, resolvedAt: new Date().toISOString(), resolvedBy } : a))
      );
      soundService.stopAlarm();
    }
  };

  const createTask = async (taskData: Partial<CareTask>) => {
    try {
      const res = await apiService.createTask(taskData);
      setTasks((prev) => [res.task, ...prev]);
    } catch {
      // Fallback local creation
      const localTask: CareTask = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'Nueva Tarea',
        description: taskData.description || '',
        category: taskData.category || 'vital_check',
        priority: taskData.priority || 'medium',
        status: 'pending',
        scheduledTime: taskData.scheduledTime || '12:00',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        assignedRole: taskData.assignedRole || 'Cuidador',
        assignedToName: taskData.assignedToName || 'Personal de Turno',
        patientId: 'PAT-2026-01',
      };
      setTasks((prev) => [localTask, ...prev]);
    }
  };

  const updateTask = async (id: string, updates: Partial<CareTask>) => {
    try {
      await apiService.updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await apiService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const simulateEvent = async (type: 'fall' | 'fever' | 'tachycardia' | 'low_o2' | 'smile' | 'reset', value?: number) => {
    try {
      await apiService.simulateEvent(type, value);
    } catch {
      console.warn('Simulation fallback');
    }
  };

  const activeAlertCount = alerts.filter((a) => !a.resolved).length;

  return (
    <HealthDataContext.Provider
      value={{
        vitals,
        patient,
        device,
        history,
        alerts,
        tasks,
        isConnected,
        isMuted,
        toggleMute,
        resolveAlert,
        createTask,
        updateTask,
        deleteTask,
        simulateEvent,
        refreshData,
        activeAlertCount,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = (): HealthDataContextType => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData debe usarse dentro de un HealthDataProvider');
  }
  return context;
};
