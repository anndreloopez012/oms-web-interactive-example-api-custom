/**
 * Controlador HTTP para Órdenes OMS (Controller Layer)
 *
 * ¿Por qué existe este archivo?
 * El controlador es la frontera entre el protocolo HTTP y la lógica interna de tu aplicación.
 * Sus únicas responsabilidades son:
 * 1. Extraer los datos de la petición (req.body, req.params, req.query, req.cookies).
 * 2. Pasarlos por los DTOs de seguridad.
 * 3. Delegar la operación al Servicio (OrdenService).
 * 4. Construir la respuesta HTTP con el código de estado adecuado (200, 201, 204, etc.)
 *    y configurar cabeceras o cookies si corresponde.
 * 5. Capturar errores y enviarlos a next(error) para que el middleware central de errores los procese.
 */

import { CrearOrdenDTO, ActualizarOrdenDTO } from "../dtos/orden.dto.js";
import { OrdenService } from "../services/orden.service.js";

export class OrdenController {
  /**
   * GET /api/v1/oms/ordenes
   * Lista todas las órdenes con filtros opcionales de query (?estado=...&prioridad=...&cliente=...)
   */
  static async listar(req, res, next) {
    try {
      const filtros = {
        estado: req.query.estado,
        prioridad: req.query.prioridad,
        cliente: req.query.cliente
      };

      const ordenes = await OrdenService.listar(filtros);
      res.status(200).json({
        total: ordenes.length,
        filtrosAplicados: filtros,
        data: ordenes
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/oms/ordenes/:id
   * Obtiene el detalle de una orden por ID
   */
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const orden = await OrdenService.obtenerPorId(id);
      res.status(200).json({ data: orden });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/oms/ordenes
   * Crea una nueva orden, aplica DTO estricto y escribe una cookie segura con el operador
   */
  static async crear(req, res, next) {
    try {
      // 1. Sanitización con DTO (Descarta campos no permitidos)
      const dto = new CrearOrdenDTO(req.body);

      // 2. Ejecución en el servicio
      const nuevaOrden = await OrdenService.crear(dto);

      // 3. Escribir cookie HTTP segura (HttpOnly y SameSite para protección CSRF)
      res.cookie("ultimoOperador", dto.operador, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
      });

      // 4. Respuesta 201 Created
      res.status(201).json({
        mensaje: "Orden de servicio creada exitosamente en el sistema OMS",
        data: nuevaOrden
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/oms/ordenes/:id
   * Actualiza parcialmente una orden existente
   */
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const dto = new ActualizarOrdenDTO(req.body);
      const ordenActualizada = await OrdenService.actualizar(id, dto);

      res.status(200).json({
        mensaje: "Orden actualizada correctamente",
        data: ordenActualizada
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/oms/ordenes/:id
   * Da de baja o elimina una orden (Responde 204 No Content)
   */
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      await OrdenService.eliminar(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/oms/ordenes/preview
   * Endpoint Custom OMS: Simulación previa sin persistencia (Dry-Run)
   */
  static preview(req, res, next) {
    try {
      const resultado = OrdenService.simularPreview(req.body);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/oms/ordenes/schema
   * Endpoint Custom OMS: Introspección dinámica del esquema de datos
   */
  static schema(req, res, next) {
    try {
      const esquema = OrdenService.obtenerEsquema();
      res.status(200).json({ data: esquema });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/oms/sesion
   * Consulta la cookie HTTP de sesión del último operador activo
   */
  static consultarSesion(req, res) {
    res.status(200).json({
      ultimoOperador: req.cookies.ultimoOperador ?? null,
      autenticado: Boolean(req.cookies.ultimoOperador)
    });
  }
}
