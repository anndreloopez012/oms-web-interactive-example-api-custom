/**
 * Enrutador Personalizado de Strapi (Custom Router)
 *
 * ¿Por qué existe este archivo?
 * Cuando en OMS necesitamos endpoints especializados (como `/preview` para simulaciones de cálculo,
 * `/schema` para introspección de metadatos o validaciones personalizadas), creamos un archivo
 * de rutas custom dentro de `src/api/<nombre>/routes/`.
 * Strapi fusiona automáticamente estas rutas con las del core.
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/ordenes/schema",
      handler: "custom-orden.schema",
      config: {
        auth: false,
        policies: [],
        description: "Devuelve la especificación del esquema OMS para renderizar formularios dinámicos"
      }
    },
    {
      method: "POST",
      path: "/ordenes/preview",
      handler: "custom-orden.preview",
      config: {
        auth: false,
        policies: [],
        description: "Dry-Run: Simula el cálculo financiero de impuestos (IVA 12%) sin persistir en BD"
      }
    },
    {
      method: "GET",
      path: "/ordenes/sesion",
      handler: "custom-orden.sesion",
      config: {
        auth: false,
        policies: [],
        description: "Consulta la cookie de operador asignada por el backend Strapi"
      }
    },
    {
      method: "GET",
      path: "/ordenes",
      handler: "custom-orden.list",
      config: {
        auth: false,
        policies: []
      }
    },
    {
      method: "GET",
      path: "/ordenes/:id",
      handler: "custom-orden.findOne",
      config: {
        auth: false,
        policies: []
      }
    },
    {
      method: "POST",
      path: "/ordenes",
      handler: "custom-orden.create",
      config: {
        auth: false,
        policies: []
      }
    },
    {
      method: "PATCH",
      path: "/ordenes/:id",
      handler: "custom-orden.update",
      config: {
        auth: false,
        policies: []
      }
    },
    {
      method: "DELETE",
      path: "/ordenes/:id",
      handler: "custom-orden.delete",
      config: {
        auth: false,
        policies: []
      }
    }
  ]
};
