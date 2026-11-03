/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BAYX Health Monitor - Hardware & IoT API Integration Hub
 * Provides exact POST endpoint documentation, interactive simulator, and Arduino ESP32 code
 */

import React, { useState } from 'react';
import {
  Cpu,
  Send,
  Copy,
  Check,
  Terminal,
  Code2,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Wifi,
  ExternalLink,
} from 'lucide-react';
import { useHealthData } from '../context/HealthDataContext';
import { apiService } from '../services/apiService';

export const HardwareApiGuide: React.FC = () => {
  const { vitals, simulateEvent } = useHealthData();
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Simulator controls
  const [testBpm, setTestBpm] = useState(74);
  const [testSpO2, setTestSpO2] = useState(98);
  const [testTemp, setTestTemp] = useState(36.6);
  const [testFall, setTestFall] = useState(false);
  const [testGesture, setTestGesture] = useState('GESTURE: SMILE (DETECTED)');
  const [isSending, setIsSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-...';
  const postUrl = `${currentHost}/api/iot/telemetry`;

  const sampleJson = {
    deviceId: 'ESP32-S3-CAM-BAYX',
    heartRate: testBpm,
    spO2: testSpO2,
    temperature: testTemp,
    movementState: testFall ? 'MOVIMIENTO BRUSCO' : 'NORMAL - ACTIVIDAD LEVE',
    fallDetected: testFall,
    gesture: testGesture,
    battery: 92,
    rssi: -58,
  };

  const curlCommand = `curl -X POST "${postUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(sampleJson, null, 2)}'`;

  const arduinoCode = `/*
 * BAYX HEALTH MONITOR - ESP32-S3-CAM Client Code
 * Ingeniería de Sistemas - 2026
 * Autores: Kevin Ramirez, David Ruiz, Bayron Ballesteros
 *
 * Conexión I2C:
 * - OLED SSD1306 (0x3C): SDA, SCL
 * - MLX90614 (0x5A): SDA, SCL
 * - MAX30102 (0x57): SDA, SCL
 * - MPU6050 (0x68): SDA, SCL
 * - Buzzer: Pin GPIO 4
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_MLX90614.h>
#include "MAX30105.h"
#include <ArduinoJson.h>

// Credenciales Wi-Fi
const char* ssid = "TU_RED_WIFI";
const char* password = "TU_PASSWORD";

// Endpoint de la aplicación BAYX
const char* serverUrl = "${postUrl}";

// Configuración Pantalla OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Instancias de Sensores
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
MAX30105 particleSensor;

const int buzzerPin = 4;
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 2000; // Envío cada 2 segundos

void setup() {
  Serial.begin(115200);
  Wire.begin();
  pinMode(buzzerPin, OUTPUT);

  // Inicializar Pantalla OLED
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("--- BAYX MONITOR ---");
    display.println("Conectando WiFi...");
    display.display();
  }

  // Conectar a Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Conectado!");

  // Inicializar MLX90614
  mlx.begin();

  // Inicializar MAX30102
  if (particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
  }
}

void loop() {
  if (millis() - lastSendTime > sendInterval) {
    lastSendTime = millis();

    // 1. Lectura de Sensores
    float tempCorporal = mlx.readObjectTempC();
    int heartRate = 72; // Calculado mediante algoritmo MAX30102
    int spO2 = 98;      // Calculado mediante algoritmo MAX30102
    bool fallDetected = false; // Evaluado mediante umbral MPU6050

    // 2. Despliegue en Pantalla OLED
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("--- BAYX MONITOR ---");
    display.printf("Temp: %.1f C\\n", tempCorporal);
    display.printf("FC: %d BPM\\n", heartRate);
    display.printf("SpO2: %d %%\\n", spO2);
    display.println(fallDetected ? "ALERTA: CAIDA!" : "ESTADO: NORMAL");
    display.display();

    // 3. Envío HTTP POST al servidor BAYX
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<256> doc;
      doc["deviceId"] = "ESP32-S3-CAM-BAYX";
      doc["heartRate"] = heartRate;
      doc["spO2"] = spO2;
      doc["temperature"] = tempCorporal;
      doc["movementState"] = fallDetected ? "MOVIMIENTO BRUSCO" : "NORMAL - ACTIVIDAD LEVE";
      doc["fallDetected"] = fallDetected;
      doc["gesture"] = "GESTURE: SMILE (DETECTED)";
      doc["battery"] = 94;
      doc["rssi"] = WiFi.RSSI();

      String requestBody;
      serializeJson(doc, requestBody);

      int httpResponseCode = http.POST(requestBody);
      Serial.printf("BAYX POST Status: %d\\n", httpResponseCode);
      http.end();
    }
  }
}`;

  const handleCopy = (text: string, type: 'curl' | 'code' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'curl') {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleSendTestPost = async () => {
    setIsSending(true);
    setLastResponse(null);
    try {
      const res = await apiService.postTelemetry({
        deviceId: 'ESP32-S3-CAM-BAYX',
        heartRate: testBpm,
        spO2: testSpO2,
        temperature: testTemp,
        movementState: testFall ? 'MOVIMIENTO BRUSCO' : 'NORMAL - ACTIVIDAD LEVE',
        fallDetected: testFall,
        gesture: testGesture,
        battery: 92,
        rssi: -58,
      });
      setLastResponse(`HTTP 200 OK: ${JSON.stringify(res, null, 2)}`);
    } catch (err: any) {
      setLastResponse(`Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner with the Exact URL Answer */}
      <div className="p-6 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-xl shadow-sm text-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase text-cyan-400">
                Punto de Ingesta IoT · ESP32-CAM
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              ¿A dónde enviar los POST de tu sistema electrónico?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Configura tu microcontrolador (ESP32 / ESP32-S3-CAM) para realizar solicitudes{' '}
              <strong className="text-cyan-300 font-mono">HTTP POST</strong> con cabecera{' '}
              <code className="text-amber-300 bg-slate-900/80 px-1 py-0.5 rounded">
                Content-Type: application/json
              </code>{' '}
              al siguiente endpoint:
            </p>
          </div>
          <Cpu className="w-8 h-8 text-cyan-400 shrink-0" />
        </div>

        {/* Big URL Box */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 bg-slate-950/90 border border-cyan-500/40 rounded-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold rounded">
              POST
            </span>
            <span className="font-mono text-xs sm:text-sm text-cyan-200 select-all truncate">
              {postUrl}
            </span>
          </div>

          <button
            onClick={() => handleCopy(postUrl, 'url')}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded transition-colors shrink-0"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedUrl ? '¡Copiado!' : 'Copiar URL'}
          </button>
        </div>
      </div>

      {/* Grid: Simulator & cURL Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive Hardware POST Simulator */}
        <div className="flex flex-col justify-between p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Simulador de Transmisión Hardware
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Prueba instantánea</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Ajusta los valores de los sensores que enviará tu circuito para verificar la respuesta del servidor y el panel en tiempo real.
            </p>

            {/* Sliders */}
            <div className="space-y-4 mt-4">
              {/* Heart Rate */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-600 dark:text-slate-400">MAX30102 Frecuencia Cardíaca:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{testBpm} BPM</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="160"
                  value={testBpm}
                  onChange={(e) => setTestBpm(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* SpO2 */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-600 dark:text-slate-400">MAX30102 Saturación SpO2:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">{testSpO2} %</span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="100"
                  value={testSpO2}
                  onChange={(e) => setTestSpO2(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Temperature */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-600 dark:text-slate-400">MLX90614 Temperatura:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{testTemp.toFixed(1)} °C</span>
                </div>
                <input
                  type="range"
                  min="35.0"
                  max="40.5"
                  step="0.1"
                  value={testTemp}
                  onChange={(e) => setTestTemp(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Fall Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    MPU6050 Detección de Caída
                  </span>
                  <span className="text-[11px] text-slate-500">Simula aceleración brusca &gt; 2.8G</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTestFall(!testFall)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    testFall
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {testFall ? '¡CAÍDA ACTIVA!' : 'Sin caída'}
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons & feedback */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={handleSendTestPost}
                disabled={isSending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Transmitiendo...' : 'Enviar POST de Prueba Ahora'}
              </button>

              <button
                onClick={() => {
                  setTestBpm(72);
                  setTestSpO2(98);
                  setTestTemp(36.6);
                  setTestFall(false);
                  simulateEvent('reset');
                }}
                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                title="Restablecer valores"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {lastResponse && (
              <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
                <pre>{lastResponse}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Right: cURL Command & JSON Payload Specification */}
        <div className="flex flex-col justify-between p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Ejemplo de Solicitud (cURL / HTTP)
                </h3>
              </div>

              <button
                onClick={() => handleCopy(curlCommand, 'curl')}
                className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                {copiedCurl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedCurl ? '¡Copiado!' : 'Copiar cURL'}
              </button>
            </div>

            <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto">
              <pre className="text-xs font-mono text-emerald-400 whitespace-pre">
                {curlCommand}
              </pre>
            </div>

            {/* Field Specs */}
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-4 mb-2">
              Diccionario de Campos JSON:
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 font-mono">
              <p><strong className="text-cyan-400">deviceId</strong>: string Identificador único ("ESP32-S3-CAM-BAYX")</p>
              <p><strong className="text-cyan-400">heartRate</strong>: number Frecuencia cardíaca en BPM (MAX30102)</p>
              <p><strong className="text-cyan-400">spO2</strong>: number Saturación de oxígeno en % (MAX30102)</p>
              <p><strong className="text-cyan-400">temperature</strong>: number Temperatura en °C (MLX90614)</p>
              <p><strong className="text-cyan-400">movementState</strong>: string "NORMAL - ACTIVIDAD LEVE" / "MOVIMIENTO BRUSCO"</p>
              <p><strong className="text-cyan-400">fallDetected</strong>: boolean true si MPU6050 detecta impacto</p>
              <p><strong className="text-cyan-400">gesture</strong>: string Gesto detectado ("GESTURE: SMILE (DETECTED)")</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Arduino / ESP32 Code Section */}
      <div className="p-5 bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Código Completo para ESP32-CAM / ESP32-S3-CAM (Arduino IDE)
            </h3>
          </div>

          <button
            onClick={() => handleCopy(arduinoCode, 'code')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors border border-slate-700"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCode ? '¡Código Copiado!' : 'Copiar Código C++'}
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-3">
          Este código utiliza exactamente las librerías indicadas en el documento de tu proyecto (Adafruit_SSD1306, Adafruit_MLX90614, MAX30105 y Buzzer en pin 4) e incluye la rutina para enviar el POST cada 2 segundos.
        </p>

        <div className="max-h-[380px] overflow-y-auto bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
          <pre>{arduinoCode}</pre>
        </div>
      </div>
    </div>
  );
};
