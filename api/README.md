# ⚡ API REST Personalizada OMS (Backend Express Enterprise)

Código fuente de la API REST empresarial para el sistema OMS (Operations Management System), diseñada con arquitectura desacoplada por capas: **Rutas**, **Controladores**, **Servicios**, **DTOs**, **Validadores**, **Middlewares** y **Modelos**.

---

## 🚀 Inicio Rápido en 3 Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo con recarga automática nativa (Node 18+)
npm run dev

# 3. Ejecutar suite de 12 pruebas automatizadas nativas
npm test
```

El servidor quedará activo en: `http://localhost:3000`

---

## 📡 Catálogo de Endpoints

| Método | Endpoint | Descripción | Características OMS |
|---|---|---|---|
| `GET` | `/health` | Diagnóstico de salud | Versionado SemVer `X-API-Version: 1.0.0` |
| `GET` | `/api/v1/oms/ordenes` | Listar órdenes | Filtros por `?estado=...&prioridad=...&cliente=...` |
| `GET` | `/api/v1/oms/ordenes/:id` | Detalle por identificador | Retorna 404 estructurado si no existe |
| `POST` | `/api/v1/oms/ordenes` | Crear orden de servicio | DTO estricto, cálculo de IVA (12%) y cookie segura |
| `PATCH` | `/api/v1/oms/ordenes/:id` | Actualización parcial | Recalcula totales si el monto varía |
| `DELETE` | `/api/v1/oms/ordenes/:id` | Eliminar / baja de orden | Retorna `204 No Content` |
| `POST` | `/api/v1/oms/ordenes/preview` | **Custom OMS**: Simulación previa | Dry-Run de cálculos sin guardar en BD |
| `GET` | `/api/v1/oms/ordenes/schema` | **Custom OMS**: Esquema dinámico | Introspección de campos para UI dinámica |
| `GET` | `/api/v1/oms/ordenes/sesion` | Auditoría de operador | Lee la cookie HTTP `ultimoOperador` |

---

## 🧪 Ejemplos cURL para Terminal

### 1. Consultar estado y versión SemVer
```bash
curl -i http://localhost:3000/health
```

### 2. Introspección del Esquema Dinámico OMS
```bash
curl -s http://localhost:3000/api/v1/oms/ordenes/schema
```

### 3. Simulación Previa (Dry-Run / Preview)
```bash
curl -s -X POST http://localhost:3000/api/v1/oms/ordenes/preview \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Droguería Central",
    "servicio": "certificacion_bpm",
    "monto": 8000.0
  }'
```

### 4. Crear una nueva orden con DTO y Cookie
```bash
curl -i -X POST http://localhost:3000/api/v1/oms/ordenes \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Agencia Logística Marítima",
    "servicio": "control_aduanero",
    "monto": 14500.0,
    "prioridad": "alta",
    "operador": "carlos.mendoza",
    "metadata": { "puerto": "Puerto Quetzal", "dua": "DUA-98124" }
  }'
```

### 5. Intentar inyectar campos no autorizados (Comprobación de DTO)
```bash
curl -s -X POST http://localhost:3000/api/v1/oms/ordenes \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Ataque de Parámetros",
    "servicio": "inspeccion_sanitaria",
    "monto": 2000.0,
    "esAdmin": true,
    "estado": "aprobado",
    "total": 0.50
  }'
# Nota que el DTO descarta `esAdmin` y `total`, y fuerza `estado: "borrador"`.
```

---

## 🏛️ ¿Por qué esta estructura? (Clean Architecture para APIs)

```text
api/
├── package.json               # Manifiesto, scripts y dependencias
├── src/
│   ├── app.js                 # Ensamblador: middlewares, CORS, JSON, SemVer y rutas
│   ├── server.js              # Infraestructura: puerto TCP y Graceful Shutdown
│   ├── routes/
│   │   └── orden.routes.js    # Enrutador: Mapeo de URLs a controladores
│   ├── controllers/
│   │   └── orden.controller.js# Controlador: Manejo de req/res, HTTP Status y cookies
│   ├── services/
│   │   └── orden.service.js   # Cerebro: Reglas OMS, cálculo de IVA, previews y esquemas
│   ├── dtos/
│   │   └── orden.dto.js       # Seguridad: Whitelist y sanitización de payloads
│   ├── validators/
│   │   └── orden.validator.js # Portero: express-validator (400 Bad Request)
│   ├── middlewares/
│   │   └── error.middleware.js# Red de seguridad: 404 y manejador global de errores
│   └── models/
│       └── orden.model.js     # Persistencia: Repositorio en memoria con filtros
└── test/
    └── api.test.js            # 12 pruebas automatizadas con node:test
```
