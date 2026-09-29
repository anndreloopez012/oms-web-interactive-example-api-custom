/**
 * Data Transfer Objects (DTOs) para Órdenes OMS
 *
 * ¿Por qué existen los DTOs?
 * En una API REST pública o corporativa, JAMÁS debes confiar en el objeto req.body
 * directamente. Un usuario malicioso podría enviar campos como `esAdmin: true`,
 * `estado: "aprobado"` o `total: 0.01` (Mass Assignment Vulnerability).
 * El DTO actúa como un filtro estricto (whitelist) que toma únicamente las propiedades
 * autorizadas, limpia espacios en blanco y descarta cualquier dato no permitido.
 */

export class CrearOrdenDTO {
  constructor(payload = {}) {
    // 1. Campos obligatorios limpios
    this.cliente = String(payload.cliente || "").trim();
    this.servicio = String(payload.servicio || "").trim().toLowerCase();
    this.operador = String(payload.operador || "operador.general").trim().toLowerCase();

    // 2. Normalización de valores numéricos
    this.monto = Number(payload.monto);

    // 3. Campos opcionales con valores predeterminados
    this.prioridad = payload.prioridad ? String(payload.prioridad).trim().toLowerCase() : "media";

    // 4. Toda orden nueva inicia obligatoriamente en estado "borrador"
    // No se permite que el cliente fuerce "aprobado" al crear la orden
    this.estado = "borrador";

    // 5. Metadatos flexibles sanitizados (JSONB seguro)
    if (payload.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)) {
      this.metadata = { ...payload.metadata };
    } else {
      this.metadata = {};
    }

    // Congelamos el objeto para evitar modificaciones accidentales posteriores
    Object.freeze(this);
  }
}

export class ActualizarOrdenDTO {
  constructor(payload = {}) {
    // Whitelist selectiva: Solo añadimos las propiedades que vinieron explícitamente en el cuerpo
    if (payload.cliente !== undefined) {
      this.cliente = String(payload.cliente).trim();
    }

    if (payload.servicio !== undefined) {
      this.servicio = String(payload.servicio).trim().toLowerCase();
    }

    if (payload.prioridad !== undefined) {
      this.prioridad = String(payload.prioridad).trim().toLowerCase();
    }

    if (payload.monto !== undefined) {
      this.monto = Number(payload.monto);
    }

    if (payload.estado !== undefined) {
      this.estado = String(payload.estado).trim().toLowerCase();
    }

    if (payload.operador !== undefined) {
      this.operador = String(payload.operador).trim().toLowerCase();
    }

    if (payload.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)) {
      this.metadata = { ...payload.metadata };
    }

    Object.freeze(this);
  }
}
