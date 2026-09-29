/**
 * Capa de Servicios de Negocio para Órdenes OMS (Business Logic Layer)
 *
 * ¿Por qué existe este archivo?
 * Los controladores NO deben calcular impuestos, ni aplicar reglas corporativas,
 * ni conectarse a bases de datos. Los controladores solo reciben peticiones HTTP.
 * El Servicio es el cerebro de la aplicación: aquí viven los cálculos matemáticos,
 * las validaciones de negocio, la auditoría, y las operaciones especiales
 * (como la simulación previa /preview y la introspección del esquema /schema).
 */

import { OrdenModel } from "../models/orden.model.js";

const TASA_IVA = 0.12; // Impuesto al Valor Agregado estándar (12%)

export class OrdenService {
  /**
   * Lista todas las órdenes aplicando filtros opcionales
   */
  static async listar(filtros = {}) {
    return await OrdenModel.find(filtros);
  }

  /**
   * Obtiene el detalle de una orden por su identificador único
   */
  static async obtenerPorId(id) {
    const orden = await OrdenModel.findById(id);
    if (!orden) {
      const error = new Error(`No se encontró la orden con el identificador '${id}'`);
      error.status = 404;
      throw error;
    }
    return orden;
  }

  /**
   * Procesa la creación de una nueva orden OMS
   */
  static async crear(dto) {
    // 1. Cálculo financiero empresarial
    const subtotal = Number(dto.monto);
    const impuesto = Number((subtotal * TASA_IVA).toFixed(2));
    const total = Number((subtotal + impuesto).toFixed(2));

    // 2. Persistencia en la capa de datos
    const ordenCreada = await OrdenModel.create({
      cliente: dto.cliente,
      servicio: dto.servicio,
      prioridad: dto.prioridad,
      monto: subtotal,
      impuesto: impuesto,
      total: total,
      estado: "borrador",
      operador: dto.operador,
      metadata: {
        ...dto.metadata,
        moduloOrigen: "oms-custom-api",
        ipRegistro: "127.0.0.1",
        versionCalculo: "v1.2"
      }
    });

    return ordenCreada;
  }

  /**
   * Actualiza parcialmente los datos de una orden
   */
  static async actualizar(id, dto) {
    // 1. Verificar existencia previa
    const ordenExistente = await this.obtenerPorId(id);

    // 2. Regla de negocio: Una orden completada o rechazada no puede modificarse
    if (["completado", "rechazado"].includes(ordenExistente.estado)) {
      const error = new Error(`La orden '${id}' se encuentra en estado '${ordenExistente.estado}' y no permite modificaciones`);
      error.status = 422; // Unprocessable Entity
      throw error;
    }

    // 3. Ejecutar actualización
    const ordenActualizada = await OrdenModel.findByIdAndUpdate(id, { ...dto });
    return ordenActualizada;
  }

  /**
   * Elimina una orden por su ID
   */
  static async eliminar(id) {
    await this.obtenerPorId(id); // Lanza 404 si no existe
    return await OrdenModel.findByIdAndDelete(id);
  }

  /**
   * ENDPOINT CUSTOM OMS: /preview (Dry-Run / Simulación previa sin persistencia)
   * Permite que el frontend simule el cálculo de totales, impuestos y validaciones
   * antes de confirmar el guardado definitivo en base de datos.
   */
  static simularPreview(payload = {}) {
    const monto = Number(payload.monto || 0);
    const subtotal = isNaN(monto) ? 0 : monto;
    const impuesto = Number((subtotal * TASA_IVA).toFixed(2));
    const total = Number((subtotal + impuesto).toFixed(2));

    return {
      simulacion: true,
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
  }

  /**
   * ENDPOINT CUSTOM OMS: /schema (Esquema e Introspección dinámica)
   * Devuelve los metadatos de los campos para que clientes y frontends
   * rendericen formularios dinámicos sin quemar código en el frontend.
   */
  static obtenerEsquema() {
    return OrdenModel.getSchema();
  }
}
