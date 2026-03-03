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

## Próximos pasos

- [ ] Decidir modelo de llamadas (Opción A o B)
- [ ] Diseñar esquema completo de la BD
- [ ] Crear script SQL inicial en `api/scripts/`
- [ ] Inicializar proyecto NestJS en `api/`
- [ ] Inicializar proyecto Angular en `web/`
