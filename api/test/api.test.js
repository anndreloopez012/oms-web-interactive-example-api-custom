/**
 * Suite de Pruebas Automatizadas con node:test y node:assert
 *
 * ¿Por qué usamos node:test?
 * A partir de Node.js 18 y 20+, Node incluye su propio test runner nativo de alto rendimiento.
 * No necesitamos instalar Jest, Mocha, Chai ni configurar Babel; las pruebas se ejecutan
 * a la velocidad de la luz directamente con `node --test test/api.test.js`.
 */

import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { CrearOrdenDTO, ActualizarOrdenDTO } from "../src/dtos/orden.dto.js";
import { OrdenModel } from "../src/models/orden.model.js";

/**
 * Función utilitaria para levantar un servidor temporal en un puerto aleatorio (puerto 0)
 * y cerrarlo de forma segura al finalizar la prueba.
 */
async function withServer(application, run) {
  const server = application.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("1. GET /health responde 200, informa estado operativo y cabecera SemVer", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-api-version"), "1.0.0");
    assert.equal(response.headers.get("x-oms-engine"), "Node.js Express Enterprise");
    assert.equal(body.estado, "operativo");
    assert.equal(body.version, "1.0.0");
  });
});

test("2. CrearOrdenDTO limpia espacios, descarta inyecciones no autorizadas y fija estado en borrador", () => {
  const dto = new CrearOrdenDTO({
    cliente: "   Hospital Roosevelt de Guatemala   ",
    servicio: "   INSPECCION_SANITARIA   ",
    monto: "5400.50",
    prioridad: "  ALTA  ",
    operador: "  MARIO.LOPEZ  ",
    // Campos no permitidos / maliciosos que el DTO debe descartar
    esAdmin: true,
    estado: "aprobado",
    total: 1.0,
    descuentoIlegal: 99
  });

  assert.equal(dto.cliente, "Hospital Roosevelt de Guatemala");
  assert.equal(dto.servicio, "inspeccion_sanitaria");
  assert.equal(dto.prioridad, "alta");
  assert.equal(dto.monto, 5400.5);
  assert.equal(dto.operador, "mario.lopez");
  assert.equal(dto.estado, "borrador"); // Siempre forzado a borrador

  // Verificamos que los campos maliciosos NO existen en el objeto
  assert.equal("esAdmin" in dto, false);
  assert.equal("descuentoIlegal" in dto, false);
  assert.equal("total" in dto, false);
});

test("3. ActualizarOrdenDTO solo incluye campos definidos en la petición (Patching seguro)", () => {
  const dto = new ActualizarOrdenDTO({
    monto: 8500,
    prioridad: "urgente"
  });

  assert.equal(dto.monto, 8500);
  assert.equal(dto.prioridad, "urgente");
  assert.equal("cliente" in dto, false);
  assert.equal("servicio" in dto, false);
  assert.equal("operador" in dto, false);
});

test("4. POST /api/v1/oms/ordenes rechaza peticiones con datos incompletos (400 Bad Request)", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/oms/ordenes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente: "X", // Demasiado corto (min 3)
        servicio: "servicio_inexistente", // No está en el enum
        monto: -50 // Negativo inválido
      })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, "Validación fallida");
    assert.ok(Array.isArray(body.errores));
    assert.ok(body.errores.length >= 3);
  });
});

test("5. POST /api/v1/oms/ordenes crea orden con IVA (12%) calculado y cookie de operador", async () => {
  await withServer(app, async (baseUrl) => {
    const payload = {
      cliente: "Laboratorios Clínicos Unidos",
      servicio: "certificacion_bpm",
      monto: 10000.0,
      prioridad: "alta",
      operador: "luis.ramirez",
      metadata: { region: "Centro", expedienteLegacy: "EXP-9921" }
    };

    const response = await fetch(`${baseUrl}/api/v1/oms/ordenes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.ok(body.data.id);
    assert.equal(body.data.cliente, "Laboratorios Clínicos Unidos");
    assert.equal(body.data.monto, 10000.0);
    assert.equal(body.data.impuesto, 1200.0); // 12% IVA
    assert.equal(body.data.total, 11200.0); // Subtotal + IVA
    assert.equal(body.data.estado, "borrador");

    // Verificar cookie segura en la respuesta
    const setCookie = response.headers.get("set-cookie");
    assert.ok(setCookie, "Debe incluir cabecera Set-Cookie");
    assert.match(setCookie, /ultimoOperador=luis\.ramirez/);
    assert.match(setCookie, /HttpOnly/i);
  });
});

test("6. GET /api/v1/oms/ordenes lista las órdenes y permite filtrar por estado", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/oms/ordenes?estado=en_revision`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.every((ord) => ord.estado === "en_revision"));
  });
});

test("7. GET /api/v1/oms/ordenes/:id obtiene una orden por su identificador", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/oms/ordenes/ord-1001`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.id, "ord-1001");
    assert.equal(body.data.cliente, "Ministerio de Salud Pública");
  });
});

test("8. GET /api/v1/oms/ordenes/:id responde 404 si la orden no existe", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/oms/ordenes/id-inexistente-9999`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.codigoHttp, 404);
  });
});

test("9. PATCH /api/v1/oms/ordenes/:id actualiza estado y recalcula totales si cambia el monto", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/oms/ordenes/ord-1001`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prioridad: "urgente",
        monto: 5000.0
      })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.prioridad, "urgente");
    assert.equal(body.data.monto, 5000.0);
    assert.equal(body.data.impuesto, 600.0);
    assert.equal(body.data.total, 5600.0);
  });
});

test("10. POST /api/v1/oms/ordenes/preview simula cálculo previo sin escribir en BD (Custom OMS)", async () => {
  await withServer(app, async (baseUrl) => {
    const payload = {
      cliente: "Droguería San Rafael",
      servicio: "control_aduanero",
      monto: 25000.0
    };

    const response = await fetch(`${baseUrl}/api/v1/oms/ordenes/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.simulacion, true);
    assert.equal(body.totalesCalculados.montoBase, 25000.0);
    assert.equal(body.totalesCalculados.impuestoCalculado, 3000.0);
    assert.equal(body.totalesCalculados.totalEstimado, 28000.0);
  });
});

test("11. GET /api/v1/oms/ordenes/schema entrega los metadatos de campos para UI dinámica (Custom OMS)", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/oms/ordenes/schema`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.entidad, "oms_orden_servicio");
    assert.ok(body.data.campos.cliente);
    assert.ok(body.data.campos.monto);
    assert.ok(body.data.campos.servicio);
  });
});

test("12. DELETE /api/v1/oms/ordenes/:id elimina una orden y responde 204 No Content", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/oms/ordenes/ord-1002`, {
      method: "DELETE"
    });

    assert.equal(response.status, 204);
    assert.equal(await response.text(), "");

    // Verificamos que al consultarla de nuevo responde 404
    const checkResponse = await fetch(`${baseUrl}/api/v1/oms/ordenes/ord-1002`);
    assert.equal(checkResponse.status, 404);
  });
});
