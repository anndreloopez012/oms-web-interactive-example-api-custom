/**
 * Servicio Custom de Strapi (Custom Service)
 *
 * ¿Por qué existe este archivo?
 * En la arquitectura de `oms-backend`, el servicio es donde se concentra la lógica de negocio pura:
 * - Cálculos contables de impuestos (IVA 12% y total).
 * - Restricciones de estado (no permitir modificar órdenes completadas o rechazadas).
 * - Endpoints custom de simulación (`preview`) e introspección de esquema (`schema`).
 * - Acceso a la capa de datos mediante `strapi.db.query` o repositorios dedicados.
 */

import { OrdenModel } from "../../../models/orden.model.js";

const TASA_IVA = 0.12; // Impuesto al Valor Agregado estándar (12%)

export default ({ strapi }) => ({
  /**
   * Introspección del esquema del Content-Type de Strapi
   */
  schema() {
    return OrdenModel.getSchema();
  },

  /**
   * Simulación previa (Dry-Run): Realiza cálculos financieros sin escribir en PostgreSQL
   */
  preview(payload = {}) {
    const monto = Number(payload.monto || 0);
    const subtotal = isNaN(monto) ? 0 : monto;
    const impuesto = Number((subtotal * TASA_IVA).toFixed(2));
    const total = Number((subtotal + impuesto).toFixed(2));

    return {
      simulacion: true,
      motor: "Strapi v5 OMS Service",
      mensaje: "Cálculo previo ejecutado con éxito (sin escribir en base de datos)",
      totalesCalculados: {
        montoBase: subtotal,
        tasaIva: `${TASA_IVA * 100}%`,
        impuestoCalculado: impuesto,
        totalEstimado: total
      },
      previsualizacionOrden: {
        cliente: payload.cliente || "Consumidor Final",
        servicio: payload.servicio || "inspeccion_sanitaria",
        prioridad: payload.prioridad || "media",
        estadoTentativo: "borrador",
        metadata: payload.metadata || {}
      }
    };
  },

  /**
   * Lista órdenes aplicando filtros de búsqueda
   */
  async list(filtros = {}) {
    // En producción con Strapi se puede usar: strapi.entityService.findMany('api::orden.orden', { filters: ... })
    // o strapi.db.query('api::orden.orden').findMany(...)
    return await OrdenModel.find(filtros);
  },

  /**
   * Obtiene una orden por su identificador único
   */
  async findOne(id) {
    const orden = await OrdenModel.findById(id);
    if (!orden) {
      const error = new Error(`No se encontró la orden con el identificador '${id}' en Strapi`);
      error.status = 404;
      throw error;
    }
    return orden;
  },

  /**
   * Crea una nueva orden aplicando cálculos contables
   */
  async create(payload) {
    const subtotal = Number(payload.monto);
    if (isNaN(subtotal) || subtotal < 1) {
      const error = new Error("El monto debe ser un número positivo mayor o igual a 1.00");
      error.status = 400;
      throw error;
    }

    const impuesto = Number((subtotal * TASA_IVA).toFixed(2));
    const total = Number((subtotal + impuesto).toFixed(2));

    return await OrdenModel.create({
      cliente: payload.cliente,
      servicio: payload.servicio,
      prioridad: payload.prioridad ?? "media",
      monto: subtotal,
      impuesto: impuesto,
      total: total,
      estado: "borrador",
      operador: payload.operador,
      metadata: {
        ...(payload.metadata || {}),
        strapiUid: "api::orden.orden",
        versionCalculo: "v1.2-oms"
      }
    });
  },

  /**
   * Actualiza una orden verificando reglas de negocio
   */
  async update(id, payload) {
    const ordenExistente = await this.findOne(id);

    if (["completado", "rechazado"].includes(ordenExistente.estado)) {
      const error = new Error(`La orden '${id}' se encuentra en estado '${ordenExistente.estado}' y no permite modificaciones`);
      error.status = 422;
      throw error;
    }

    return await OrdenModel.findByIdAndUpdate(id, { ...payload });
  },

  /**
   * Elimina una orden por su ID
   */
  async delete(id) {
    await this.findOne(id);
    return await OrdenModel.findByIdAndDelete(id);
  }
});
