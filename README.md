# ITSQMET · Diagnóstico docente

Aplicación institucional para recopilar información de docentes del Instituto Superior Tecnológico Quito Metropolitano (ITSQMET) en dos ejes:

- necesidades de **capacitación**;
- necesidades de **formación académica**.

Incluye datos de contacto, carrera principal, asignatura percibida como más compleja, 27 carreras institucionales, preguntas principalmente cerradas, guardado automático de borrador y revisión antes de enviar.

## Arquitectura

- Frontend estático: HTML, CSS y JavaScript, publicado con GitHub Pages.
- Base de datos: PostgreSQL en Neon.
- Backend: Neon Function. La cadena de conexión nunca llega al navegador.
- Administración: panel con clave, filtros por carrera/programa, indicadores, exportación CSV e impresión/PDF.

## Archivos principales

- `index.html`, `styles.css`, `app.js`: aplicación web.
- `config.js`: URL pública del backend y período activo.
- `db/schema.sql`: esquema y catálogo de las 27 carreras.
- `api/index.ts`: API de registro, catálogo y panel administrativo.
- `neon.ts`: definición de la Neon Function.
- `.github/workflows/pages.yml`: despliegue automático de GitHub Pages desde `main`.

## Seguridad

El formulario valida cédula ecuatoriana, teléfono, campos condicionales y máximo de necesidades seleccionadas tanto en cliente como en servidor. Existe una sola respuesta por docente y período. La API limita solicitudes repetidas, usa un campo trampa contra bots, restringe CORS al sitio oficial de GitHub Pages y protege el panel administrativo con `ADMIN_KEY` configurada únicamente en Neon.

No se deben subir archivos `.env`, claves administrativas ni cadenas `DATABASE_URL` al repositorio.

## Asignaturas por carrera

El esquema incluye la tabla `asignaturas` y el frontend está preparado para el catálogo oficial. Hasta disponer de las mallas curriculares verificadas, la pregunta “materia de su carrera que considera más difícil” acepta texto libre para evitar inventar asignaturas.
