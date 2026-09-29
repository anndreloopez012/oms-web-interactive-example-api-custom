/**
 * Enrutador para Órdenes OMS (Router Layer)
 *
 * ¿Por qué existe este archivo?
 * Desacopla la definición de las URLs de la lógica de programación.
 * Si en el futuro necesitas cambiar una ruta de `/api/v1/oms/ordenes` a `/api/v2/orders`,
 * no tienes que tocar el controlador ni el servicio; solo modificas el enrutador.
 * Además, aquí se encadenan los middlewares de validación como barreras de seguridad.
 *
 * ¡ATENCIÓN PEDAGÓGICA!:
 * Rutas literales como `/schema`, `/preview` o `/sesion` DEBEN declararse ANTES de `/:id`.
 * De lo contrario, Express interpretará la palabra "schema" como el parámetro `req.params.id`.
 */

import { Router } from "express";
import { OrdenController } from "../controllers/orden.controller.js";
import {
  validarCrearOrden,
  validarActualizarOrden
} from "../validators/orden.validator.js";

export const ordenRouter = Router();

// 1. ENDPOINTS CUSTOM OMS (Deben ir antes de las rutas con :id)
ordenRouter.get("/schema", OrdenController.schema);
ordenRouter.post("/preview", OrdenController.preview);
ordenRouter.get("/sesion", OrdenController.consultarSesion);

// 2. ENDPOINTS RESTful ESTÁNDAR
ordenRouter.get("/", OrdenController.listar);
ordenRouter.get("/:id", OrdenController.obtenerPorId);
ordenRouter.post("/", validarCrearOrden, OrdenController.crear);
ordenRouter.patch("/:id", validarActualizarOrden, OrdenController.actualizar);
ordenRouter.delete("/:id", OrdenController.eliminar);
