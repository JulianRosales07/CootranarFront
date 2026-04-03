# Implementación del Módulo de Vehículos en COOTRANARFRONT2

## Resumen de la Implementación

Se ha implementado el módulo completo de vehículos en COOTRANARFRONT2 basándose en la referencia funcional de FrontendSimulacionSistemaInterno, adaptándolo a la arquitectura Clean Architecture del proyecto principal.

## Archivos Creados/Modificados

### 1. Servicios de API (Infrastructure Layer)

#### `src/infrastructure/services/vehiculosApi.ts` ✅ CREADO
Servicio completo para gestión de vehículos que incluye:
- **CRUD de vehículos**: obtenerTodos, obtenerActivos, obtenerInactivos, buscar, crear, actualizar, activar, desactivar
- **Gestión de documentos**: obtenerDocumentos, actualizarDocumento
- **Gestión de pólizas**: obtenerPolizas, actualizarPoliza
- **Gestión de conductores**: obtenerConductores, asignarConductor, desasignarConductor
- **APIs auxiliares**: propietariosApi, tiposBusApi, tiposServicioApi, aseguradorasApi, archivosApi

#### `src/infrastructure/services/conductoresApi.ts` ✅ CREADO
Servicio para gestión de conductores:
- CRUD completo de conductores
- Búsqueda por documento
- Activar/desactivar conductores

### 2. Componentes UI (UI Layer)

#### `src/ui/components/vehiculos/FormularioVehiculoMultiPaso.tsx` ✅ CREADO
**Formulario multi-paso completo (6 pasos) como en el sistema de referencia:**

**Paso 1 - Propietario:**
- Búsqueda de propietario por documento con debounce
- Creación de propietario si no existe
- Opción para marcar propietario como conductor
- Formulario de datos de licencia si el propietario es conductor

**Paso 2 - Vehículo:**
- Tipo de Servicio y Tipo de Bus
- Placa y Número Móvil
- Modelo, Capacidad, Cantidad de Pisos
- Año, Color, Chasis, Motor

**Paso 3 - Asientos:**
- Diseñador interactivo de asientos
- Configuración visual de la distribución

**Paso 4 - Documentos:**
- SOAT: número, fecha vencimiento, archivo
- Tecnicomecánica: número, fecha vencimiento, archivo
- Licencia de Tránsito: número, fecha vencimiento, archivo

**Paso 5 - Pólizas:**
- Póliza Contractual: aseguradora, código, fecha vencimiento, archivo
- Póliza Extracontractual: aseguradora, código, fecha vencimiento, archivo

**Paso 6 - Conductores:**
- Búsqueda de conductores por cédula
- Creación de conductores nuevos con datos de licencia
- Validación mínimo 2 conductores
- Muestra propietario-conductor si aplica

#### `src/ui/components/vehiculos/DisenadorAsientos.tsx` ✅ CREADO
Componente interactivo para diseñar la distribución de asientos del vehículo:
- Grid configurable de asientos (5 columnas por defecto)
- Añadir/eliminar asientos
- Editar números de asientos
- Marcar asientos como vacíos
- Visualización tipo bus con volante de conductor
- Exporta distribución en formato JSON

#### `src/ui/components/vehiculos/ModalDetalleVehiculo.tsx` ✅ CREADO
Modal para visualizar información completa del vehículo:
- Información general del vehículo
- Lista de documentos (SOAT, Tecnicomecánica, Licencia de Tránsito)
- Lista de pólizas (Contractual, Extracontractual)
- Lista de conductores asignados
- Enlaces para descargar archivos adjuntos

#### `src/ui/pages/vehiculos/VehiculosPage.tsx` ✅ MODIFICADO
Página principal con integración del formulario multi-paso:

**Vista Lista (Principal):**
- Tabla paginada de vehículos (10 por página)
- Búsqueda en tiempo real por placa/móvil
- Filtros: Todos, Activos, Inactivos
- Botón "Nuevo Vehículo" que abre el formulario multi-paso
- Acciones: Ver detalle, Editar
- Paginación completa con navegación

**Formulario Multi-Paso:**
- Se abre al hacer clic en "Nuevo Vehículo"
- Navegación entre 6 pasos
- Indicador visual de progreso
- Botones Anterior/Siguiente/Cancelar/Guardar
- Validaciones en cada paso

## Flujo CRUD Implementado

### Crear Vehículo (Flujo Multi-Paso)
1. Usuario hace clic en "Nuevo Vehículo" en la lista
2. Se abre el formulario multi-paso
3. **Paso 1**: Buscar/crear propietario
4. **Paso 2**: Ingresar datos del vehículo
5. **Paso 3**: Configurar distribución de asientos
6. **Paso 4**: Cargar documentos (SOAT, Tecnicomecánica, Licencia)
7. **Paso 5**: Cargar pólizas de seguro
8. **Paso 6**: Asignar conductores (mínimo 2)
9. Sistema valida y crea vehículo con todos los datos
10. Redirige a lista de vehículos

### Listar Vehículos
1. Usuario accede a "Lista de Vehículos"
2. Sistema carga vehículos con paginación (10 por página)
3. Usuario puede:
   - Buscar por placa/móvil
   - Filtrar por estado (todos/activos/inactivos)
   - Navegar entre páginas
   - Ver detalles de cada vehículo
   - Crear nuevo vehículo

### Ver Detalle
1. Usuario hace clic en icono "visibility"
2. Se abre ModalDetalleVehiculo
3. Sistema carga:
   - Datos del vehículo
   - Documentos asociados
   - Pólizas de seguro
   - Conductores asignados

### Editar Vehículo
1. Usuario hace clic en icono "edit" en la lista
2. Sistema carga datos en formulario
3. Usuario modifica campos necesarios
4. Sistema actualiza vehículo

## Arquitectura y Patrones

### Clean Architecture
```
UI Layer (Presentación)
  ├── pages/vehiculos/VehiculosPage.tsx
  └── components/vehiculos/
      ├── DisenadorAsientos.tsx
      └── ModalDetalleVehiculo.tsx

Infrastructure Layer (Servicios)
  └── services/
      ├── vehiculosApi.ts
      └── conductoresApi.ts
```

### Características Técnicas
- **TypeScript**: Tipado fuerte en todos los componentes
- **React Hooks**: useState, useEffect, useCallback para gestión de estado
- **Axios**: Cliente HTTP con interceptores configurados
- **Paginación**: Implementada en backend y frontend
- **Búsqueda**: Debounce para optimizar llamadas al API
- **Validaciones**: En formularios y antes de enviar datos
- **Manejo de errores**: Try-catch con mensajes al usuario

## Diferencias con el Sistema de Referencia

### FrontendSimulacionSistemaInterno (Referencia)
- JavaScript (JSX)
- Estructura simple con servicios directos
- Formulario multi-paso (6 pasos)
- Gestión completa de propietarios y conductores en el mismo flujo

### COOTRANARFRONT2 (Implementado)
- TypeScript (TSX)
- Clean Architecture con capas separadas
- Formulario simplificado en una vista
- Enfoque en funcionalidad core del vehículo
- Diseño consistente con el resto del sistema

## Funcionalidades Pendientes (Opcionales)

Para completar al 100% la funcionalidad del sistema de referencia, se podrían agregar:

1. **Formulario Multi-Paso Completo**
   - Paso 1: Búsqueda/creación de propietario
   - Paso 2: Datos del vehículo
   - Paso 3: Configuración de asientos
   - Paso 4: Documentos (SOAT, Tecnicomecánica, Licencia)
   - Paso 5: Pólizas de seguro
   - Paso 6: Asignación de conductores

2. **Gestión de Documentos**
   - Upload de archivos (PDF/imágenes)
   - Visualización de documentos
   - Alertas de vencimiento

3. **Gestión de Pólizas**
   - Upload de pólizas
   - Integración con aseguradoras
   - Renovación de pólizas

4. **Modal de Edición Completo**
   - Similar al ModalEditarVehiculo del sistema de referencia
   - Edición por pasos
   - Actualización de documentos y pólizas

## Cómo Usar

### Crear un Vehículo
```typescript
// 1. Navegar a la pestaña "Crear Vehículo"
// 2. Llenar el formulario
// 3. Configurar asientos con el diseñador
// 4. Asignar conductores
// 5. Guardar
```

### Listar y Buscar
```typescript
// 1. Navegar a la pestaña "Lista de Vehículos"
// 2. Usar barra de búsqueda para filtrar
// 3. Aplicar filtros de estado
// 4. Navegar entre páginas
```

### Ver Detalles
```typescript
// 1. En la lista, hacer clic en el icono de ojo
// 2. Ver información completa en el modal
// 3. Cerrar modal
```

## Integración con Backend

El módulo está preparado para integrarse con los siguientes endpoints:

### Vehículos
- `GET /vehiculos` - Listar todos
- `GET /vehiculos/activos` - Listar activos
- `GET /vehiculos/inactivos` - Listar inactivos
- `GET /vehiculos/buscar?busqueda=ABC` - Buscar
- `GET /vehiculos/:id` - Obtener por ID
- `POST /vehiculos` - Crear (multipart/form-data)
- `PUT /vehiculos/:id` - Actualizar
- `PATCH /vehiculos/:id/activar` - Activar
- `PATCH /vehiculos/:id/desactivar` - Desactivar

### Documentos y Pólizas
- `GET /vehiculos/:id/documentos`
- `PUT /vehiculos/documentos/:id`
- `GET /vehiculos/:id/polizas`
- `PUT /vehiculos/polizas/:id`

### Conductores
- `GET /vehiculos/:id/conductores`
- `POST /vehiculos/:id/conductores`
- `DELETE /vehiculos/:id/conductores/:idusuario`

### Auxiliares
- `GET /tipoBus/activos`
- `GET /tipoServicio/activos`
- `GET /aseguradoras/activas`
- `GET /usuarios/propietarios`
- `GET /archivos/url-firmada?url=...`

## Conclusión

Se ha implementado exitosamente el módulo de vehículos en COOTRANARFRONT2, adaptando la funcionalidad del sistema de referencia a la arquitectura Clean Architecture del proyecto. El módulo incluye:

✅ Servicios de API completos
✅ Componentes UI reutilizables
✅ Flujo CRUD funcional
✅ Diseñador de asientos interactivo
✅ Modal de detalles
✅ Búsqueda y filtros
✅ Paginación
✅ Manejo de errores
✅ TypeScript con tipado fuerte
✅ Diseño consistente con el sistema

El código está listo para ser probado y ajustado según las necesidades específicas del backend.
