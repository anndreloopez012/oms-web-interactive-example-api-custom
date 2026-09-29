# Graph Report - oms-web-interactive-example-api-custom  (2026-09-29)

## Corpus Check
- 24 files · ~15,862 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 173 nodes · 197 edges · 17 communities (13 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4b941407`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `OrdenModel` - 11 edges
2. `OrdenController` - 10 edges
3. `OrdenService` - 9 edges
4. `getCustomService()` - 8 edges
5. `handleControllerError()` - 8 edges
6. `🏢 OMS · Web Interactive Example API Custom` - 8 edges
7. `🧪 Ejemplos cURL para Terminal` - 6 edges
8. `⚡ API REST Personalizada OMS (Backend Express Enterprise)` - 5 edges
9. `scripts` - 4 edges
10. `getPayload()` - 4 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (17 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (32): btnSend, cheatsheetInput, completedSteps, cookieBadge, currentScaffoldData, endpointSelect, escapeHtml(), ESQUEMA_OMS (+24 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (6): ESQUEMA_ORDEN, ordenesDb, OrdenModel, delete(), findOne(), update()

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (17): author, dependencies, cookie-parser, cors, express, express-validator, description, keywords (+9 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (10): manejarError(), rutaNoEncontrada(), ordenRouter, app, server, ESTADOS_PERMITIDOS, PRIORIDADES_PERMITIDAS, SERVICIOS_PERMITIDOS (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (10): 1. Consultar estado y versión SemVer, 2. Introspección del Esquema Dinámico OMS, 3. Simulación Previa (Dry-Run / Preview), 4. Crear una nueva orden con DTO y Cookie, 5. Intentar inyectar campos no autorizados (Comprobación de DTO), ⚡ API REST Personalizada OMS (Backend Express Enterprise), 📡 Catálogo de Endpoints, 🧪 Ejemplos cURL para Terminal (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (9): 🎮 Características de la Guía Interactiva, ⚡ Ciclo de Vida de una Petición HTTP, 🚀 Cómo Iniciar la API Backend, 🏛️ El Por Qué de los Archivos y la Arquitectura, 📄 Licencia, 🏢 OMS · Web Interactive Example API Custom, 🎯 ¿Qué es este proyecto?, ⏱️ Ruta de Aprendizaje de 30 Minutos (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.40
Nodes (4): 1. Identidad y Propósito del Repositorio, 2. Consumo de Memoria en Obsidian, 3. Sincronización Continua y Cierre de Cambios, Protocolo Multi-Agente (Antigravity, Codex & Claude) - oms-web-interactive-example-api-custom

### Community 9 - "Community 9"
Cohesion: 0.50
Nodes (3): Comandos Esenciales, Directivas para Claude Code - oms-web-interactive-example-api-custom, Reglas de Arquitectura

### Community 10 - "Community 10"
Cohesion: 0.42
Nodes (10): create(), delete(), findOne(), getCustomService(), getPayload(), handleControllerError(), list(), preview() (+2 more)

## Knowledge Gaps
- **67 isolated node(s):** `name`, `version`, `description`, `main`, `type` (+62 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OrdenModel` connect `Community 1` to `Community 3`, `Community 7`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `OrdenController` connect `Community 6` to `Community 3`, `Community 7`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _67 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05110336817653891 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1286549707602339 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.14619883040935672 - nodes in this community are weakly interconnected._