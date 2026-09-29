# Directivas para Claude Code - oms-web-interactive-example-api-custom

## Comandos Esenciales
- Ejecutar pruebas automatizadas: `cd api && npm test`
- Iniciar servidor en desarrollo: `cd api && npm run dev`
- Iniciar servidor en producción: `cd api && npm start`
- Actualizar grafo de dependencias: `graphify update .`
- Exportar a Obsidian: `graphify export obsidian --dir "$HOME/Documents/Obsidian Vault/Memoria/Graphify/oms-web-interactive-example-api-custom"`
- Refrescar memoria general: `memoria refresh`

## Reglas de Arquitectura
1. Respetar siempre el desacoplamiento de capas:
   - `api/src/routes/`: Declaración de URLs y mapeo HTTP.
   - `api/src/controllers/`: Manejo exclusivo de `req` y `res`, sin cálculos pesados.
   - `api/src/services/`: Lógica de negocio (IVA 12%, reglas OMS, /preview).
   - `api/src/dtos/`: Sanitización obligatoria y whitelist contra inyección de datos.
   - `api/src/validators/`: Validación declarativa con express-validator (400 Bad Request).
   - `api/src/models/`: Persistencia y repositorio de datos.
   - `api/src/middlewares/`: Trazabilidad, 404 y manejo centralizado de errores.
2. Mantener la suite de pruebas nativas `api/test/api.test.js` en 100% verde con `node --test`.
3. Sincronizar con Obsidian y Graphify al finalizar cualquier refactorización.
