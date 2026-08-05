# Template — `data.md` (para uso de `/fremi-import-template`)

Doc de investigación #3 de 7. Persistencia, storage, colas, servicios externos. **Genérico** — aplicar a cualquier stack. Foco: mecánica de acceso a datos, no schemas específicos del dominio de negocio.

```markdown
# Data — <nombre del template>

## Bases de datos detectadas

| Tipo | Motor | Cliente/ORM | Rol |
|---|---|---|---|
| SQL relacional | <PostgreSQL | MySQL | SQLite | ...> | <Prisma | Drizzle | SQLAlchemy | GORM | ...> | <primary | analytics | ...> |
| NoSQL documento | <MongoDB | DynamoDB | ...> | <mongoose | AWS SDK v3 | ...> | |
| Key-value / caché | <Redis | ElastiCache | ...> | <ioredis | ...> | |

Ninguna → "N/A — el template no persiste datos."

## Storage / Object stores

- <S3, GCS, Azure Blob, filesystem local, etc.> con path/rutas típicas.

## Cachés / colas

- <Redis, SQS, SNS, RabbitMQ, Kafka, EventBridge, ...>

## Email / notificaciones

- <SES, SendGrid, Mailgun, servicio interno, ...>

## Servicio a servicio (RPC / eventos)

- <HTTP directo, gRPC, event bus, Lambda→Lambda invoke, ...>

## Variables de entorno relacionadas con datos

Extraídas de `.env.example` o del código:

| Variable | Rol | Ejemplo (sin secretos) |
|---|---|---|
| `DATABASE_URL` | conexión DB primaria | `postgres://user@host:5432/db` |
| `REDIS_HOST` | cache | `redis://...` |
| ... | ... | ... |

## Schemas / migrations encontrados

- Path: <`prisma/schema.prisma` | `migrations/*.sql` | `models/*.py` | ...>
- Convención de nombres: <ej: `V001__init.sql`, `202606-add-users.sql`, ...>
- Runner: <`prisma migrate deploy` | `alembic upgrade head` | ...>

## Patrones de acceso a datos

<Describir el patrón usado por el template: repositorio por Lambda, DAO, Active Record, Query Builder, raw SQL, etc. Referenciar archivos del template.>

- <patrón>: <path de ejemplo>
- <patrón>: <path de ejemplo>

## Convenciones de naming de archivos por driver

- <ej: Modelos Dynamo terminan en `.model.ts`, migraciones Mongo en `migrations/mongo/*.js`, ...>
- (Referenciar rule del template si existe, ej: `backend-specific-naming.mdc`.)

## Observaciones del template sobre datos

<Cualquier decisión de arquitectura de datos que el template encarne y quiera resaltarse: separación de read/write, connection pooling, timeouts, retries, etc.>
```
