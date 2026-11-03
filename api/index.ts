/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Vercel Serverless Function Handler
 */

import type { Request, Response } from 'express';

// In-memory telemetry cache for serverless environments
let latestTelemetry = {
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

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url || '';

  if (req.method === 'POST' && path.includes('/iot/telemetry')) {
    const { heartRate, spO2, temperature, fallDetected, gesture, movementState, battery, rssi } = req.body || {};
    latestTelemetry = {
      deviceId: req.body.deviceId || 'ESP32-S3-CAM-BAYX',
      timestamp: new Date().toISOString(),
      heartRate: heartRate !== undefined ? Number(heartRate) : latestTelemetry.heartRate,
      spO2: spO2 !== undefined ? Number(spO2) : latestTelemetry.spO2,
      temperature: temperature !== undefined ? Number(temperature) : latestTelemetry.temperature,
      movementState: movementState || (fallDetected ? 'MOVIMIENTO BRUSCO' : 'NORMAL - ACTIVIDAD LEVE'),
      fallDetected: Boolean(fallDetected),
      gestureDetected: gesture || latestTelemetry.gestureDetected,
      batteryLevel: battery !== undefined ? Number(battery) : latestTelemetry.batteryLevel,
      signalRssi: rssi !== undefined ? Number(rssi) : latestTelemetry.signalRssi,
    };

    return res.status(200).json({
      success: true,
      message: 'Telemetría BAYX procesada en Vercel Serverless',
      timestamp: latestTelemetry.timestamp,
      data: latestTelemetry,
    });
  }

  if (req.method === 'GET' && (path.includes('/iot/telemetry/latest') || path === '/api' || path === '/api/')) {
    return res.status(200).json({
      vitals: latestTelemetry,
      status: 'ONLINE',
      serverless: true,
    });
  }

  return res.status(200).json({
    status: 'ONLINE',
    app: 'BAYX Health Monitor API',
    endpoint: '/api/iot/telemetry',
    vitals: latestTelemetry,
  });
}
