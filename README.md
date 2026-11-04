# BAYX Health Monitor - IoT & Telemetría Médica

**Ingeniería de Sistemas – 2026**  
**Equipo de demo:** Personal clínico ficticio · Soporte tecnológico · Validación de sensores
**Plataforma de Hardware:** ESP32-S3-CAM (V1.5 / GOOUUU) + MAX30102 + MLX90614 + MPU6050 + SSD1306 + Buzzer Piezoeléctrico.

---

## 📡 ¿A DÓNDE ENVIAR LOS POST DESDE TU ESP32?

El backend de la aplicación expone el siguiente endpoint HTTP para recibir los paquetes de telemetría de tu circuito electrónico:

- **Método:** `POST`
- **Ruta Relativa:** `/api/iot/telemetry`
- **URL Completa en Desarrollo:** `https://ais-dev-2amvmfo2qarvmtwh57t23a-904360900550.us-east1.run.app/api/iot/telemetry`
- **URL en Producción (Vercel):** `https://tu-proyecto.vercel.app/api/iot/telemetry`
- **Cabeceras:** `Content-Type: application/json`

### Estructura del Payload JSON enviado por el ESP32:
```json
{
  "deviceId": "ESP32-S3-CAM-BAYX",
  "heartRate": 72,
  "spO2": 98,
  "temperature": 36.6,
  "movementState": "NORMAL - ACTIVIDAD LEVE",
  "fallDetected": false,
  "gesture": "GESTURE: SMILE (DETECTED)",
  "battery": 94,
  "rssi": -58
}
```

---

## 📁 Estructura del Proyecto (Arquitectura Empresarial)

```
bayx-health-monitor/
├── api/                       # Handlers serverless para despliegue en Vercel
│   └── index.ts               # Endpoint serverless /api/iot/telemetry
├── src/
│   ├── components/            # Componentes modulares de interfaz
│   │   ├── Navbar.tsx         # Barra superior (Top Bar Contract 3 zonas)
│   │   ├── DashboardView.tsx  # Panel principal con métricas clínicas
│   │   ├── EcgMonitor.tsx     # Osciloscopio ECG a 60 FPS con Canvas
│   │   ├── VitalCard.tsx      # Tarjetas biométricas (FC, SpO2, Temp, Caídas)
│   │   ├── LiveCameraView.tsx # Stream ESP32-CAM y HUD de gestos
│   │   ├── TaskManager.tsx    # Gestión de tareas clínicas y recordatorios
│   │   ├── HistoryAnalytics.tsx# Gráficas de tendencias y exportación CSV/JSON
│   │   ├── HardwareApiGuide.tsx# Simulador y documentación interactiva POST
│   │   └── AlertsCenter.tsx   # Protocolos SOS, control buzzer y push
│   ├── context/               # Proveedores de estado global
│   │   ├── AuthContext.tsx    # Autenticación y roles (Médico, Cuidador, IoT)
│   │   ├── HealthDataContext.tsx # Sincronización SSE en tiempo real
│   │   └── ThemeContext.tsx   # Modo Oscuro / Claro con persistencia
│   ├── services/              # Lógica de infraestructura y APIs
│   │   ├── apiService.ts      # Cliente HTTP para telemetría y tareas
│   │   ├── soundService.ts    # Sintetizador Web Audio (Buzzer ESP32 pin 4)
│   │   └── notificationService.ts # Web Push Notifications API
│   ├── types/                 # Definiciones TypeScript estrictas
│   │   ├── health.ts          # Signos vitales, umbrales y alertas
│   │   ├── task.ts            # Tareas y cuidados clínicos
│   │   ├── hardware.ts        # Protocolo ESP32 y sensores
│   │   └── auth.ts            # Usuarios y permisos
│   ├── App.tsx                # Ensamblado principal de vistas
│   ├── index.css              # Tailwind CSS v4 (@custom-variant dark)
│   └── main.tsx               # Entry point de React 19
├── server.ts                  # Servidor Full-Stack Express con SSE en tiempo real
├── vercel.json                # Configuración de despliegue continuo en Vercel
├── package.json
└── tsconfig.json
```

---

## 🚀 Despliegue Automático en Vercel

El proyecto incluye el archivo `vercel.json` preconfigurado para compilar la aplicación React SPA y direccionar las rutas `/api/*` hacia funciones serverless.

### Pasos para conectar con Vercel:
1. Sube tu código a GitHub (ver instrucciones de Git abajo).
2. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **"Add New Project"** e importa tu repositorio `bayx-health-monitor`.
4. En **Framework Preset**, Vercel detectará automáticamente **Vite**.
5. Las configuraciones de compilación ya están listas:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Haz clic en **"Deploy"**. Vercel configurará el despliegue automático: cada vez que hagas `git push` a la rama `main`, Vercel compilará y desplegará la nueva versión automáticamente.

---

## 🛠️ Comandos de Git para Subir el Proyecto

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
# 1. Inicializar el repositorio Git local
git init

# 2. Agregar todos los archivos
git add .

# 3. Crear el primer commit
git commit -m "feat: BAYX Health Monitor v1.0.0 - FullStack IoT & Real-time Telemetry"

# 4. Cambiar el nombre de la rama principal a main
git branch -M main

# 5. Conectar con tu repositorio remoto de GitHub (reemplaza con tu URL de GitHub)
git remote add origin https://github.com/TU_USUARIO/bayx-health-monitor.git

# 6. Subir el código a GitHub
git push -u origin main
```

---

## 🩺 Características Incluidas

1. **Monitoreo Vital en Tiempo Real**: Frecuencia cardíaca (MAX30102) con osciloscopio animado a 60 FPS, SpO2 %, y Temperatura (MLX90614).
2. **Detección de Caídas y Movimiento**: Integración con acelerómetro MPU6050 y alarma sonora instantánea en caso de impacto.
3. **Cámara ESP32-CAM y Gestos**: Flujo de video en vivo (simulador, webcam local o IP de la ESP32) con HUD de visión computacional (`GESTURE: SMILE (DETECTED)`).
4. **Gestión de Tareas Clínicas**: Calendario y lista interactiva para administración de medicamentos, rondas médicas y chequeos.
5. **Autenticación con Roles**: Médico, Cuidador, Ingeniero IoT y Familiar.
6. **Modo Oscuro Personalizado**: Paleta clínica obsidian de alto contraste y modo claro hospitalario.
7. **Notificaciones Push y Buzzer**: Alarma sonora sintetizada con Web Audio API y notificaciones push nativas del navegador.
