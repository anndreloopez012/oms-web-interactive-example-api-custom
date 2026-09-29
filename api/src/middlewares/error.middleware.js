/**
 * Middlewares de Control de Errores y Rutas No Encontradas
 *
 * ¿Por qué existe este archivo?
 * 1. `rutaNoEncontrada`: Atrapa cualquier petición a un endpoint inexistente y devuelve un 404 JSON
 *    claro en lugar de una página HTML genérica de Express.
 * 2. `manejarError`: En Express, una función con CUATRO argumentos `(err, req, res, next)`
 *    es reconocida automáticamente como el manejador global de excepciones. Si algún servicio
 *    lanza un `throw new Error()`, este middleware lo captura, previene que la aplicación
 *    se caiga ("crash") y entrega una respuesta estructurada al cliente.
 */

export const rutaNoEncontrada = (req, res, next) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    metodo: req.method,
    rutaSolicitada: req.originalUrl,
    sugerencia: "Verifica los endpoints disponibles en GET /health o consulta el esquema en GET /api/v1/oms/ordenes/schema"
  });
};

export const manejarError = (err, req, res, next) => {
  // Obtenemos el código de estado (por defecto 500 si fue un error no controlado)
  const statusCode = err.status || err.statusCode || 500;

  // Imprimimos el error en consola para depuración del desarrollador
  if (process.env.NODE_ENV !== "test") {
    console.error(`[ERROR OMS] ${req.method} ${req.originalUrl}:`, err.message);
  }

  res.status(statusCode).json({
    error: statusCode === 500 ? "Error interno del servidor" : "Error en la operación",
    mensaje: err.message || "Ha ocurrido un error inesperado al procesar la solicitud",
    codigoHttp: statusCode,
    timestamp: new Date().toISOString()
  });
};
