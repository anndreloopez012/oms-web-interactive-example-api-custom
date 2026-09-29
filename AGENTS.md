# Protocolo Multi-Agente (Antigravity, Codex & Claude) - oms-web-interactive-example-api-custom

Este repositorio colabora en conjunto con Antigravity, Codex y Claude Code utilizando el Obsidian Vault local (`/Users/macbookpro/Documents/Obsidian Vault`) y Graphify como fuente compartida de verdad.

---

## 1. Identidad y Propósito del Repositorio
- **Nombre:** `oms-web-interactive-example-api-custom`
- **Rol:** Guía web interactiva y código fuente de referencia pedagógica para la creación de APIs personalizadas (Custom APIs) estilo OMS en Node.js y Express.
- **Stack:** HTML5, CSS3 moderno (Cyber/Proyector), JavaScript Vanilla (ESM), Node.js, Express, express-validator, node:test.
- **Puntos clave:**
  - Separación en 8 capas: `routes/`, `controllers/`, `services/`, `dtos/`, `validators/`, `models/`, `middlewares/`.
  - Endpoints custom OMS: `POST /preview` (Dry-run de cálculos) y `GET /schema` (Introspección dinámica).
  - Explicación pedagógica exhaustiva línea por línea de funciones y palabras clave de Node.js.

---

## 2. Consumo de Memoria en Obsidian
Antes de realizar modificaciones estructurales:
1. Consultar la memoria del proyecto mediante la CLI local:
   ```bash
   memoria contexto oms-web-interactive-example-api-custom
   memoria proyecto oms-web-interactive-example-api-custom
   ```
2. Consultar Graphify para análisis de dependencias si existe `graphify-out/graph.json`:
   ```bash
   graphify query "pregunta sobre la arquitectura o flujo"
   ```

---

## 3. Sincronización Continua y Cierre de Cambios
Al realizar cambios en el código:
1. Inspección previa: `git status --short`.
2. Ejecución y validación de pruebas:
   ```bash
   cd api && npm test
   ```
3. Actualización de Graphify:
   ```bash
   graphify update .
   ```
4. Exportar y sincronizar con Obsidian:
   ```bash
   graphify export obsidian --dir "$HOME/Documents/Obsidian Vault/Memoria/Graphify/oms-web-interactive-example-api-custom"
   ```
5. Refrescar índices:
   ```bash
   memoria refresh
   ```
6. Instalar hooks si no estuvieran presentes:
   ```bash
   graphify hook install
   ```
