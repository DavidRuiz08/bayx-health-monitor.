/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Full-Stack Express Server with IoT Ingestion & SSE
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for JSON body parsing
app.use(express.json());

// Enable CORS for IoT devices and external clients
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// SSE Client list
let sseClients: Response[] = [];

function broadcastEvent(eventType: string, data: unknown) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // Handled by close event
    }
  });
}

// In-Memory Data Store (Initialized with clinical prototype values)
let currentVitals = {
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

let deviceStatus = {
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

// Seed historical telemetry
const vitalsHistory: Array<typeof currentVitals> = [];
const now = Date.now();
for (let i = 40; i >= 0; i--) {
  const time = new Date(now - i * 30000).toISOString();
  const hrVariation = Math.floor(Math.sin(i / 3) * 4);
  const tempVariation = Number((Math.sin(i / 5) * 0.2).toFixed(1));
  vitalsHistory.push({
    deviceId: 'ESP32-S3-CAM-BAYX',
    timestamp: time,
    heartRate: 72 + hrVariation,
    spO2: 98 + (i % 7 === 0 ? -1 : 0),
    temperature: Number((36.6 + tempVariation).toFixed(1)),
    movementState: 'NORMAL - ACTIVIDAD LEVE',
    fallDetected: false,
    gestureDetected: i % 10 === 0 ? 'GESTURE: SMILE (DETECTED)' : 'GESTURE: MONITORING',
    batteryLevel: Math.max(80, 95 - Math.floor(i / 3)),
    signalRssi: -58 + (i % 4),
  });
}

// Initial care tasks (Clinical task management)
let careTasks = [
  {
    id: 'task-1',
    title: 'Control matutino de signos vitales',
    description: 'Verificar pulso con MAX30102 y temperatura con sensor MLX90614.',
    category: 'vital_check',
    priority: 'high',
    status: 'completed',
    scheduledTime: '08:00',
    dueDate: new Date().toISOString().split('T')[0],
    assignedRole: 'Enfermero/a',
    assignedToName: 'Lic. Kevin Ramirez',
    patientId: 'PAT-2026-01',
    completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    completedBy: 'Lic. Kevin Ramirez',
    notes: 'Signos basales estables. Temp 36.5°C, FC 70 lpm.',
  },
  {
    id: 'task-2',
    title: 'Administración de Enalapril 10mg',
    description: 'Dosis oral con agua tras el desayuno para control de presión arterial.',
    category: 'medication',
    priority: 'high',
    status: 'completed',
    scheduledTime: '09:00',
    dueDate: new Date().toISOString().split('T')[0],
    assignedRole: 'Cuidador',
    assignedToName: 'Bayron Ballesteros',
    patientId: 'PAT-2026-01',
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    completedBy: 'Bayron Ballesteros',
    notes: 'Medicamento administrado sin complicaciones.',
  },
  {
    id: 'task-3',
    title: 'Prueba de calibración acelerómetro MPU6050',
    description: 'Comprobar umbral de impacto y detección de caídas en el módulo IoT.',
    category: 'sensor_maintenance',
    priority: 'medium',
    status: 'in_progress',
    scheduledTime: '14:30',
    dueDate: new Date().toISOString().split('T')[0],
    assignedRole: 'Médico',
    assignedToName: 'Dr. David Ruiz',
    patientId: 'PAT-2026-01',
    notes: 'Verificando sensibilidad del algoritmo de aceleración brusca en ESP32.',
  },
  {
    id: 'task-4',
    title: 'Sesión de ejercicios respiratorios y SpO2',
    description: 'Ejercicios de respiración profunda con supervisión por cámara ESP32-CAM.',
    category: 'physiotherapy',
    priority: 'medium',
    status: 'pending',
    scheduledTime: '16:00',
    dueDate: new Date().toISOString().split('T')[0],
    assignedRole: 'Cuidador',
    assignedToName: 'Lic. Kevin Ramirez',
    patientId: 'PAT-2026-01',
    notes: 'Evaluar SpO2 antes y después de la sesión de 15 minutos.',
  },
  {
    id: 'task-5',
    title: 'Ronda médica vespertina y registro de historial',
    description: 'Revisión general de tendencias cardíacas y temperatura en la app.',
    category: 'clinical_visit',
    priority: 'high',
    status: 'pending',
    scheduledTime: '19:00',
    dueDate: new Date().toISOString().split('T')[0],
    assignedRole: 'Médico',
    assignedToName: 'Dr. David Ruiz',
    patientId: 'PAT-2026-01',
    notes: 'Ajuste de dosis en caso de variaciones térmicas superiores a 37.5°C.',
  },
];

interface ServerHealthAlert {
  id: string;
  timestamp: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  metricValue?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

// Initial Health Alerts
let healthAlerts: ServerHealthAlert[] = [
  {
    id: 'alert-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'ARRHYTHMIA_TACHYCARDIA',
    severity: 'warning',
    title: 'Elevación de Frecuencia Cardíaca',
    message: 'Se detectó pulso de 118 BPM durante actividad física leve.',
    metricValue: '118 BPM',
    resolved: true,
    resolvedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    resolvedBy: 'Dr. David Ruiz',
  },
];

// Patient Profile
const patientProfile = {
  id: 'PAT-2026-01',
  name: 'David Humberto Ruiz Cárdenas',
  age: 24,
  gender: 'Masculino',
  bloodType: 'O+',
  condition: 'Monitoreo Ambulatorio Biométrico - Prototipo BAYX',
  roomOrBed: 'Habitación 302 / Sala Observación',
  emergencyContact: {
    name: 'Kevin Ramirez Medina',
    relationship: 'Cuidador Clínico / Familiar',
    phone: '+57 312 456 7890',
  },
  assignedPhysician: 'Dr. David Ruiz (Cardiología / Telemedicina)',
  thresholds: {
    minHeartRate: 55,
    maxHeartRate: 115,
    minSpO2: 92,
    maxTemperature: 37.8,
  },
};

// ==========================================
// API ROUTES
// ==========================================

// 1. PRIMARY IOT POST ENDPOINT: ESP32-CAM / ESP32-S3-CAM
// This is where the hardware sends HTTP POST requests!
app.post('/api/iot/telemetry', (req: Request, res: Response) => {
  try {
    const {
      deviceId = 'ESP32-S3-CAM-BAYX',
      heartRate,
      spO2,
      temperature,
      movementState,
      fallDetected,
      gesture,
      battery,
      rssi,
    } = req.body;

    const parsedHeartRate = heartRate !== undefined ? Number(heartRate) : currentVitals.heartRate;
    const parsedSpO2 = spO2 !== undefined ? Number(spO2) : currentVitals.spO2;
    const parsedTemperature = temperature !== undefined ? Number(temperature) : currentVitals.temperature;
    const parsedFall = Boolean(fallDetected);
    const parsedMovement = movementState || (parsedFall ? 'MOVIMIENTO BRUSCO' : 'NORMAL - ACTIVIDAD LEVE');
    const parsedGesture = gesture || currentVitals.gestureDetected;
    const parsedBattery = battery !== undefined ? Number(battery) : currentVitals.batteryLevel;
    const parsedRssi = rssi !== undefined ? Number(rssi) : currentVitals.signalRssi;

    const newReading = {
      deviceId: String(deviceId),
      timestamp: new Date().toISOString(),
      heartRate: parsedHeartRate,
      spO2: parsedSpO2,
      temperature: parsedTemperature,
      movementState: parsedMovement,
      fallDetected: parsedFall,
      gestureDetected: parsedGesture,
      batteryLevel: parsedBattery,
      signalRssi: parsedRssi,
    };

    currentVitals = newReading;
    deviceStatus.lastPing = newReading.timestamp;
    deviceStatus.status = 'TRANSMITTING';

    // Store in history
    vitalsHistory.push(newReading);
    if (vitalsHistory.length > 500) {
      vitalsHistory.shift();
    }

    // Automatic Alert Triggering based on clinical thresholds
    const createdAlerts: typeof healthAlerts = [];

    // Fall alert
    if (parsedFall) {
      const fallAlert = {
        id: `alert-fall-${Date.now()}`,
        timestamp: newReading.timestamp,
        type: 'FALL_DETECTED' as const,
        severity: 'critical' as const,
        title: '¡ALERTA CRÍTICA: CAÍDA DETECTADA!',
        message: 'El acelerómetro MPU6050 ha registrado un impacto súbito compatible con caída.',
        metricValue: 'Impacto > 2.8G',
        resolved: false,
      };
      healthAlerts.unshift(fallAlert);
      createdAlerts.push(fallAlert);
    }

    // High fever alert
    if (parsedTemperature >= patientProfile.thresholds.maxTemperature) {
      const feverAlert = {
        id: `alert-fever-${Date.now()}`,
        timestamp: newReading.timestamp,
        type: 'HIGH_FEVER' as const,
        severity: 'warning' as const,
        title: 'Fiebre Detectada (Sensor MLX90614)',
        message: `Temperatura corporal elevada registrada: ${parsedTemperature} °C`,
        metricValue: `${parsedTemperature} °C`,
        resolved: false,
      };
      healthAlerts.unshift(feverAlert);
      createdAlerts.push(feverAlert);
    }

    // Arrhythmia / Tachycardia
    if (parsedHeartRate > patientProfile.thresholds.maxHeartRate) {
      const hrAlert = {
        id: `alert-hr-${Date.now()}`,
        timestamp: newReading.timestamp,
        type: 'ARRHYTHMIA_TACHYCARDIA' as const,
        severity: 'warning' as const,
        title: 'Taquicardia Registrada (MAX30102)',
        message: `Frecuencia cardíaca superó el umbral seguro: ${parsedHeartRate} BPM`,
        metricValue: `${parsedHeartRate} BPM`,
        resolved: false,
      };
      healthAlerts.unshift(hrAlert);
      createdAlerts.push(hrAlert);
    }

    // Low SpO2
    if (parsedSpO2 < patientProfile.thresholds.minSpO2 && parsedSpO2 > 50) {
      const o2Alert = {
        id: `alert-spo2-${Date.now()}`,
        timestamp: newReading.timestamp,
        type: 'LOW_SPO2' as const,
        severity: 'critical' as const,
        title: 'Desaturación de Oxígeno (SpO2)',
        message: `Nivel de oxígeno en sangre por debajo del 92%: ${parsedSpO2}%`,
        metricValue: `${parsedSpO2} %`,
        resolved: false,
      };
      healthAlerts.unshift(o2Alert);
      createdAlerts.push(o2Alert);
    }

    // Emergency gesture
    if (parsedGesture && parsedGesture.toLowerCase().includes('emergency')) {
      const gestureAlert = {
        id: `alert-gesture-${Date.now()}`,
        timestamp: newReading.timestamp,
        type: 'EMERGENCY_GESTURE' as const,
        severity: 'critical' as const,
        title: 'Gesto de Emergencia Detectado por Cámara',
        message: `La cámara ESP32-CAM detectó la señal visual de auxilio del usuario.`,
        metricValue: parsedGesture,
        resolved: false,
      };
      healthAlerts.unshift(gestureAlert);
      createdAlerts.push(gestureAlert);
    }

    // Broadcast update via Server-Sent Events to all connected browser tabs
    broadcastEvent('telemetry', newReading);
    if (createdAlerts.length > 0) {
      createdAlerts.forEach((a) => broadcastEvent('new_alert', a));
    }

    res.status(200).json({
      success: true,
      message: 'Telemetría BAYX recibida y sincronizada exitosamente.',
      timestamp: newReading.timestamp,
      processed: {
        heartRate: parsedHeartRate,
        spO2: parsedSpO2,
        temperature: parsedTemperature,
        fallDetected: parsedFall,
        alertsTriggered: createdAlerts.length,
      },
    });
  } catch (error) {
    console.error('Error processing IoT telemetry:', error);
    res.status(400).json({
      success: false,
      error: 'Formato de payload no válido. Debe enviar un JSON con los campos de telemetría.',
    });
  }
});

// 2. GET Latest Telemetry
app.get('/api/iot/telemetry/latest', (_req: Request, res: Response) => {
  res.json({
    vitals: currentVitals,
    device: deviceStatus,
    patient: patientProfile,
  });
});

// 3. GET History
app.get('/api/iot/history', (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 100;
  res.json({
    count: vitalsHistory.length,
    history: vitalsHistory.slice(-limit),
  });
});

// 4. Server-Sent Events (SSE) for Real-Time synchronization
app.get('/api/iot/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Send initial data
  res.write(`event: initial\ndata: ${JSON.stringify({ vitals: currentVitals, tasks: careTasks, alerts: healthAlerts })}\n\n`);

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter((client) => client !== res);
  });
});

// 5. IoT Simulation Trigger (For testing when hardware is not connected yet)
app.post('/api/iot/simulate', (req: Request, res: Response) => {
  const { type, value } = req.body;
  let simulatedReading = { ...currentVitals, timestamp: new Date().toISOString() };

  if (type === 'fall') {
    simulatedReading.fallDetected = true;
    simulatedReading.movementState = 'MOVIMIENTO BRUSCO';
  } else if (type === 'fever') {
    simulatedReading.temperature = Number(value || 38.6);
  } else if (type === 'tachycardia') {
    simulatedReading.heartRate = Number(value || 128);
  } else if (type === 'low_o2') {
    simulatedReading.spO2 = Number(value || 89);
  } else if (type === 'smile') {
    simulatedReading.gestureDetected = 'GESTURE: SMILE (DETECTED)';
  } else if (type === 'reset') {
    simulatedReading = {
      ...simulatedReading,
      heartRate: 72,
      spO2: 98,
      temperature: 36.6,
      fallDetected: false,
      movementState: 'NORMAL - ACTIVIDAD LEVE',
      gestureDetected: 'GESTURE: SMILE (DETECTED)',
    };
  }

  currentVitals = simulatedReading;
  vitalsHistory.push(simulatedReading);

  let newAlert = null;
  if (simulatedReading.fallDetected) {
    newAlert = {
      id: `alert-fall-${Date.now()}`,
      timestamp: simulatedReading.timestamp,
      type: 'FALL_DETECTED' as const,
      severity: 'critical' as const,
      title: '¡ALERTA CRÍTICA: CAÍDA DETECTADA (SIMULADA)!',
      message: 'Impacto brusco detectado por sensor de simulación.',
      metricValue: 'Impacto > 3.2G',
      resolved: false,
    };
    healthAlerts.unshift(newAlert);
  } else if (simulatedReading.temperature >= 38.0) {
    newAlert = {
      id: `alert-fever-${Date.now()}`,
      timestamp: simulatedReading.timestamp,
      type: 'HIGH_FEVER' as const,
      severity: 'warning' as const,
      title: 'Fiebre Alta Registrada (Simulada)',
      message: `Temperatura anormal: ${simulatedReading.temperature} °C`,
      metricValue: `${simulatedReading.temperature} °C`,
      resolved: false,
    };
    healthAlerts.unshift(newAlert);
  }

  broadcastEvent('telemetry', simulatedReading);
  if (newAlert) broadcastEvent('new_alert', newAlert);

  res.json({ success: true, vitals: simulatedReading, alert: newAlert });
});

// 6. Task Management Routes
app.get('/api/tasks', (_req: Request, res: Response) => {
  res.json({ tasks: careTasks });
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const { title, description, category, priority, scheduledTime, assignedRole, assignedToName, dueDate, notes } = req.body;
  if (!title) {
    res.status(400).json({ error: 'El título de la tarea es requerido' });
    return;
  }

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    description: description || '',
    category: category || 'vital_check',
    priority: priority || 'medium',
    status: 'pending' as const,
    scheduledTime: scheduledTime || '12:00',
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    assignedRole: assignedRole || 'Cuidador',
    assignedToName: assignedToName || 'Personal de Turno',
    patientId: 'PAT-2026-01',
    notes: notes || '',
  };

  careTasks.unshift(newTask);
  broadcastEvent('task_created', newTask);
  res.status(201).json({ success: true, task: newTask });
});

app.patch('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const taskIndex = careTasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    res.status(404).json({ error: 'Tarea no encontrada' });
    return;
  }

  const updatedTask = { ...careTasks[taskIndex], ...req.body };
  if (req.body.status === 'completed' && !careTasks[taskIndex].completedAt) {
    updatedTask.completedAt = new Date().toISOString();
  } else if (req.body.status !== 'completed') {
    delete updatedTask.completedAt;
    delete updatedTask.completedBy;
  }

  careTasks[taskIndex] = updatedTask;
  broadcastEvent('task_updated', updatedTask);
  res.json({ success: true, task: updatedTask });
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  careTasks = careTasks.filter((t) => t.id !== id);
  broadcastEvent('task_deleted', { id });
  res.json({ success: true });
});

// 7. Alerts Management Routes
app.get('/api/alerts', (_req: Request, res: Response) => {
  res.json({ alerts: healthAlerts });
});

app.post('/api/alerts/:id/resolve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { resolvedBy = 'Usuario' } = req.body;
  const alert = healthAlerts.find((a) => a.id === id);
  if (!alert) {
    res.status(404).json({ error: 'Alerta no encontrada' });
    return;
  }

  alert.resolved = true;
  alert.resolvedAt = new Date().toISOString();
  alert.resolvedBy = resolvedBy;

  broadcastEvent('alert_resolved', alert);
  res.json({ success: true, alert });
});

// 8. API Information and Hardware POST Guide Info
app.get('/api/info', (_req: Request, res: Response) => {
  res.json({
    app: 'BAYX Health Monitor API',
    version: '2.0.0',
    authors: [
      'Kevin Norberto Ramirez Medina',
      'David Humberto Ruiz Cardenas',
      'Bayron Sneyder Ballesteros Molina',
    ],
    project: 'Ingeniería de Sistemas – 2026',
    endpoints: {
      postTelemetry: '/api/iot/telemetry',
      sseEvents: '/api/iot/events',
      getLatest: '/api/iot/telemetry/latest',
      getHistory: '/api/iot/history',
      tasks: '/api/tasks',
      alerts: '/api/alerts',
    },
    samplePayload: {
      deviceId: 'ESP32-S3-CAM-BAYX',
      heartRate: 72,
      spO2: 98,
      temperature: 36.6,
      movementState: 'NORMAL - ACTIVIDAD LEVE',
      fallDetected: false,
      gesture: 'GESTURE: SMILE (DETECTED)',
      battery: 95,
      rssi: -58,
    },
  });
});

// Full-Stack Dev Server Mounting with Vite
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[BAYX Server] running on http://0.0.0.0:${PORT}`);
    console.log(`[BAYX IoT Ingestion] POST endpoint ready at /api/iot/telemetry`);
  });
}

startServer().catch((err) => {
  console.error('[BAYX Server] Failed to start:', err);
});
