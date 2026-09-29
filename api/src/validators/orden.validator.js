/**
 * Validadores Declarativos con express-validator para Órdenes OMS
 *
 * ¿Por qué existen los validadores?
 * Permiten que las reglas de formato, tipos de datos, longitudes mínimas y valores permitidos
 * (enums) se evalúen ANTES de que el controlador o el servicio ejecuten cualquier lógica.
 * Si una petición contiene datos inválidos, el validador responde de inmediato con HTTP 400
 * (Bad Request), ahorrando memoria y tiempo de CPU.
 */

import { body, validationResult } from "express-validator";

const SERVICIOS_PERMITIDOS = [
  "inspeccion_sanitaria",
  "certificacion_bpm",
  "auditoria_calidad",
  "control_aduanero"
];

const PRIORIDADES_PERMITIDAS = ["baja", "media", "alta", "urgente"];

const ESTADOS_PERMITIDOS = [
  "borrador",
  "en_revision",
  "aprobado",
  "rechazado",
  "completado"
];

/**
 * Middleware que evalúa el resultado de express-validator
 */
export const verificarErroresValidacion = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: "Validación fallida",
      mensaje: "Los datos enviados no cumplen con el formato o las restricciones de la API",
      errores: errores.array().map((err) => ({
        campo: err.path,
        mensaje: err.msg,
        valorRecibido: err.value
      }))
    });
  }
  next();
};

export const validarCrearOrden = [
  body("cliente")
    .trim()
    .notEmpty()
    .withMessage("El nombre del cliente o entidad es obligatorio")
    .isLength({ min: 3, max: 120 })
    .withMessage("El nombre del cliente debe tener entre 3 y 120 caracteres"),

  body("servicio")
    .trim()
    .notEmpty()
    .withMessage("El tipo de servicio es obligatorio")
    .isIn(SERVICIOS_PERMITIDOS)
    .withMessage(`El servicio debe ser uno de los autorizados: ${SERVICIOS_PERMITIDOS.join(", ")}`),

  body("monto")
    .notEmpty()
    .withMessage("El monto es obligatorio")
    .isFloat({ min: 1 })
    .withMessage("El monto debe ser un número positivo mayor o igual a 1.00"),

  body("prioridad")
    .optional()
    .trim()
    .isIn(PRIORIDADES_PERMITIDAS)
    .withMessage(`La prioridad debe ser una de: ${PRIORIDADES_PERMITIDAS.join(", ")}`),

  body("operador")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("El identificador del operador debe contener al menos 3 caracteres"),

  verificarErroresValidacion
];

export const validarActualizarOrden = [
  body("cliente")
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage("El nombre del cliente debe tener entre 3 y 120 caracteres"),

  body("servicio")
    .optional()
    .trim()
    .isIn(SERVICIOS_PERMITIDOS)
    .withMessage(`El servicio debe ser uno de los autorizados: ${SERVICIOS_PERMITIDOS.join(", ")}`),

  body("monto")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("El monto debe ser un número positivo mayor o igual a 1.00"),

  body("prioridad")
    .optional()
    .trim()
    .isIn(PRIORIDADES_PERMITIDAS)
    .withMessage(`La prioridad debe ser una de: ${PRIORIDADES_PERMITIDAS.join(", ")}`),

  body("estado")
    .optional()
    .trim()
    .isIn(ESTADOS_PERMITIDOS)
    .withMessage(`El estado debe ser uno de: ${ESTADOS_PERMITIDOS.join(", ")}`),

  verificarErroresValidacion
];
