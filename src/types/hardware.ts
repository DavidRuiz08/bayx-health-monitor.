/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Hardware & IoT Post Specs
 */

export interface Esp32Payload {
  deviceId: string;
  heartRate: number;
  spO2: number;
  temperature: number;
  movementState?: 'NORMAL - ACTIVIDAD LEVE' | 'REPOSO' | 'ACTIVIDAD MODERADA' | 'MOVIMIENTO BRUSCO';
  fallDetected?: boolean;
  gesture?: string;
  battery?: number;
  rssi?: number;
}

export interface HardwareDeviceStatus {
  deviceId: string;
  model: string;
  ipAddress: string;
  macAddress: string;
  status: 'ONLINE' | 'STANDBY' | 'TRANSMITTING' | 'OFFLINE';
  lastPing: string;
  firmwareVersion: string;
  sensors: {
    max30102: boolean;
    mlx90614: boolean;
    mpu6050: boolean;
    ssd1306: boolean;
    camera: boolean;
    buzzer: boolean;
  };
}
