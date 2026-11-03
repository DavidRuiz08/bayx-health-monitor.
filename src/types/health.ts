/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Vital Signs & Medical Telemetry Types
 */

export interface VitalSigns {
  deviceId: string;
  timestamp: string;
  heartRate: number; // BPM (MAX30102)
  spO2: number; // % (MAX30102)
  temperature: number; // °C (MLX90614)
  movementState: 'NORMAL - ACTIVIDAD LEVE' | 'REPOSO' | 'ACTIVIDAD MODERADA' | 'MOVIMIENTO BRUSCO';
  fallDetected: boolean; // MPU6050
  gestureDetected: string; // ESP32-CAM / APDS-9960 (e.g., 'GESTURE: SMILE (DETECTED)')
  batteryLevel?: number; // %
  signalRssi?: number; // dBm
}

export interface VitalThresholds {
  minHeartRate: number; // e.g. 50 BPM
  maxHeartRate: number; // e.g. 110 BPM
  minSpO2: number; // e.g. 92%
  maxTemperature: number; // e.g. 37.8 °C
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertType =
  | 'FALL_DETECTED'
  | 'HIGH_FEVER'
  | 'ARRHYTHMIA_TACHYCARDIA'
  | 'LOW_SPO2'
  | 'EMERGENCY_GESTURE'
  | 'BATTERY_LOW'
  | 'DEVICE_OFFLINE';

export interface HealthAlert {
  id: string;
  timestamp: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metricValue?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  condition: string;
  roomOrBed: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  assignedPhysician: string;
  thresholds: VitalThresholds;
}

export interface EcgPoint {
  time: number;
  value: number;
}
