/**
 * oms-web-interactive-example-api-custom - Lógica Interactiva y Simulador
 */

const STORAGE_KEY = "oms-api-lab-progress";
const DATA_KEY = "oms-api-lab-orders-data";
const COOKIE_KEY = "oms-api-lab-cookie";
const TOTAL_CHECKPOINTS = 8;
const INITIAL_SECONDS = 30 * 60; // 30 minutos

// Seed inicial
const INITIAL_ORDERS = [
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
    metadata: { departamento: "Guatemala", expedienteLegacy: "EXP-2024-MSPAS-982" },
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
    metadata: { departamento: "Quetzaltenango", expedienteLegacy: "EXP-2024-VUS-411" },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const ESQUEMA_OMS = {
  entidad: "oms_orden_servicio",
  descripcion: "Expediente u orden de servicio operativo en el sistema OMS",
  version: "1.0.0",
  campos: {
    codigo: { tipo: "string", descripcion: "Código correlativo único", requerido: false, generado: true },
    cliente: { tipo: "string", descripcion: "Nombre del titular o solicitante", requerido: true, minLength: 3 },
    servicio: { tipo: "string", enum: ["inspeccion_sanitaria", "certificacion_bpm", "auditoria_calidad", "control_aduanero"], requerido: true },
    prioridad: { tipo: "string", enum: ["baja", "media", "alta", "urgente"], default: "media" },
    monto: { tipo: "number", descripcion: "Monto base antes de impuestos (GTQ)", min: 1, requerido: true },
    impuesto: { tipo: "number", descripcion: "IVA (12% calculado)", generado: true },
    total: { tipo: "number", descripcion: "Total neto calculado", generado: true },
    estado: { tipo: "string", enum: ["borrador", "en_revision", "aprobado", "rechazado", "completado"], default: "borrador" },
    operador: { tipo: "string", descripcion: "Usuario que registra la orden", requerido: true },
    metadata: { tipo: "jsonb", descripcion: "Campos flexibles y normalización legacy" }
  }
};

// Referencias del DOM
const timerDisplay = document.querySelector("#timerDisplay");
const timerToggle = document.querySelector("#timerToggle");
const timerReset = document.querySelector("#timerReset");
const timerContainer = document.querySelector(".timer-container");
const progressBar = document.querySelector("#progressBar");
const progressPercent = document.querySelector("#progressPercent");
const toast = document.querySelector("#toast");

// Simulador
const methodSelect = document.querySelector("#simMethod");
const endpointSelect = document.querySelector("#simEndpoint");
const payloadTextarea = document.querySelector("#simPayload");
const btnSend = document.querySelector("#btnSendRequest");
const terminalOutput = document.querySelector("#terminalOutput");
const responseOutput = document.querySelector("#responseOutput");
const statusBadge = document.querySelector("#statusBadge");
const cookieBadge = document.querySelector("#cookieBadge");

// Nodos del Pipeline
const nodes = {
  client: document.querySelector("#nodeClient"),
  middleware: document.querySelector("#nodeMiddleware"),
  router: document.querySelector("#nodeRouter"),
  validator: document.querySelector("#nodeValidator"),
  controller: document.querySelector("#nodeController"),
  dto: document.querySelector("#nodeDto"),
  service: document.querySelector("#nodeService"),
  model: document.querySelector("#nodeModel")
};

let secondsLeft = INITIAL_SECONDS;
let timerInterval = null;
let completedSteps = readStorage(STORAGE_KEY, []);

function readStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Modo privado o storage restringido
  }
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("is-visible");
  setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

// Inicializar datos en storage si está vacío
if (!readStorage(DATA_KEY, null)) {
  writeStorage(DATA_KEY, INITIAL_ORDERS);
}

/* ========================================================
   CRONÓMETRO DE LABORATORIO
   ======================================================== */
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(secondsLeft);
}

function startTimer() {
  if (timerInterval || secondsLeft <= 0) return;
  timerContainer.classList.add("is-running");
  timerToggle.innerHTML = "⏸";
  timerToggle.title = "Pausar cronómetro";
  timerInterval = setInterval(() => {
    secondsLeft--;
    renderTimer();
    if (secondsLeft <= 0) {
      pauseTimer();
      showToast("¡Tiempo concluido! Cierra con la suite de pruebas.");
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerContainer.classList.remove("is-running");
  timerToggle.innerHTML = "▶";
  timerToggle.title = "Iniciar cronómetro";
}

timerToggle.addEventListener("click", () => (timerInterval ? pauseTimer() : startTimer()));
timerReset.addEventListener("click", () => {
  pauseTimer();
  secondsLeft = INITIAL_SECONDS;
  renderTimer();
  showToast("Cronómetro reiniciado a 30:00");
});

/* ========================================================
   SEGUIMIENTO DE PROGRESO
   ======================================================== */
function updateProgressUI() {
  completedSteps = [...new Set(completedSteps)].sort((a, b) => a - b);
  const pct = Math.round((completedSteps.length / TOTAL_CHECKPOINTS) * 100);
  progressBar.style.width = `${pct}%`;
  progressPercent.textContent = `${pct}% (${completedSteps.length}/${TOTAL_CHECKPOINTS})`;

  document.querySelectorAll("[data-checkpoint-id]").forEach((item) => {
    const id = Number(item.dataset.checkpointId);
    if (completedSteps.includes(id)) {
      item.classList.add("is-done");
    } else {
      item.classList.remove("is-done");
    }
  });
}

document.querySelectorAll("[data-checkpoint-toggle]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const id = Number(e.currentTarget.dataset.checkpointToggle);
    if (completedSteps.includes(id)) {
      completedSteps = completedSteps.filter((s) => s !== id);
      showToast(`Checkpoint 0${id} desmarcado`);
    } else {
      completedSteps.push(id);
      showToast(`¡Excelente! Checkpoint 0${id} completado`);
    }
    writeStorage(STORAGE_KEY, completedSteps);
    updateProgressUI();
  });
});

/* ========================================================
   MODOS DE PANTALLA
   ======================================================== */
document.querySelector("#btnProjectorMode")?.addEventListener("click", () => {
  const isProj = document.body.classList.toggle("projector-mode");
  showToast(isProj ? "Modo Proyector activado (Fondo claro de alto contraste)" : "Modo Cyber activado");
});

document.querySelector("#btnFocusMode")?.addEventListener("click", () => {
  const isFocus = document.body.classList.toggle("focus-mode");
  showToast(isFocus ? "Modo Enfoque activado (Sidebar minimizado)" : "Modo Normal activado");
});

/* ========================================================
   PRESETS DE PAYLOAD PARA EL SIMULADOR
   ======================================================== */
const PRESETS = {
  validPost: {
    cliente: "Laboratorios Farmacéuticos del Altiplano",
    servicio: "certificacion_bpm",
    monto: 15000.0,
    prioridad: "alta",
    operador: "fernando.perez",
    metadata: { departamento: "Sacatepéquez", expedienteLegacy: "EXP-9821-BPM" }
  },
  attackDto: {
    cliente: "Auditoría Sanitaria Express",
    servicio: "inspeccion_sanitaria",
    monto: 4000.0,
    prioridad: "media",
    operador: "hacker.demo",
    // Ataque de inyección de parámetros (El DTO debe descartar esto)
    esAdmin: true,
    estado: "aprobado",
    total: 0.05,
    descuentoIlegal: 9999
  },
  invalid400: {
    cliente: "X", // Inválido: menor a 3 caracteres
    servicio: "servicio_no_autorizado", // Inválido: no está en el enum
    monto: -50.0 // Inválido: negativo
  },
  validPatch: {
    prioridad: "urgente",
    monto: 18000.0
  },
  previewOms: {
    cliente: "Hospital General San Juan",
    servicio: "auditoria_calidad",
    monto: 22000.0,
    prioridad: "alta"
  }
};

document.querySelectorAll("[data-preset]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.preset;
    if (PRESETS[key]) {
      payloadTextarea.value = JSON.stringify(PRESETS[key], null, 2);
      if (key === "validPatch") {
        methodSelect.value = "PATCH";
        endpointSelect.value = "/api/v1/oms/ordenes/:id";
      } else if (key === "previewOms") {
        methodSelect.value = "POST";
        endpointSelect.value = "/api/v1/oms/ordenes/preview";
      } else {
        methodSelect.value = "POST";
        endpointSelect.value = "/api/v1/oms/ordenes";
      }
      showToast(`Plantilla '${key}' cargada en el editor`);
    }
  });
});

endpointSelect.addEventListener("change", () => {
  const ep = endpointSelect.value;
  if (ep === "/health" || ep === "/api/v1/oms/ordenes/schema" || ep === "/api/v1/oms/ordenes/sesion" || ep === "/api/v1/oms/ordenes") {
    if (methodSelect.value !== "POST") {
      methodSelect.value = "GET";
    }
  }
  if (ep === "/api/v1/oms/ordenes/preview") {
    methodSelect.value = "POST";
  }
});

/* ========================================================
   MOTOR DEL SIMULADOR VISUAL (PIPELINE ANIMADO)
   ======================================================== */
function clearPipeline() {
  Object.values(nodes).forEach((n) => {
    if (n) {
      n.classList.remove("is-active", "is-error");
    }
  });
}

function logTrace(msg) {
  terminalOutput.textContent += `\n${msg}`;
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[m]);
}

function highlightJson(obj) {
  const str = escapeHtml(JSON.stringify(obj, null, 2));
  return str.replace(
    /(&quot;.*?&quot;)(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?/g,
    (match, strVal, colon) => {
      if (strVal) {
        return colon
          ? `<span style="color:#38bdf8;">${strVal}</span>${colon}`
          : `<span style="color:#a7f3d0;">${strVal}</span>`;
      }
      if (/true|false/.test(match)) return `<span style="color:#c084fc;">${match}</span>`;
      if (/null/.test(match)) return `<span style="color:#94a3b8;">${match}</span>`;
      return `<span style="color:#fbbf24;">${match}</span>`;
    }
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

btnSend.addEventListener("click", async () => {
  const method = methodSelect.value;
  const endpoint = endpointSelect.value;
  let bodyJson = null;

  if (["POST", "PATCH"].includes(method)) {
    try {
      bodyJson = JSON.parse(payloadTextarea.value || "{}");
    } catch {
      showToast("Error: El cuerpo de la petición no es JSON válido");
      return;
    }
  }

  btnSend.disabled = true;
  clearPipeline();
  terminalOutput.textContent = `>>> [${new Date().toLocaleTimeString()}] INICIANDO PETICIÓN HTTP: ${method} ${endpoint}`;
  responseOutput.innerHTML = '<span style="color:#64748b;">// Procesando flujo de datos por las capas de Node.js...</span>';
  statusBadge.textContent = "...";
  statusBadge.className = "badge-status";

  // PASO 1: Cliente emite petición
  nodes.client.classList.add("is-active");
  logTrace(`[1. CLIENTE] Socket TCP abierto. Enviando cabeceras y payload.`);
  await wait(300);

  // PASO 2: Middlewares globales (express.json, cookieParser, SemVer)
  nodes.client.classList.remove("is-active");
  nodes.middleware.classList.add("is-active");
  logTrace(`[2. MIDDLEWARES] express.json() parsea body. SemVer añade header 'X-API-Version: 1.0.0'.`);
  await wait(300);

  // PASO 3: Router
  nodes.middleware.classList.remove("is-active");
  nodes.router.classList.add("is-active");
  logTrace(`[3. ENRUTADOR] express.Router() resuelve coincidencia: ${method} ${endpoint}`);
  await wait(300);

  // PASO 4: Validador (si aplica)
  let hayErrorValidacion = false;
  let listaErrores = [];

  if (method === "POST" && endpoint === "/api/v1/oms/ordenes") {
    nodes.router.classList.remove("is-active");
    nodes.validator.classList.add("is-active");
    logTrace(`[4. VALIDADOR] express-validator inspecciona restricciones de tipos y formato...`);

    if (!bodyJson.cliente || String(bodyJson.cliente).trim().length < 3) {
      listaErrores.push({ campo: "cliente", mensaje: "El nombre del cliente debe tener al menos 3 caracteres" });
    }
    const serviciosValidos = ["inspeccion_sanitaria", "certificacion_bpm", "auditoria_calidad", "control_aduanero"];
    if (!bodyJson.servicio || !serviciosValidos.includes(bodyJson.servicio)) {
      listaErrores.push({ campo: "servicio", mensaje: `Servicio inválido. Permitidos: ${serviciosValidos.join(", ")}` });
    }
    if (bodyJson.monto === undefined || Number(bodyJson.monto) < 1) {
      listaErrores.push({ campo: "monto", mensaje: "El monto debe ser un número positivo mayor o igual a 1.00" });
    }

    if (listaErrores.length > 0) {
      hayErrorValidacion = true;
      nodes.validator.classList.remove("is-active");
      nodes.validator.classList.add("is-error");
      logTrace(`[4. VALIDADOR ERROR] Se detectaron ${listaErrores.length} fallos. Retornando 400 Bad Request.`);

      await wait(300);
      statusBadge.textContent = "400 BAD REQUEST";
      statusBadge.className = "badge-status is-400";
      responseOutput.innerHTML = highlightJson({
        error: "Validación fallida",
        mensaje: "Los datos enviados no cumplen con el formato o las restricciones de la API",
        errores: listaErrores
      });
      btnSend.disabled = false;
      return;
    }
  }

  // PASO 5: Controlador
  nodes.validator.classList.remove("is-active");
  nodes.router.classList.remove("is-active");
  nodes.controller.classList.add("is-active");
  logTrace(`[5. CONTROLADOR] OrdenController recibe req.body y req.params.`);
  await wait(300);

  // PASO 6: DTO (Sanitización y Whitelist)
  nodes.controller.classList.remove("is-active");
  nodes.dto.classList.add("is-active");
  logTrace(`[6. DTO DE SEGURIDAD] Instanciando DTO. Whitelist activa: eliminando atributos no autorizados.`);
  await wait(300);

  // PASO 7: Servicio (Reglas OMS)
  nodes.dto.classList.remove("is-active");
  nodes.service.classList.add("is-active");
  logTrace(`[7. SERVICIO OMS] OrdenService ejecuta lógica de negocio, cálculo de IVA (12%) y reglas de estado.`);
  await wait(300);

  // PASO 8: Modelo / Bóveda
  nodes.service.classList.remove("is-active");
  nodes.model.classList.add("is-active");
  logTrace(`[8. REPOSITORIO/MODELO] Acceso a la capa de datos.`);
  await wait(300);

  // CONSTRUIR RESPUESTA SEGÚN EL ENDPOINT
  let statusCode = 200;
  let responseData = null;
  const db = readStorage(DATA_KEY, INITIAL_ORDERS);

  if (endpoint === "/health") {
    statusCode = 200;
    responseData = {
      estado: "operativo",
      version: "1.0.0",
      servicio: "oms-custom-api-example",
      uptimeSegundos: 450,
      timestamp: new Date().toISOString()
    };
  } else if (endpoint === "/api/v1/oms/ordenes/schema") {
    statusCode = 200;
    responseData = { data: ESQUEMA_OMS };
  } else if (endpoint === "/api/v1/oms/ordenes/sesion") {
    statusCode = 200;
    const currentCookie = readStorage(COOKIE_KEY, null);
    responseData = {
      ultimoOperador: currentCookie,
      autenticado: Boolean(currentCookie)
    };
  } else if (endpoint === "/api/v1/oms/ordenes/preview") {
    statusCode = 200;
    const subtotal = Number(bodyJson?.monto || 0);
    const iva = Number((subtotal * 0.12).toFixed(2));
    responseData = {
      simulacion: true,
      mensaje: "Cálculo previo ejecutado con éxito (sin escribir en base de datos)",
      totalesCalculados: {
        montoBase: subtotal,
        tasaIva: "12%",
        impuestoCalculado: iva,
        totalEstimado: Number((subtotal + iva).toFixed(2))
      },
      previsualizacionOrden: {
        cliente: bodyJson?.cliente || "Consumidor Final",
        servicio: bodyJson?.servicio || "inspeccion_sanitaria",
        prioridad: bodyJson?.prioridad || "media",
        estadoTentativo: "borrador",
        metadata: bodyJson?.metadata || {}
      }
    };
  } else if (endpoint === "/api/v1/oms/ordenes" && method === "GET") {
    statusCode = 200;
    responseData = {
      total: db.length,
      filtrosAplicados: {},
      data: db
    };
  } else if (endpoint === "/api/v1/oms/ordenes" && method === "POST") {
    statusCode = 201;
    const subtotal = Number(bodyJson.monto);
    const impuesto = Number((subtotal * 0.12).toFixed(2));
    const total = Number((subtotal + impuesto).toFixed(2));
    const operador = String(bodyJson.operador || "carlos.mendoza").trim().toLowerCase();

    // DTO sanitiza descartando campos maliciosos
    const nueva = {
      id: `ord-${Date.now().toString(16).slice(-6)}`,
      codigo: `ORD-2026-${String(db.length + 1).padStart(3, "0")}`,
      cliente: String(bodyJson.cliente).trim(),
      servicio: String(bodyJson.servicio).trim().toLowerCase(),
      prioridad: bodyJson.prioridad ? String(bodyJson.prioridad).trim().toLowerCase() : "media",
      monto: subtotal,
      impuesto: impuesto,
      total: total,
      estado: "borrador",
      operador: operador,
      metadata: bodyJson.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.unshift(nueva);
    writeStorage(DATA_KEY, db);
    writeStorage(COOKIE_KEY, operador);
    cookieBadge.textContent = `ultimoOperador=${operador}; HttpOnly; SameSite=Lax`;

    responseData = {
      mensaje: "Orden de servicio creada exitosamente en el sistema OMS",
      data: nueva
    };
  } else if (endpoint === "/api/v1/oms/ordenes/:id") {
    const orden = db[0];
    if (!orden) {
      statusCode = 404;
      responseData = { error: "No se encontró la orden solicitada", codigoHttp: 404 };
    } else if (method === "GET") {
      statusCode = 200;
      responseData = { data: orden };
    } else if (method === "DELETE") {
      db.shift();
      writeStorage(DATA_KEY, db);
      statusCode = 204;
      responseData = null;
    } else if (method === "PATCH") {
      const monto = bodyJson?.monto !== undefined ? Number(bodyJson.monto) : orden.monto;
      const impuesto = Number((monto * 0.12).toFixed(2));
      const updated = {
        ...orden,
        ...bodyJson,
        monto,
        impuesto,
        total: Number((monto + impuesto).toFixed(2)),
        updatedAt: new Date().toISOString()
      };
      db[0] = updated;
      writeStorage(DATA_KEY, db);
      statusCode = 200;
      responseData = {
        mensaje: "Orden actualizada correctamente",
        data: updated
      };
    }
  }

  // Finalizar animación
  nodes.model.classList.remove("is-active");
  nodes.controller.classList.add("is-active");
  await wait(200);
  nodes.controller.classList.remove("is-active");
  nodes.client.classList.add("is-active");
  logTrace(`[RESPUESTA] Socket emite HTTP ${statusCode}. Headers: X-API-Version: 1.0.0.`);
  await wait(200);
  nodes.client.classList.remove("is-active");

  statusBadge.textContent = `${statusCode} ${statusCode === 201 ? "CREATED" : statusCode === 204 ? "NO CONTENT" : statusCode === 404 ? "NOT FOUND" : "OK"}`;
  statusBadge.className = `badge-status is-${statusCode}`;

  if (statusCode === 204) {
    responseOutput.innerHTML = '<span style="color:#64748b;">// 204 No Content: La orden fue dada de baja con éxito.</span>';
  } else {
    responseOutput.innerHTML = highlightJson(responseData);
  }

  btnSend.disabled = false;
});

/* ========================================================
   INSPECTOR DE LÍNEAS DE CÓDIGO
   ======================================================== */
document.querySelectorAll(".code-line[data-desc]").forEach((line) => {
  line.addEventListener("click", () => {
    const parentCard = line.closest(".code-card");
    const drawer = parentCard?.nextElementSibling;
    if (!drawer || !drawer.classList.contains("line-explainer-drawer")) return;

    // Deseleccionar previas
    parentCard.querySelectorAll(".code-line").forEach((l) => l.classList.remove("is-selected"));
    line.classList.add("is-selected");

    const lineNum = line.querySelector(".code-line__num")?.textContent || "";
    const titleEl = drawer.querySelector(".line-explainer-title");
    const bodyEl = drawer.querySelector(".line-explainer-body");

    if (titleEl) titleEl.innerHTML = `<span>🔎 Explicación de la Línea ${lineNum}</span>`;
    if (bodyEl) bodyEl.innerHTML = line.dataset.desc;

    drawer.classList.add("is-visible");
  });
});

/* ========================================================
   BUSCADOR DEL GLOSARIO
   ======================================================== */
const glossaryInput = document.querySelector("#glossaryInput");
glossaryInput?.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();
  document.querySelectorAll(".glossary-card").forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? "block" : "none";
  });
});

/* ========================================================
   BOTONES DE COPIAR CÓDIGO
   ======================================================== */
document.querySelectorAll("[data-copy-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.copyTarget;
    const codeEl = document.querySelector(targetId);
    if (!codeEl) return;

    // Extraer solo el texto del código ignorando comentarios o números
    const lines = Array.from(codeEl.querySelectorAll(".code-line__code"))
      .map((c) => c.innerText)
      .join("\n");

    navigator.clipboard.writeText(lines || codeEl.innerText).then(() => {
      const orig = btn.textContent;
      btn.textContent = "¡Copiado!";
      btn.style.borderColor = "var(--accent-green)";
      btn.style.color = "var(--accent-green)";
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.borderColor = "";
        btn.style.color = "";
      }, 2000);
      showToast("Código copiado al portapapeles");
    });
  });
});

// Inicialización de la UI
renderTimer();
updateProgressUI();
const savedCookie = readStorage(COOKIE_KEY, null);
if (savedCookie) {
  cookieBadge.textContent = `ultimoOperador=${savedCookie}; HttpOnly; SameSite=Lax`;
}
