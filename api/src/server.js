/**
 * Servidor de Entrada e Infraestructura de Red (Network Listener)
 *
 * ¿Por qué existe este archivo?
 * Este es el punto de entrada que ejecuta Node.js cuando lanzas `npm start` o `npm run dev`.
 * Su único trabajo es:
 * 1. Leer las variables de entorno (como el puerto PORT).
 * 2. Abrir el socket TCP y comenzar a escuchar peticiones con `app.listen()`.
 * 3. Gestionar señales de apagado limpio (Graceful Shutdown) con SIGINT / SIGTERM
 *    para cerrar conexiones activas sin corromper transacciones en vuelo.
 */

import app, { API_VERSION, API_NAME } from "./app.js";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 ${API_NAME.toUpperCase()} (v${API_VERSION})`);
  console.log(`📡 Servidor activo y escuchando en: http://localhost:${PORT}`);
  console.log(`🩺 Diagnóstico:                  http://localhost:${PORT}/health`);
  console.log(`📋 Esquema de Órdenes:           http://localhost:${PORT}/api/v1/oms/ordenes/schema`);
  console.log(`📦 Listado de Órdenes:           http://localhost:${PORT}/api/v1/oms/ordenes`);
  console.log(`======================================================\n`);
});

/**
 * Apagado Seguro (Graceful Shutdown)
 * Si el usuario presiona CTRL+C (SIGINT) o el orquestador envía SIGTERM,
 * el servidor detiene la recepción de nuevas peticiones y espera a que las actuales concluyan.
 */
const cerrarServidor = (senal) => {
  console.log(`\n[SEÑAL RECIBIDA: ${senal}] Cerrando servidor limpiamente...`);
  server.close(() => {
    console.log("Servidor cerrado. Proceso terminado con éxito.");
    process.exit(0);
  });

  // Si tras 5 segundos no ha cerrado, forzar salida
  setTimeout(() => {
    console.error("Forzando apagado por timeout.");
    process.exit(1);
  }, 5000);
};

process.on("SIGINT", () => cerrarServidor("SIGINT"));
process.on("SIGTERM", () => cerrarServidor("SIGTERM"));
