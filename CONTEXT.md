# CallMeApp — Contexto del Proyecto

> Este archivo documenta el progreso del desarrollo sesión a sesión.
> Adjúntalo al inicio de cada conversación con GitHub Copilot para retomar el contexto.

---

## Descripción del Proyecto

Aplicación web que permite a dos usuarios realizar una **videollamada** en tiempo real.

### Stack tecnológico definido

| Capa | Tecnología |
|---|---|
| Frontend | Angular |
| Backend | NestJS |
| Base de datos | PostgreSQL |
| Infraestructura local | Docker / Docker Compose |

---

## Estructura del repositorio

```
callmeapp/
├── api/               ← Backend (NestJS) — aún vacío
│   └── scripts/       ← Scripts SQL que se ejecutan al inicializar la BD
├── web/               ← Frontend (Angular) — aún vacío
├── docker-compose.yml ← Define el contenedor de PostgreSQL
├── .env               ← Variables de entorno (no sube a Git)
├── .gitignore
└── CONTEXT.md         ← Este archivo
```

---

## Sesión 1 — Fecha: 25 Feb 2026

### Lo que se hizo

- Se explicó qué es Docker: imágenes, contenedores, volúmenes, port mapping y docker-compose.
- Se creó `docker-compose.yml` con el servicio de PostgreSQL.
- Se creó `.env` con las variables de conexión.
- Se creó `.gitignore` correctamente (excluye `.env` y `node_modules`).
- Se creó la carpeta `api/scripts/` con un `.gitkeep` para versionarla vacía.
- Se levantó el contenedor de PostgreSQL con `docker compose up -d`.
- Se verificó que el contenedor está **healthy** y corriendo en el puerto 5432.
- Se conectó DataGrip al contenedor de PostgreSQL correctamente.
- Se eliminó la advertencia del `version` obsoleto en `docker-compose.yml`.
- Se resolvió problema de autenticación Git (credenciales de otra cuenta `mariel-bo` en Windows Credential Manager).
- Se hizo el primer `git push` exitoso al repositorio.

### Decisiones técnicas tomadas

- Imagen PostgreSQL: `postgres:16-alpine` (liviana, suficiente para este proyecto)
- Nombre del contenedor: `callmeapp_postgres`
- Nombre del volumen: `callmeapp_postgres_data`
- Base de datos: `callmeapp_db`
- Usuario: `callmeapp_user`
- Puerto: `5432`

### Comandos útiles recordatorio

```bash
# Levantar contenedor
docker compose up -d

# Detener contenedor (datos se conservan)
docker compose down

# Ver estado del contenedor
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Conectarse a PostgreSQL desde terminal
docker exec -it callmeapp_postgres psql -U callmeapp_user -d callmeapp_db

# Ver logs
docker compose logs -f postgres
```

---

## Sesión 2 — Fecha: 2 Mar 2026

### Lo que se hizo

- Se discutió el diseño del esquema de la base de datos.
- Se identificaron las entidades principales de la aplicación.

### Entidades identificadas (pendiente de finalizar)

| Tabla | Propósito |
|---|---|
| `users` | Datos de los usuarios registrados |
| `call_sessions` | Historial de videollamadas |
| `refresh_tokens` | Tokens JWT para autenticación |

### Decisión de diseño PENDIENTE ⚠️

Definir el modelo de llamadas:
- **Opción A** — Sistema de contactos (como WhatsApp): los usuarios se agregan entre sí y solo pueden llamar a sus contactos. Requiere tabla `friendships`.
- **Opción B** — Sistema de sala/link (como Google Meet): se genera un código/link para compartir. Sin tabla de contactos.

> **Esta decisión define si se necesita una tabla adicional `friendships`.**

---

## Sesión 3 — Fecha: 1 Abr 2026

### Lo que se hizo

- Se discutió Supabase (plan gratuito pausa proyectos) → se descartó, se continúa con Docker local.
- Se inicializó el proyecto **NestJS** en `api/` con `nest new`.
- Se instalaron dependencias: `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/config`, `class-validator`, `class-transformer`, `@nestjs/mapped-types`.
- Se configuró **TypeORM** con `synchronize: true` (modo desarrollo) leyendo variables del `.env`.
- Se habilitó `ValidationPipe` global en `main.ts`.
- Se creó el módulo completo de **Users** (entidad, DTOs, servicio, controlador).
- Se creó el script SQL `api/scripts/V1__create_users_table.sql` con la tabla `users`, índices y trigger de `updated_at`.
- Se corrigió error `TS5103` eliminando `ignoreDeprecations: "6.0"` del `tsconfig.json`.
- Se corrigió error `TS2564` agregando el operador `!` en propiedades de entidades y DTOs.
- Se configuró `.vscode/settings.json` para asociar `.sql` a `pgsql` (evita falsos positivos de MSSQL).
- Se probó el CRUD completo de usuarios en Postman — funcionando correctamente en puerto **3800**.
- Se instaló el template **Sakai de PrimeNG** en `web/` (Angular 21 + PrimeNG 21).
- Se descargaron los assets del template (submódulo `sakai-assets`).
- Frontend corriendo en puerto **4444**.

### Endpoints del API Users

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/users` | Crear usuario |
| GET | `/users` | Listar todos |
| GET | `/users/:id` | Obtener uno por UUID |
| PATCH | `/users/:id` | Actualizar parcialmente |
| DELETE | `/users/:id` | Eliminar (204 No Content) |

### Decisiones técnicas tomadas

- Contraseña hasheada con SHA-256 en el servicio (bcrypt se implementará con auth)
- `passwordHash` nunca se devuelve en las respuestas de la API
- `synchronize: true` solo en desarrollo — se migrará a migraciones antes de producción
- Template Sakai assets copiados directamente (sin submódulo git) para simplificar
- Puertos: API=3800, Frontend=4444, PostgreSQL=5432

---

## Próximos pasos

- [ ] Crear vista CRUD de Users en el frontend (Angular + Sakai)
- [ ] Crear `UserService` en Angular con `HttpClient`
- [ ] Habilitar CORS en el backend para peticiones desde `localhost:4444`
- [ ] Conectar frontend ↔ backend (fullstack completo)
- [ ] Definir esquema completo de BD: `call_sessions`, `refresh_tokens`
- [ ] Implementar autenticación JWT
