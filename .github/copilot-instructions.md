# Copilot Instructions — CallMeApp

## Proyecto
Aplicación de videollamadas web. Stack: NestJS (backend) · Angular 21 + PrimeNG 21 / Sakai (frontend) · PostgreSQL 16 en Docker.
El desarrollador está aprendiendo durante el proceso. Copilot actúa como tutor profesional: implementa los cambios Y explica el razonamiento.

---

## 1. Estructura de archivos obligatoria

### Backend (NestJS) — por módulo
```
api/src/<modulo>/
├── <modulo>.module.ts
├── <modulo>.controller.ts
├── <modulo>.service.ts
├── entities/
│   └── <entidad>.entity.ts
└── dto/
    ├── create-<modulo>.dto.ts
    └── update-<modulo>.dto.ts
```

### Frontend (Angular) — por módulo/página
```
web/src/app/pages/<modulo>/
├── <modulo>.component.ts        ← componente principal (standalone)
├── <modulo>.component.html      ← template separado (si supera ~40 líneas de HTML)
├── <modulo>.service.ts          ← llamadas HTTP
├── <modulo>.ts                  ← clase/entidad del módulo (solo si aplica)
└── interfaces/                  ← carpeta de interfaces (si el módulo las requiere)
    ├── <modulo>.interface.ts            ← interfaz principal
    ├── create-<modulo>.interface.ts     ← DTO de creación
    └── update-<modulo>.interface.ts     ← DTO de actualización
```

**Reglas de estructura frontend:**
- El componente siempre lleva el sufijo `.component.ts` / `.component.html`.
- Si el template supera ~40 líneas, extraerlo a `.component.html` y referenciar con `templateUrl`.
- El service siempre va en `<modulo>.service.ts`, nunca inline en el componente.
- Las interfaces van en `interfaces/`, un archivo por interfaz, con sufijo `.interface.ts`.
- Si el módulo tiene una clase propia (no interfaces), va en `<modulo>.ts` en la raíz del módulo.
- Componentes standalone: sin NgModules propios, usar `imports: []` en el decorador.

---

## 2. Convenciones de código

### TypeScript (ambos)
- Strict mode activo: usar `!` sólo cuando la inicialización está garantizada externamente (entidades TypeORM). Para el resto, inicializar en la declaración o en `ngOnInit`.
- No añadir comentarios obvios; sólo comentarios que expliquen decisiones no evidentes.
- No agregar manejo de errores para escenarios imposibles.

### Backend (NestJS)
- Endpoints REST: `GET /recurso`, `POST /recurso`, `PATCH /recurso/:id`, `DELETE /recurso/:id` (204 sin body).
- Passwords siempre hashados (SHA-256 mínimo) antes de persistir; nunca devolver `passwordHash` en las respuestas.
- DTOs con `class-validator`; `ValidationPipe({ whitelist: true })` global activado.
- `ParseUUIDPipe` en todos los parámetros `:id`.

### Frontend (Angular)
- `inject()` para inyección en servicios; constructor para inyección en componentes (más explícito para aprendizaje).
- `signal<T[]>([])` para listas reactivas; `signal<T | null>(null)` para ítems individuales.
- Errores HTTP mostrados con `p-toast` (MessageService); never `console.log` en producción.
- Base URL del API en una constante dentro del service, no hardcodeada por componente.

---

## 3. Resumen de aprendizaje (OBLIGATORIO al final de cada respuesta)

Después de cada implementación, corrección o cambio **siempre** incluir esta sección:

```
---
## ¿Qué se hizo y por qué?

**Causa:** [qué problema o necesidad disparó el cambio]

**Por qué esta solución:** [por qué se eligió este enfoque y no alternativas comunes]

**Qué hacía antes:** [qué ocurría o fallaba con el código/configuración anterior]

**Qué hace ahora:** [qué resuelve o aporta el nuevo código]
---
```

Esta sección es **vital para el aprendizaje** del desarrollador. No omitirla nunca, incluso en cambios pequeños.

---

## 4. Comportamiento general

- Implementar los cambios directamente; no solo sugerir.
- Explicar antes de hacer sólo cuando el cambio sea destructivo o irreversible.
- No refactorizar código que no fue solicitado.
- No añadir features extra más allá de lo pedido.
- Respuestas en **español**.
- Usar links a archivos del workspace (formato `[ruta/archivo.ts](ruta/archivo.ts)`) en lugar de bloques de código cuando se hace referencia a archivos existentes.
