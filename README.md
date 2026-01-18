# Devsu Test - Gestión de Productos Financieros

Aplicación Angular para la gestión de productos financieros desarrollada como prueba técnica.

## Tecnologías

- Angular 20.3.0
- TypeScript 5.9.2
- RxJS 7.8.0
- Angular Reactive Forms
- Angular Signals (para estado reactivo)

## Requisitos Previos

- Node.js 18 o superior
- npm 9 o superior
- Backend API corriendo en `http://localhost:3002`

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Jeanb1992/JeanBarreto
cd devsu-test
```

2. Instalar dependencias:
```bash
npm install
```

3. Asegurarse de que el backend esté corriendo en `http://localhost:3002`

**Nota sobre CORS:** El proyecto está configurado con un proxy para desarrollo que evita problemas de CORS. Las peticiones a `/bp/*` se redirigen automáticamente a `http://localhost:3002/bp/*` mediante el archivo `proxy.conf.json`.

## Ejecución

### Servidor de desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

### Build para producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/devsu-test`

## Pruebas Unitarias

### Ejecutar pruebas

```bash
npm test
```

### Ejecutar pruebas con cobertura

```bash
npm test -- --code-coverage
```

El reporte de cobertura se generará en `coverage/` y mostrará el porcentaje de cobertura del código.

### Cobertura mínima

El proyecto está configurado para mantener un mínimo del 70% de cobertura de código.

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── constants/        # Constantes de la aplicación
│   │   ├── interceptors/     # Interceptores HTTP
│   │   ├── models/           # Modelos e interfaces
│   │   ├── services/         # Servicios (API, lógica de negocio)
│   │   └── validators/       # Validadores personalizados
│   ├── features/
│   │   └── products/
│   │       └── components/
│   │           ├── product-list/      # Listado de productos
│   │           ├── product-item/     # Item individual de producto
│   │           ├── product-form/      # Formulario agregar/editar
│   │           └── delete-modal/      # Modal de confirmación
│   ├── app.config.ts         # Configuración de la aplicación
│   └── app.routes.ts          # Rutas de la aplicación
```

## Validaciones del Formulario

- **ID**: Requerido, 3-10 caracteres, único (validación asíncrona)
- **Nombre**: Requerido, 5-100 caracteres
- **Descripción**: Requerido, 10-200 caracteres
- **Logo**: Requerido (URL)
- **Fecha de Liberación**: Requerido, >= fecha actual
- **Fecha de Revisión**: Requerido, exactamente 1 año después de la fecha de liberación

## API Endpoints

La aplicación consume los siguientes endpoints:

- `GET /bp/products` - Obtener todos los productos
- `POST /bp/products` - Crear producto
- `PUT /bp/products/:id` - Actualizar producto
- `DELETE /bp/products/:id` - Eliminar producto
- `GET /bp/products/verification/:id` - Verificar existencia de ID

## Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm test` - Ejecuta las pruebas unitarias
- `npm run watch` - Compila en modo watch
