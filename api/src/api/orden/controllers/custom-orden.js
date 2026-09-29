/**
 * Controlador Custom de Strapi (Custom Controller)
 *
 * ¿Por qué existe este archivo?
 * Refleja exactamente la arquitectura utilizada en `oms-backend`:
 * 1. Usa la convención Strapi: `strapi.service('api::orden.custom-orden')`.
 * 2. Maneja el contexto Koa `ctx`:
 *    - `ctx.request.body?.data ?? ctx.request.body`: Extrae el payload respetando la convención `{ data: ... }` de Strapi.
 *    - `ctx.body = ...`: Asigna el cuerpo de la respuesta que Strapi enviará en formato JSON.
 *    - `ctx.status = 200 | 201 | 204`: Establece el código de estado HTTP.
 *    - `ctx.cookies.set(...)`: Guarda cookies seguras en el encabezado de respuesta.
 * 3. Captura excepciones mediante un manejador estructurado para entregar respuestas de error consistentes.
 */

import { CrearOrdenDTO, ActualizarOrdenDTO } from "../dtos/orden.dto.js";

const getCustomService = (strapi) =>
  strapi.service("api::orden.custom-orden");

const getPayload = (ctx) =>
  ctx.request.body?.data ?? ctx.request.body ?? {};

const handleControllerError = (ctx, error) => {
  ctx.status = error.status ?? error.statusCode ?? 400;
  ctx.body = {
    error: {
      message: error.message || "Error al procesar la solicitud en Strapi",
      details: error.details ?? {},
      statusCode: ctx.status
    }
  };
};

export default ({ strapi }) => ({
  /**
   * GET /api/ordenes/schema
   * Endpoint Custom OMS: Retorna la definición de atributos del Content-Type
   */
  async schema(ctx) {
    try {
      ctx.body = {
        data: getCustomService(strapi).schema()
      };
    } catch (error) {
      handleControllerError(ctx, error);
    }
  },

  /**
   * POST /api/ordenes/preview
   * Endpoint Custom OMS: Simulación previa financiera (Dry-Run)
   */
  async preview(ctx) {
    try {
      const payload = getPayload(ctx);
      ctx.body = await getCustomService(strapi).preview(payload);
    } catch (error) {
      handleControllerError(ctx, error);
    }
  },

  /**
   * GET /api/ordenes/sesion
   * Consulta la cookie de operador asignada por el backend Strapi
   */
  async sesion(ctx) {
    const operador = ctx.cookies?.get ? ctx.cookies.get("ultimoOperador") : ctx.cookies?.ultimoOperador;
    ctx.body = {
      ultimoOperador: operador ?? null,
      autenticado: Boolean(operador)
    };
  },

  /**
   * GET /api/ordenes
   * Lista órdenes aplicando filtros de query (?estado=...&prioridad=...)
   */
  async list(ctx) {
    try {
      const filtros = ctx.query ?? {};
      const ordenes = await getCustomService(strapi).list(filtros);
      ctx.body = {
        total: ordenes.length,
        filtrosAplicados: filtros,
        data: ordenes
      };
    } catch (error) {
      handleControllerError(ctx, error);
    }
  },

  /**
   * GET /api/ordenes/:id
   * Obtiene una orden por su identificador
   */
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const orden = await getCustomService(strapi).findOne(id);
      ctx.body = { data: orden };
    } catch (error) {
      handleControllerError(ctx, error);
    }
  },

  /**
   * POST /api/ordenes
   * Crea una orden aplicando el DTO de seguridad y emitiendo una cookie segura
   */
  async create(ctx) {
    try {
      const rawPayload = getPayload(ctx);

      // 1. Sanitización con DTO (Descarta campos no autorizados como esAdmin)
      const dto = new CrearOrdenDTO(rawPayload);

      // 2. Creación en el servicio Strapi
      const nuevaOrden = await getCustomService(strapi).create(dto);

      // 3. Escribir cookie segura en Koa/Strapi
      if (ctx.cookies?.set) {
        ctx.cookies.set("ultimoOperador", dto.operador, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24
        });
      }

      ctx.status = 201;
      ctx.body = {
        mensaje: "Orden de servicio creada exitosamente en Strapi OMS",
        data: nuevaOrden
      };
    } catch (error) {
      handleControllerError(ctx, error);
    }
  },

  /**
   * PATCH /api/ordenes/:id
   * Actualiza parcialmente una orden
   */
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const rawPayload = getPayload(ctx);
      const dto = new ActualizarOrdenDTO(rawPayload);

      const ordenActualizada = await getCustomService(strapi).update(id, dto);
      ctx.body = {
        mensaje: "Orden actualizada correctamente en Strapi",
        data: ordenActualizada
      };
    } catch (error) {
      handleControllerError(ctx, error);
    }
  },

  /**
   * DELETE /api/ordenes/:id
   * Elimina una orden (Responde 204 No Content)
   */
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      await getCustomService(strapi).delete(id);
      ctx.status = 204;
      ctx.body = null;
    } catch (error) {
      handleControllerError(ctx, error);
    }
  }
});
