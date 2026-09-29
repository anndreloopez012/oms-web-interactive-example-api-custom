/**
 * Enrutador Core de Strapi (Core Router)
 *
 * ¿Por qué existe este archivo?
 * En Strapi, `factories.createCoreRouter` genera de manera automática los endpoints CRUD estándar:
 * - GET    /api/ordenes       (find)
 * - GET    /api/ordenes/:id   (findOne)
 * - POST   /api/ordenes       (create)
 * - PUT    /api/ordenes/:id   (update)
 * - DELETE /api/ordenes/:id   (delete)
 */

export default {
  type: "core",
  uid: "api::orden.orden"
};
