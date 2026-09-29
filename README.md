# 🏢 OMS · Web Interactive Example API Custom

> **Laboratorio Guiado & Guía Web Interactiva (30 Minutos)** para dominar los fundamentos de Node.js, Express y la construcción de APIs personalizadas desacopladas estilo **OMS (Operations Management System)**.

---

## 🎯 ¿Qué es este proyecto?

Este repositorio es una experiencia de aprendizaje interactiva diseñada para que estudiantes y desarrolladores comprendan a fondo:
1. **El ciclo de vida de una petición HTTP** en Node.js y Express desde que el cliente envía los bytes hasta que la respuesta regresa.
2. **La arquitectura en capas empresariales** (Rutas, Validaciones, Controladores, DTOs, Servicios, Modelos y Middlewares) inspirada en el backend de **OMS**.
3. **Endpoints Custom Especializados**: cómo implementar rutas fuera del CRUD tradicional como `POST /preview` (Dry-Run de cálculos sin guardar en BD) y `GET /schema` (Introspección dinámica del esquema de datos).
4. **Explicación línea a línea**: qué significa cada palabra clave de Node.js (`import`, `express()`, `app.use()`, `req`, `res`, `next()`, `async/await`, `Object.freeze()`, etc.) y por qué existe cada archivo.

---

## 🎮 Características de la Guía Interactiva

- **Visualizador Gráfico del Ciclo de Vida**: Un pipeline animado en tiempo real que ilumina cada capa (`Cliente` ➔ `Middlewares` ➔ `Router` ➔ `Validator` ➔ `Controller` ➔ `DTO` ➔ `Service` ➔ `Model`) a medida que viajan los paquetes.
- **Simulador de Peticiones en Vivo**: Prueba `GET`, `POST`, `PATCH`, `DELETE`, `preview` y `schema` directamente en el navegador con plantillas de prueba y detección visual de errores 400 Bad Request.
- **Inspector de Líneas de Código**: Haz clic sobre cualquier línea de código para abrir una explicación técnica detallada del concepto de Node.js.
- **Glosario Interactivo**: Buscador en tiempo real de términos fundamentales para estudiantes.
- **Modo Proyector**: Alto contraste con fondo claro optimizado para salones de clase y pantallas de proyección.
- **Cronómetro de 30 Minutos**: Temporizador interactivo integrado con persistencia de progreso en `localStorage`.

---

## 🏛️ El Por Qué de los Archivos y la Arquitectura

```text
oms-web-interactive-example-api-custom/
├── index.html                      # Guía web interactiva y visualizador del ciclo de vida
├── styles.css                      # Estilos con diseño Cyber/Enterprise y soporte para proyector
├── app.js                          # Lógica del simulador visual, animador de nodos y cronómetro
├── README.md                       # Documentación general del laboratorio
├── LICENSE                         # Licencia MIT
├── .gitignore                      # Exclusiones de Git
├── .nojekyll                       # Despliegue en GitHub Pages
├── AGENTS.md                       # Protocolo multi-agente (Graphify/Obsidian)
├── CLAUDE.md                       # Directivas para Claude Code
└── api/
    ├── package.json                # Manifiesto de dependencias y scripts de Node.js
    ├── README.md                   # Documentación técnica de la API y comandos cURL
    ├── src/
    │   ├── app.js                  # Ensamblador de middlewares, SemVer, CORS y rutas
    │   ├── server.js               # Escuchador TCP, puerto y Graceful Shutdown
    │   ├── routes/
    │   │   └── orden.routes.js     # Enrutador: define URLs y vincula controladores
    │   ├── controllers/
    │   │   └── orden.controller.js # Controlador HTTP: procesa req/res, status y cookies
    │   ├── dtos/
    │   │   └── orden.dto.js        # DTOs: filtrado estricto contra inyección de datos
    │   ├── validators/
    │   │   └── orden.validator.js  # Validaciones con express-validator (400 Bad Request)
    │   ├── services/
    │   │   └── orden.service.js    # Cerebro de negocio: cálculo de IVA (12%) y previews
    │   ├── models/
    │   │   └── orden.model.js      # Repositorio y esquema de persistencia en memoria
    │   └── middlewares/
    │       └── error.middleware.js # Manejador centralizado de errores y rutas 404
    └── test/
        └── api.test.js             # 12 pruebas automatizadas nativas con node:test
```

### Tabla de Responsabilidades

| Archivo | Rol Arquitectónico | ¿Por qué existe y no va todo en un solo archivo? |
|---|---|---|
| `package.json` | Manifiesto | Declara módulos modernos (`"type": "module"`) y scripts de ejecución. |
| `src/app.js` | Ensamblador | Configura middlewares y rutas. No abre puertos, permitiendo pruebas instantáneas. |
| `src/server.js` | Infraestructura | Abre el puerto de red y gestiona el apagado limpio (`SIGINT`/`SIGTERM`). |
| `routes/*.js` | Tráfico / URLs | Desacopla las URLs de la lógica interna de los controladores. |
| `controllers/*.js` | Embajador HTTP | Lee `req`, asigna códigos HTTP (`200`, `201`, `204`) y emite cookies seguras. |
| `dtos/*.js` | Seguridad (Whitelist) | Desecha campos no autorizados (como `esAdmin`) y garantiza inmutabilidad. |
| `validators/*.js` | Portero | Frena datos con formato erróneo con `400 Bad Request` antes de gastar recursos. |
| `services/*.js` | Cerebro de Negocio | Aplica reglas de cálculo de IVA, auditoría y operaciones custom (`/preview`, `/schema`). |
| `models/*.js` | Bóveda de Datos | Aísla la persistencia para poder cambiar de base de datos sin tocar la lógica. |
| `middlewares/*.js` | Red de Emergencia | Atrapa rutas inexistentes (404) y excepciones inesperadas (500) sin caídas. |

---

## ⚡ Ciclo de Vida de una Petición HTTP

```text
[ Cliente (Fetch / Postman) ]
            │
            ▼
[ 1. Middlewares Globales ]  ──> express.json(), SemVer ('X-API-Version: 1.0.0'), cookieParser
            │
            ▼
[ 2. Enrutador Express ]     ──> Resuelve coincidencia de URL y Método HTTP
            │
            ▼
[ 3. Validador ]            ──> express-validator (Frena con 400 Bad Request si los tipos fallan)
            │
            ▼
[ 4. Controlador ]           ──> Extrae req.body, req.params, req.query
            │
            ▼
[ 5. DTO de Seguridad ]      ──> Limpia espacios, descarta inyecciones maliciosas y congela datos
            │
            ▼
[ 6. Servicio de Negocio ]   ──> Calcula IVA (12%), totales, reglas de estado y dry-run previews
            │
            ▼
[ 7. Repositorio / Modelo ]  ──> Inserta / Actualiza / Consulta en la capa de datos
            │
            ▼
[ Retorno de Respuesta ]     ──> Status 201 Created, Set-Cookie 'ultimoOperador', JSON final
```

---

## ⏱️ Ruta de Aprendizaje de 30 Minutos

| Checkpoint | Tema | Tiempo | Resultado Clave |
|---|---|---|---|
| **00** | Misión y Estructura | 3 min | Comprender por qué separamos la arquitectura en 8 capas desacopladas |
| **01** | Express, SemVer & Server | 5 min | Levantar Express con header `X-API-Version: 1.0.0` y `/health` |
| **02** | DTOs & Seguridad | 4 min | Crear `CrearOrdenDTO` con whitelist y congelación `Object.freeze()` |
| **03** | Validaciones Declarativas | 4 min | Validar formato y enums con `express-validator` (400 Bad Request) |
| **04** | Modelo & Persistencia | 4 min | Crear `OrdenModel` con correlativos automáticos y catálogo |
| **05** | Servicio & Custom OMS | 5 min | Lógica de IVA (12%), endpoint `/preview` y esquema `/schema` |
| **06** | Controlador & Cookies | 5 min | Ensamblar respuestas HTTP y emitir cookie segura `ultimoOperador` |
| **07** | Pruebas Automatizadas | 3 min | Ejecutar suite de 12 pruebas nativas con `node --test` |

---

## 🚀 Cómo Iniciar la API Backend

```bash
# 1. Entrar a la carpeta de la API
cd api

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor con recarga automática nativa
npm run dev

# 4. Correr la suite de 12 pruebas automatizadas
npm test
```

Para abrir la guía interactiva, basta con abrir `index.html` en cualquier navegador web o servirlo con `npx serve .`.

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más información.
