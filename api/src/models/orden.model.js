/**
 * Modelo de Datos / Capa de Persistencia para Órdenes OMS
 *
 * ¿Por qué existe este archivo?
 * En una arquitectura profesional, la capa de Modelo o Repositorio aísla el origen de los datos
 * (PostgreSQL, MongoDB o Memoria) del resto de la aplicación. Los controladores y servicios
 * no deben saber si los datos vienen de una base de datos SQL o de una tabla en memoria;
 * solo consumen métodos estandarizados (find, create, update, delete).
 */

let ordenesDb = [
  {
    id: "ord-1001",
    codigo: "ORD-2026-001",
    cliente: "Ministerio de Salud Pública",
    servicio: "inspeccion_sanitaria",
    prioridad: "alta",
    monto: 3500.0,
    impuesto: 420.0,
    total: 3920.0,
    estado: "en_revision",
    operador: "carlos.mendoza",
    metadata: {
      departamento: "Guatemala",
      expedienteLegacy: "EXP-2024-MSPAS-982",
      observaciones: "Verificación de cadena de frío farmacéutica"
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "ord-1002",
    codigo: "ORD-2026-002",
    cliente: "Distribuidora Farmacéutica del Valle",
    servicio: "certificacion_bpm",
    prioridad: "media",
    monto: 12000.0,
    impuesto: 1440.0,
    total: 13440.0,
    estado: "aprobado",
    operador: "ana.gonzalez",
    metadata: {
      departamento: "Quetzaltenango",
      expedienteLegacy: "EXP-2024-VUS-411",
      observaciones: "Auditoría de Buenas Prácticas de Manufactura"
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const ESQUEMA_ORDEN = {
  entidad: "oms_orden_servicio",
  descripcion: "Expediente u orden de servicio operativo en el sistema OMS",
  version: "1.0.0",
  campos: {
    codigo: { tipo: "string", descripcion: "Código correlativo único generado por el sistema", requerido: false, generado: true },
    cliente: { tipo: "string", descripcion: "Nombre del titular, solicitante o entidad", requerido: true, minLength: 3 },
    servicio: { tipo: "string", enum: ["inspeccion_sanitaria", "certificacion_bpm", "auditoria_calidad", "control_aduanero"], requerido: true },
    prioridad: { tipo: "string", enum: ["baja", "media", "alta", "urgente"], default: "media", requerido: false },
    monto: { tipo: "number", descripcion: "Monto base antes de impuestos en moneda local (GTQ)", min: 1, requerido: true },
    impuesto: { tipo: "number", descripcion: "Impuesto al valor agregado (IVA 12% calculado)", generado: true },
    total: { tipo: "number", descripcion: "Total neto calculado (monto + impuesto)", generado: true },
    estado: { tipo: "string", enum: ["borrador", "en_revision", "aprobado", "rechazado", "completado"], default: "borrador", requerido: false },
    operador: { tipo: "string", descripcion: "Usuario que registra o autoriza la orden", requerido: true },
    metadata: { tipo: "jsonb", descripcion: "Campos flexibles y enlaces con expedientes legacy", requerido: false }
  }
};

export class OrdenModel {
  /**
   * Retorna todas las órdenes con filtros opcionales de estado, prioridad o búsqueda
   */
  static async find(filtros = {}) {
    let resultado = [...ordenesDb];

    if (filtros.estado) {
      resultado = resultado.filter((item) => item.estado === filtros.estado);
    }

    if (filtros.prioridad) {
      resultado = resultado.filter((item) => item.prioridad === filtros.prioridad);
    }

    if (filtros.cliente) {
      const termino = filtros.cliente.toLowerCase();
      resultado = resultado.filter((item) => item.cliente.toLowerCase().includes(termino));
    }

    // Ordenar de más reciente a más antiguo
    return resultado.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Busca una orden por su identificador único
   */
  static async findById(id) {
    const orden = ordenesDb.find((item) => item.id === id);
    return orden ? { ...orden } : null;
  }

  /**
   * Crea una nueva orden en el repositorio
   */
  static async create(datos) {
    const correlativo = String(ordenesDb.length + 1).padStart(3, "0");
    const ahora = new Date().toISOString();

    const nuevaOrden = {
      id: `ord-${Date.now().toString(16).slice(-6)}`,
      codigo: datos.codigo ?? `ORD-2026-${correlativo}`,
      cliente: datos.cliente,
      servicio: datos.servicio,
      prioridad: datos.prioridad ?? "media",
      monto: Number(datos.monto),
      impuesto: Number(datos.impuesto ?? (datos.monto * 0.12).toFixed(2)),
      total: Number(datos.total ?? (datos.monto * 1.12).toFixed(2)),
      estado: datos.estado ?? "borrador",
      operador: datos.operador,
      metadata: datos.metadata ?? {},
      createdAt: ahora,
      updatedAt: ahora
    };

    ordenesDb.unshift(nuevaOrden);
    return { ...nuevaOrden };
  }

  /**
   * Actualiza parcialmente una orden existente
   */
  static async findByIdAndUpdate(id, cambios) {
    const indice = ordenesDb.findIndex((item) => item.id === id);
    if (indice === -1) return null;

    const actual = ordenesDb[indice];
    const montoActualizado = cambios.monto !== undefined ? Number(cambios.monto) : actual.monto;
    const impuestoCalculado = Number((montoActualizado * 0.12).toFixed(2));
    const totalCalculado = Number((montoActualizado + impuestoCalculado).toFixed(2));

    const ordenActualizada = {
      ...actual,
      ...cambios,
      monto: montoActualizado,
      impuesto: impuestoCalculado,
      total: totalCalculado,
      metadata: {
        ...(actual.metadata || {}),
        ...(cambios.metadata || {})
      },
      updatedAt: new Date().toISOString()
    };

    ordenesDb[indice] = ordenActualizada;
    return { ...ordenActualizada };
  }

  /**
   * Elimina una orden por su ID
   */
  static async findByIdAndDelete(id) {
    const indice = ordenesDb.findIndex((item) => item.id === id);
    if (indice === -1) return null;

    const [eliminada] = ordenesDb.splice(indice, 1);
    return eliminada;
  }

  /**
   * Retorna la especificación del esquema OMS (custom endpoint /schema)
   */
  static getSchema() {
    return ESQUEMA_ORDEN;
  }

  /**
   * Restablece la base de datos a sus valores iniciales (útil para pruebas automáticas)
   */
  static _reset(initialSeed = null) {
    if (initialSeed) {
      ordenesDb = [...initialSeed];
    } else {
      ordenesDb = [];
    }
  }
}
