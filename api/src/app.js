/**
 * Aplicación Principal Express (Application Assembler)
 *
 * ¿Por qué existe este archivo separado de server.js?
 * Principio de Responsabilidad Única (SRP): `app.js` únicamente CONFIGURA la aplicación
 * (middlewares, rutas y manejadores de error), mientras que `server.js` la ENCIENDE
 * en la red con `app.listen()`.
 * Esto permite que las pruebas unitarias y de integración importen `app` y ejecuten
 * peticiones simuladas en microsegundos sin abrir puertos reales ni causar conflictos
 * como "EADDRINUSE".
 */

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ordenRouter } from "./routes/orden.routes.js";
import { rutaNoEncontrada, manejarError } from "./middlewares/error.middleware.js";

export const API_VERSION = "1.0.0";
export const API_NAME = "oms-custom-api-example";

const app = express();

// 1. CORS: Permite conexiones desde el frontend interactivo o herramientas locales
app.use(cors({ origin: true, credentials: true }));

// 2. Body Parser: Transforma el flujo de bytes entrante en un objeto JavaScript accesible en req.body
app.use(express.json());

// 3. Cookie Parser: Lee la cabecera `Cookie` de la petición y la expone como objeto en req.cookies
app.use(cookieParser());

// 4. Middleware Global: Inyecta cabeceras corporativas SemVer y de trazabilidad en cada respuesta
app.use((req, res, next) => {
  res.set("X-API-Version", API_VERSION);
  res.set("X-OMS-Engine", "Node.js Express Enterprise");
  res.set("X-Correlation-ID", `oms-${Date.now().toString(36)}`);
  next();
});

// 5. Endpoint de Diagnóstico y Salud (Health Check)
app.get("/health", (req, res) => {
  res.status(200).json({
    estado: "operativo",
    version: API_VERSION,
    servicio: API_NAME,
    uptimeSegundos: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 6. Montaje del Módulo de Órdenes OMS
app.use("/api/v1/oms/ordenes", ordenRouter);

// 7. Middlewares de Cierre: 404 para rutas inexistentes y Manejador Central de Excepciones
app.use(rutaNoEncontrada);
app.use(manejarError);

export default app;
