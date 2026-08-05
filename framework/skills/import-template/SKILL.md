---
name: fremi-import-template
description: Importa un proyecto/fremi-tools externo como template del proyecto. Copia el código a /template/ (sibling de docs/) respetando .gitignore + exclusiones hardcoded (incluyen dirs de agentes como .claude/.cursor/.agent/.hermes — siempre se excluyen porque su contenido real vive en docs/). Política especial: .env Y .env.example SE COPIAN aunque el origen los ignore, para que el template incluya la configuración real (el usuario revisa secretos después). Genera 7 docs de investigación en docs/template/ (overview, stack, data, structure, patterns, implementation-guide, notes) con foco en estructura/tecnologías/paquetes/patrones + conocimiento aplicado (cómo escribir handlers, schemas, tests, middlewares siguiendo el patrón) — no en lógica de negocio. Usar cuando el usuario quiere traer un proyecto externo como referencia de "forma de trabajar".
---

# /fremi-import-template — Importar y analizar un template externo

Copia un proyecto externo a `/template/` (en la raíz del proyecto, sibling de `docs/`) y genera automáticamente un **paquete de investigación** en `docs/template/` que captura la **forma de trabajar del template importado**: tecnologías, paquetes, patrones, comandos, convenciones de naming, estructura de carpetas, **y código real extraído del template** mostrando cómo se escribe cada artefacto (handlers/funciones, schemas de validación, middlewares, tests unit + integration/e2e, repositorios, etc.).

## Propósito central (CRÍTICO — leer antes de aplicar el skill)

**Razón de ser del skill:** el usuario importa un template porque quiere **adoptar la forma de trabajar de ese template** en su proyecto destino. Por eso el output no puede ser sólo "qué tecnologías usa" — tiene que ser **conocimiento aplicado y suficientemente concreto para replicar el patrón**.

El doc `implementation-guide.md` es la pieza central que hace al skill útil: sin ese conocimiento aplicado, el usuario tendría que reinvertir tiempo leyendo el código del template para descubrir patrones. Con el doc, **tiene una guía directa** de cómo escribir cada artefacto siguiendo el mismo patrón.

> **Este skill debe funcionar para CUALQUIER template** — independiente del lenguaje (TypeScript / Python / Go / Java / Rust / etc.), del runtime (Lambda / contenedor / proceso largo / CLI), del dominio (backend / frontend / batch / ML / etc.). El skill **detecta la convención** del template y extrae los snippets reales desde archivos representativos. Si el template no sigue una convención reconocible o no provee algún tipo de artefacto, el skill deja `TODO: detectar manualmente` explícito en esa sección — pero **siempre intenta primero**.

### REGLA ESTRICTA — `docs/template/` es PURAMENTE descriptivo del template

**Los 7 docs generados en `docs/template/` describen ÚNICAMENTE el template importado.** Prohibido incluir:

- ❌ Comparaciones con el proyecto destino (nombre del repo, ADRs vigentes, features, user stories — **NADA del proyecto destino**).
- ❌ Detección de divergencias (`"Divergencia con ADR-001"`, `"Esto NO está en el proyecto destino"`).
- ❌ Sugerencias de "cómo aplicarlo a este proyecto" (`"Cuándo aplicarlo en este proyecto"`, `"Si <proyecto> necesita X, sumar Y"`).
- ❌ TODOs sobre adoptar/adaptar al proyecto destino.
- ❌ Cualquier referencia al **nombre del proyecto destino** o sus identificadores (FT-XX, HU-XX, init-XXX, ADR-XXX).
- ❌ Cualquier referencia a **user stories, features o iniciativas del usuario** (no nombrarlas, no usarlas como ejemplo, no cruzarlas contra el template).
- ❌ Cualquier "Lo que NO encarna este template" en términos del proyecto destino (lo que falta es una observación sobre el código del usuario, no sobre el template).

**Permitido (todo descriptivo del template):**

- ✅ Stack tecnológico, paquetes, versiones, runtime.
- ✅ Estructura de carpetas y convenciones de naming del template.
- ✅ Patrones de implementación del template (con código real extraído).
- ✅ Comandos npm / scripts del template.
- ✅ Gotchas del propio código del template (cosas raras, decisiones implícitas internas).
- ✅ TODOs/FIXME/XXX **extraídos del código del template original** (no inventados por nosotros).
- ✅ Lo que el template NO contiene como observación interna (ej: "no tiene tests de propiedad", "no usa observabilidad estructurada") — sin enlazarlo a "lo que el proyecto destino necesita".

**Si el usuario quiere comparaciones con su proyecto** (qué se alinea, qué diverge, qué adoptar, qué adaptar), eso es **trabajo de ADRs / sync-check / docs de feature/story** — NO va en `docs/template/`.

> Esta regla aplica retroactivamente: si una invocación previa generó docs con comparaciones, en la próxima ejecución del skill con `--clean-docs` (o regeneración manual) se reemplazan por las versiones puramente descriptivas.

> **Importante:** este skill **no registra el template en `methodology.json`** ni promueve decisiones a ADRs. Eso se hace con otro skill aparte. Este sólo trae el código + escribe los MDs de investigación.

## Sintaxis

```
/fremi-import-template <ruta-origen> [--force]
```

- `<ruta-origen>`: ruta absoluta o relativa al directorio del template externo a copiar.
- `--force` (opcional): permite sobrescribir `/template/` si ya existe.

Si el usuario no pasa ruta → preguntársela.

## Cuándo invocarlo

- Usuario dice "traete el template de X", "importá este ejemplo de Lambda", "copiá esto como template", "hacé un análisis de este proyecto y traémoslo".
- El usuario menciona una ruta a un proyecto de referencia que quiere usar como base.

**No invocarlo si:**
- El usuario quiere arrancar de cero (sin template) — eso se resuelve con el flujo normal de feature/story.
- Quiere registrar un template ya importado en la metodología — eso es otro skill.

## Procedimiento

### Paso 0 — Validar entrada

1. Si no se pasó ruta → preguntarla.
2. Resolver la ruta a absoluta. Validar que existe y es directorio legible.
3. Validar que NO es la raíz del proyecto actual ni una subcarpeta de él (evitar loops).
4. Si `/template/` ya existe en raíz del proyecto:
   - Sin `--force` → abortar y avisar.
   - Con `--force` → avisar al usuario qué se va a borrar y pedir confirmación.

### Paso 1 — Construir la lista de exclusiones

Combinar en este orden:

1. **`.gitignore` del origen** (si existe). Parsear las reglas estándar de git.
2. **Lista hardcoded del skill — DIRECTORIOS siempre excluidos** (aunque el origen no las ignore):
   - **Build / runtime artifacts:** `node_modules/`, `dist/`, `build/`, `.aws-sam/`, `.serverless/`, `.terraform/`, `.next/`, `.nuxt/`, `coverage/`, `__pycache__/`, `.pytest_cache/`, `.venv/`, `venv/`
   - **VCS:** `.git/`
   - **IDE / editor:** `.idea/`, `.vscode/`
   - **Configuración de agentes (siempre excluida — el contenido real vive en `docs/`, lo que está acá son sólo symlinks/exposición):** `.claude/`, `.cursor/`, `.agent/`, `.hermes/`, `.windsurf/`, `.continue/`, `.aider/`
3. **Lista hardcoded del skill — ARCHIVOS siempre excluidos**:
   - `.DS_Store`, `Thumbs.db`, `*.log`, `*.pyc`
4. **`.env` y env files: SE COPIAN** (regla 4a — política explícita del proyecto):
   - Aunque estén en `.gitignore` del origen, **se copian** `.env`, `.env.local`, `.env.development`, `.env.production`, `.env.staging`, etc.
   - **Justificación:** un template importado debe incluir la **configuración real** del origen para que el destino entienda qué vars necesita, con qué valores ejemplo, y qué estructura tienen. La utilidad del template depende de tener esa info.
   - **Riesgo asumido:** los `.env` pueden contener secretos. El skill **avisa explícitamente** al usuario en el reporte cuáles se copiaron, para que revise manualmente si hay credenciales que querer sacar antes de continuar.
   - `.env.example` también se copia (no necesita override — ya es público por convención).
5. **Symlinks**: NO seguir ni copiar (avisar cada uno detectado en el reporte).
6. **Archivos grandes** (> 5 MB): avisar uno por uno y pedir confirmación antes de copiar.

> **Resumen del orden de precedencia:**
>
> 1. Excluido por `.gitignore` del origen → se excluye, **salvo excepción de `.env*`** (regla 4a).
> 2. Excluido por listas hardcoded de directorios o archivos → se excluye sin excepción.
> 3. `.env*` → **siempre se copia** (override consciente — política 4a).
> 4. Symlinks → no se copian (se reportan).
> 5. Archivo > 5 MB → preguntar.

### Paso 2 — Copiar a `/template/`

Resolver la raíz del proyecto actual (donde vive `docs/` y `CLAUDE.md`). Crear `/template/` ahí.

Copiar recursivamente del origen al destino respetando las exclusiones del Paso 1.

Mantener: permisos de archivos, estructura de carpetas idéntica al origen.

Llevar contadores:
- `copied_count` — archivos copiados
- `skipped_gitignore` — archivos saltados por `.gitignore` del origen
- `skipped_hardcoded` — archivos saltados por lista hardcoded
- `skipped_symlinks` — symlinks no seguidos
- `skipped_large` — archivos grandes que el usuario decidió no copiar
- `total_bytes` — tamaño total copiado

### Paso 3 — Analizar el código copiado

Analizar el contenido de `/template/` recién copiado. Para cada categoría, detectar lo que se pueda y dejar `TODO:` cuando no haya señal clara (no inventar).

#### 3.1 — Lenguaje / runtime
Detectar leyendo:
- `package.json` → `engines.node`, `type` (module/commonjs).
- `Dockerfile` → instrucción `FROM`.
- `runtime.txt`, `.python-version`, `.nvmrc`, `.node-version`.
- `pyproject.toml`, `requirements.txt`.
- `go.mod`, `Cargo.toml`, `pom.xml`, `build.gradle*`.
- Extensión predominante de archivos en el árbol.

#### 3.2 — Framework / IaC de Lambda
Detectar archivos:
- `template.yaml` / `template.yml` → AWS SAM.
- `serverless.yml` / `serverless.ts` → Serverless Framework.
- `cdk.json`, `bin/*.ts` con `aws-cdk-lib` → AWS CDK.
- `*.tf`, `*.tf.json` → Terraform.
- `samconfig.toml` → SAM config.

#### 3.3 — Frameworks web / handlers
Detectar deps en `package.json` / `requirements.txt`:
- `express`, `fastify`, `koa`, `hono`, `@aws-lambda-powertools/*`.
- `flask`, `fastapi`, `aws-lambda-powertools` (python).
- Archivos con nombre `handler.*`, `lambda.*`, `index.*`.

#### 3.4 — BD / Storage
Detectar deps:
- SQL: `pg`, `mysql2`, `mysql`, `sqlite3`, `better-sqlite3`, `psycopg2`, `mysqlclient`, `aiomysql`.
- NoSQL: `mongodb`, `mongoose`, `@aws-sdk/client-dynamodb`, `dynamodb-toolbox`, `redis`, `ioredis`, `cassandra-driver`.
- ORMs: `prisma`, `typeorm`, `sequelize`, `drizzle-orm`, `sqlalchemy`, `tortoise-orm`.
- S3 / Storage: `@aws-sdk/client-s3`, `aws-sdk`, `boto3`.
- Búsqueda: `@opensearch-project/*`, `@elastic/elasticsearch`, `algoliasearch`.

Detectar env vars en `template.yaml`, `serverless.yml`, `.env.example`, `.env.sample`:
- `DATABASE_URL`, `DB_HOST`, `DB_NAME`, `MONGO_URI`, `REDIS_URL`, `DYNAMODB_TABLE*`, `S3_BUCKET*`, `OPENSEARCH_*`, etc.

Buscar archivos de schema/migrations: `prisma/schema.prisma`, `migrations/`, `alembic/`, `db/schema.rb`, `*.sql`.

#### 3.5 — Test / Lint
- Test: `jest.config.*`, `vitest.config.*`, `mocha`, `pytest.ini`, `pyproject.toml [tool.pytest]`, `cypress.config.*`, `playwright.config.*`.
- Lint/format: `.eslintrc*`, `.prettierrc*`, `biome.json`, `tslint.json`, `ruff.toml`, `.flake8`, `black` config.
- TypeScript: `tsconfig*.json`.

#### 3.6 — CI/CD
- `.github/workflows/*.yml` (listar los workflows).
- `.gitlab-ci.yml`, `bitbucket-pipelines.yml`, `circle.yml`/`.circleci/`, `azure-pipelines.yml`.
- `Makefile`, `Taskfile.yml`, scripts `npm run *` en `package.json`.

#### 3.7 — Otras libs notables
- Headless browsers: `puppeteer`, `@sparticuz/chromium`, `playwright`, `chrome-aws-lambda`.
- GraphQL: `graphql`, `@apollo/*`, `graphql-request`, `urql`.
- Observabilidad: `pino`, `winston`, `@aws-lambda-powertools/logger`, `@opentelemetry/*`, `datadog-lambda-js`.
- Validation: `zod`, `joi`, `yup`, `ajv`, `pydantic`.

### Paso 4 — Escribir los docs de investigación

Crear `docs/template/` y escribir los 7 archivos. **Cada uno se instancia a partir de un template canónico** que vive en `references/` de este skill. El skill carga cada template, lo puebla leyendo el proyecto importado y donde no haya señal clara deja `TODO: (qué falta detectar)` explícito.

```
docs/template/
├── overview.md              — qué es, propósito, cuándo aplicarlo
├── stack.md                 — runtime, libs principales, IaC
├── data.md                  — BDs / storage detectados + env vars relevantes
├── structure.md             — árbol explicado de /template/
├── patterns.md              — tecnologías, paquetes, patrones, comandos, forma de implementar (alto nivel)
├── implementation-guide.md  — CONOCIMIENTO APLICADO: cómo escribir un handler, schema Zod, middleware, test unit/e2e, repositorio… con ejemplos de código REAL extraídos del template
└── notes.md                 — gotchas, divergencias con ADRs vigentes, TODOs
```

**Mapping doc ↔ template canónico**:

| Doc a generar | Template canónico |
|---|---|
| `docs/template/overview.md` | [`references/overview-template.md`](references/overview-template.md) |
| `docs/template/stack.md` | [`references/stack-template.md`](references/stack-template.md) |
| `docs/template/data.md` | [`references/data-template.md`](references/data-template.md) |
| `docs/template/structure.md` | [`references/structure-template.md`](references/structure-template.md) |
| `docs/template/patterns.md` | [`references/patterns-template.md`](references/patterns-template.md) |
| `docs/template/implementation-guide.md` | [`references/implementation-guide-template.md`](references/implementation-guide-template.md) |
| `docs/template/notes.md` | [`references/notes-template.md`](references/notes-template.md) |

**Regla dura**: no inventar estructura. Si un template necesita evolucionar (secciones nuevas, orden distinto), editar el archivo en `references/` — no la instancia generada. Los 7 templates son **genéricos al stack** — funcionan igual con Node.js, Python, Go, Java, etc.; el skill adapta los snippets al lenguaje detectado.

> **Dos docs principales (jerárquicos):**
> 1. **`patterns.md`** — vista panorámica de **qué patrones existen** (stack, estructura de carpetas, naming, comandos, lista de patrones aplicados).
> 2. **`implementation-guide.md`** — vista detallada de **cómo escribir código siguiendo esos patrones**. Para cada artefacto del template (handler, schema Zod, middleware, unit test, e2e test, repositorio), incluye: anatomía + ejemplo de código real (extraído leyendo archivos representativos del template importado) + reglas de uso + variantes comunes + comando para correrlo.
>
> Los otros 5 son contexto complementario (qué es / qué BDs / qué archivos / qué hay raro).
>
### Generación de `implementation-guide.md` — procedimiento GENÉRICO (cualquier stack)

> **Regla rectora:** este doc debe permitir que un agente o humano **replique el patrón del template** en código nuevo, sin tener que leer todo el origen para inferir las convenciones. Por eso el contenido es **estructural y aplicado**, no narrativo.

**Pasos del skill al generar este doc** (independiente del lenguaje/stack del template):

1. **Detectar la "unidad de trabajo"** del template (qué es lo que el template está pensado para producir):
   - **Lambda/serverless:** "una Lambda HTTP" o "un handler".
   - **API HTTP en contenedor:** "un endpoint" o "una ruta".
   - **CLI:** "un comando".
   - **Batch / worker:** "un job" o "un consumer".
   - **Frontend:** "un componente" o "una página".
   - **ML:** "un pipeline" o "un experimento".
   - **Librería:** "un módulo público".

2. **Mapear los artefactos típicos** que componen una unidad de trabajo en ese stack. Cuáles son los artefactos depende del template; ejemplos universales:

   | Artefacto universal | Manifestación típica |
   |---|---|
   | **Entrypoint** | `index.ts`, `main.py`, `main.go`, `cli.rs`, `app.ts`, archivo con función `main`/`run`. |
   | **Routing / dispatching** | Route table, decoradores `@app.get(...)`, registro de comandos. |
   | **Validación de input** | Schemas Zod / Pydantic / Marshmallow / json-schema / struct tags. |
   | **Middleware / interceptor / decorator** | Funciones envoltorio que validan o transforman antes de la lógica. |
   | **Handler / función / endpoint** | El código que ejecuta el caso de uso. |
   | **Acceso a datos / repositorio** | Cliente DB, ORM, factory, adapter. |
   | **Tests unit** | Vitest, Jest, Pytest, Go test, etc. |
   | **Tests integration / e2e** | Runner propio o framework estándar (Cypress, Playwright, requests integrados). |
   | **Manejo de errores** | Tipos de error canónicos, codes, mapping a respuestas. |
   | **Build / lifecycle commands** | npm scripts, Makefile, Taskfile, Justfile, poetry scripts, cargo commands. |

3. **Encontrar un archivo representativo por artefacto** explorando el template:
   - Buscar archivos con nombres convencionales (`handler.*`, `*.handler.*`, `*.test.*`, `*.spec.*`, `*.controller.*`, `*.service.*`, `*.middleware.*`, `*.schema.*`, `*.repository.*`, `routes.*`, `cli.*`).
   - Si hay varias instancias del mismo artefacto, elegir **una representativa** (la primera por nombre alfabético o la más simple).
   - Si no se detecta un artefacto del template, anotar `TODO: el template no provee ejemplo de <artefacto> — detectar manualmente o no aplica.`.

4. **Extraer snippets REALES** (no inventar):
   - Copiar 30-80 líneas del archivo elegido (suficiente para mostrar el patrón completo).
   - Si el archivo es muy largo, copiar las secciones clave + indicar elisiones con `// ...` y comentarios.
   - Reemplazar nombres específicos del dominio del template por placeholders genéricos NO — **mantener nombres reales** del template. La idea es mostrar cómo se escribe en concreto, no abstraerlo. (Los placeholders abstractos van en la sección "Reglas de uso" después del ejemplo.)
   - **NO transformar el código**: si el template está en Python, el snippet va en Python.

5. **Acompañar cada snippet con:**
   - **Anatomía** (qué partes tiene el artefacto y qué hace cada parte).
   - **Reglas de uso** (qué respetar cuando se escribe uno nuevo: naming, exports, returns, side effects permitidos/prohibidos).
   - **Variantes comunes** (ej: GET vs POST handlers, schema con `Optional` vs requerido, test sync vs async).
   - **Comandos relacionados** (cómo correrlo, cómo testearlo, cómo deployarlo).

6. **Secciones obligatorias del doc generado** (siempre presentes, aunque el template no provea ejemplo — en cuyo caso `TODO`):
   - Anatomía completa de **una unidad de trabajo** (en la nomenclatura del template).
   - **Entrypoint / wiring** del template.
   - **Handler / función principal** (cómo se escribe una unidad de trabajo).
   - **Schema de validación / validation gate** (cómo se valida input).
   - **Middleware / interceptor** (cómo se transforman/validan los inputs antes de la lógica).
   - **Test unit** (cómo se escribe un unit test, con mocking del template).
   - **Test integration / e2e** (cómo se escribe e2e, con runner del template).
   - **Acceso a datos / repositorio** (si aplica).
   - **Manejo de errores** (tipos canónicos del template + shape de respuesta de error).
   - **Cómo crear una nueva unidad de trabajo paso a paso** (síntesis aplicada).
   - **Cheatsheet de comandos** (build / test / lint / deploy).
   - **Checklist final de "feature completa"** (lo que tiene que existir para considerar terminada una unidad de trabajo).

7. **Si el template tiene skill propio para crear estas unidades** (ej: el skill `create-lambda-http-function` de docsModels) → **mencionarlo explícitamente** en la sección "Cómo crear una nueva unidad" como "atajo automatizado".

> **Ejemplo de aplicación de este procedimiento:** ver `docs/template/implementation-guide.md` generado para la importación de `docsModels` (Lambda + TS + Zod + Vitest). Para un template Python/FastAPI/Pydantic/Pytest, el mismo procedimiento generaría snippets equivalentes en Python — la estructura del doc no cambia, sólo los snippets adaptan al lenguaje y al stack.

> **Anti-patrones a evitar al generar este doc:**
> - ❌ Inventar código que no existe en el template (siempre extraer de archivos reales).
> - ❌ Documentar lógica de negocio del origen (ej: "el endpoint POST /databases crea una BD"). El foco es el patrón, no el dominio.
> - ❌ Generalizar demasiado (ej: "el handler retorna una respuesta"). El ejemplo debe ser concreto y copiable.
> - ❌ Saltarse secciones sin marcar `TODO`. Si no hay ejemplo de algo, escribir `TODO: no detectado — investigar manualmente`.
> - ❌ Mezclar conocimiento de docsModels con otros templates anteriores. Cada `implementation-guide.md` es para **ESE** template, recién importado.

### Paso 5 — Reportar al usuario

Imprimir en chat:

```
✅ Template importado desde <ruta-origen>

📁 Copiado a: /template/
   - Archivos copiados: <copied_count>
   - Tamaño total: <total_bytes formateado>
   - Saltados por .gitignore del origen: <skipped_gitignore>
   - Saltados por reglas del skill: <skipped_hardcoded>
   - Symlinks no copiados: <skipped_symlinks>  (si > 0, listar)
   - Archivos grandes saltados: <skipped_large>  (si > 0, listar)
   - Carpetas de agentes excluidas (siempre): .claude, .cursor, .agent, .hermes (las que existan)

🔐 .env y env files COPIADOS (política del skill): <lista de archivos>
   ⚠️ REVISAR MANUALMENTE si contienen credenciales que NO querés en este repo.
   Sugerencia: abrir cada uno, sanitizar valores sensibles si aplica, y considerar
   agregarlos al .gitignore del proyecto destino si todavía no están.

🔬 Análisis generado en: docs/template/
   - Lenguaje/runtime detectado: <resumen>
   - IaC detectado: <resumen>
   - BDs/Storage detectados: <resumen>
   - Archivos generados: overview.md, stack.md, data.md, structure.md, patterns.md, implementation-guide.md, notes.md

⭐ DOCS PRINCIPALES:
   1. docs/template/patterns.md             — visión panorámica del template (qué patrones existen).
   2. docs/template/implementation-guide.md — conocimiento aplicado (cómo escribir handlers, schemas Zod, middlewares, tests siguiendo los patrones, con código real extraído del template).

   Los otros 5 (overview, stack, data, structure, notes) son contexto complementario.

⚠️  TODOs pendientes: <N>  (revisar los TODO: en los 7 docs antes de avanzar)

Próximos pasos sugeridos:
1. Leer /docs/template/patterns.md — visión panorámica del template.
2. Leer /docs/template/implementation-guide.md — para entender cómo escribir cada cosa siguiendo el patrón (handler, schema, test, middleware).
3. Cruzar con /docs/template/notes.md — divergencias detectadas con ADRs vigentes.
4. Sanear /template/.env y env files (sacar credenciales sensibles si no aplican).
4. Si el stack del template aplica al proyecto → registrar ADRs (Regla 3b) o referenciar los ADRs existentes.
5. Si querés registrar este template en methodology.json → ejecutar el skill correspondiente (otro skill, aparte).
```

## Validaciones

- **Ruta origen no existe / no es directorio** → abortar y avisar.
- **Ruta origen es la raíz del proyecto actual o subcarpeta de él** → abortar (evitar loop infinito).
- **`/template/` ya existe sin `--force`** → abortar y avisar al usuario qué hacer (`--force` para sobreescribir, o mover lo existente).
- **`/template/` ya existe con `--force`** → confirmar con el usuario antes de borrar, listar qué contiene actualmente.
- **`docs/template/` ya existe** → preguntar al usuario si sobreescribir cada MD o sólo los que faltan.
- **No se encontró `.gitignore` en el origen** → continuar con sólo la lista hardcoded, avisar al usuario.
- **`.env` con valores no vacíos** → **copiar** (regla 4a — política del skill) pero **avisar explícitamente** en el reporte que se copió y recomendar revisión manual.
- **Archivos > 5 MB, archivos binarios grandes** → pedir confirmación antes de copiar.
- **El skill no debe MODIFICAR archivos del proyecto fuera de `/template/` y `docs/template/`.** No tocar `methodology.json`, no crear ADRs, no tocar `docs/works/`.

---

## Template — `overview.md`

```markdown
# Template importado: <nombre derivado del path origen>

**Origen:** `<ruta absoluta del origen>`
**Importado:** YYYY-MM-DD
**Importado por:** `/fremi-import-template`

## Qué es este template
(Descripción en 2-3 líneas de qué hace el código que está en `/template/`. Inferir del README del origen si existe, o del entrypoint principal. Si no hay señal clara → TODO.)

## Propósito declarado
(Si el origen tiene README con propósito explícito, copiarlo o resumirlo. Si no → TODO: completar manualmente.)

## Cuándo aplicarlo en este proyecto
TODO: el usuario decide. Sugerencias automáticas en base al análisis:
- (ej: "es un Lambda con Puppeteer → aplica a stories de generación de PDFs si confirman ADR-002")
- (ej: "usa SAM → aplica si el proyecto confirma ADR-003")

## Estado
- [x] Código copiado a `/template/`
- [x] Análisis automático en `docs/template/`
- [ ] TODOs resueltos
- [ ] Decisiones del template alineadas con ADRs del proyecto
- [ ] Registrado en `methodology.json` (otro skill)
```

## Template — `stack.md`

```markdown
# Stack técnico del template

## Lenguaje / runtime
- (lo detectado en 3.1, ej: "Node.js 20 (declarado en `package.json` engines)")
- TODO si no se pudo determinar.

## Framework / IaC de Lambda
- (lo detectado en 3.2, ej: "AWS SAM (`template.yaml` encontrado)")

## Frameworks web / handlers
- (lo detectado en 3.3)

## Test
- (lo detectado en 3.5)

## Lint / Format
- (lo detectado en 3.5)

## CI/CD
- (lo detectado en 3.6, listando los workflows con sus paths)

## Otras libs notables
- (lo detectado en 3.7, agrupadas por categoría: headless / GraphQL / observabilidad / validation)

## Versiones clave (de `package.json` / `requirements.txt` / equivalente)
| Dep | Versión |
|---|---|
| ... | ... |

## Alineación con ADRs del proyecto
- (cruzar con `docs/works/product/decisions.md`: si el template usa Node 20 y existe ADR-001 que aprueba Node 20 → "Cumple ADR-001". Si usa otra cosa → "Divergencia con ADR-001 — requiere decisión.")
```

## Template — `data.md`

```markdown
# Datos: BDs y storage del template

## Bases de datos detectadas
| Tipo | Driver / ORM | Evidencia |
|---|---|---|
| (SQL/NoSQL/etc.) | (lib usada) | (archivo donde aparece) |

## Storage / Object stores
- (S3, GCS, etc. detectados)

## Cachés / colas
- (Redis, SQS, Kafka, etc. detectados)

## Variables de entorno relacionadas
(extraídas de `template.yaml`, `serverless.yml`, `.env.example`, etc.)

| Variable | Origen | Propósito inferido |
|---|---|---|
| `DATABASE_URL` | `.env.example` | SQL connection string |
| ... | ... | ... |

## Schemas / migrations encontrados
- (paths a `schema.prisma`, `migrations/`, `*.sql`, etc.)

## TODO de revisión manual
- [ ] Confirmar que ningún driver detectado contradice los ADRs del proyecto.
- [ ] Si hay env vars que parecen secretos en `.env` (no `.env.example`), confirmar que NO se copiaron.
- [ ] Validar que la BD usada (si la hay) es compatible con `docs/works/product/definition.md`.
```

## Template — `structure.md`

```markdown
# Estructura de `/template/`

## Árbol (nivel 2-3)
```
template/
├── ...
├── ...
└── ...
```

## Entrypoints detectados
- `<path>` — (ej: "handler de Lambda en `src/handler.ts`")
- (si hay varios, listar todos)

## Carpetas clave
| Carpeta | Propósito inferido |
|---|---|
| `src/` | (código principal) |
| `tests/` | (tests, si los hay) |
| ... | ... |

## Archivos de configuración importantes
- `package.json` — deps + scripts
- `template.yaml` / `serverless.yml` / `cdk.json` — IaC
- `tsconfig.json` — config TS
- (otros relevantes)

## Lo que NO se copió y por qué
- `node_modules/` — excluido por regla hardcoded del skill.
- `.claude/`, `.cursor/`, `.agent/`, `.hermes/` — excluidos siempre (contenido real vive en `docs/`).
- (otros, según `.gitignore` del origen o decisión del usuario)
```

## Template — `patterns.md`

```markdown
# Estructura del proyecto, tecnologías y patrones de implementación

> **Foco:** estructura, tecnologías, paquetes, patrones, comandos, naming, forma de implementar. **No** lógica de negocio del origen.

## 1. Stack tecnológico
### Lenguaje y runtime
| Pieza | Versión | Rol |
|---|---|---|
| <ej: TypeScript> | <ej: ^5.8> | <ej: Lenguaje principal> |

### IaC / despliegue
| Pieza | Versión | Rol |
|---|---|---|

### Validación y datos
### AWS SDK / cliente cloud (si aplica)
### Auth / crypto
### Testing

## 2. Estructura de carpetas
### Raíz
\`\`\`
.
├── (árbol comentado del top-level)
\`\`\`

### `src/` (si existe)
### `docs/` (si existe)

## 3. Convenciones de naming
### Archivos
| Patrón | Significado |
|---|---|

### Carpetas
### Endpoints / paths (si aplica)
### Path aliases (TS / build / test)

## 4. Patrones de implementación
> Listar cada patrón detectado con explicación breve. Ejemplos típicos:
- **Una Lambda por tabla** (o equivalente)
- **Handler por endpoint**
- **Middleware layering** (global / per-module / per-handler)
- **Validation gates con <Zod/Joi/Yup>**
- **Repository pattern** (con o sin abstracción multi-driver)
- **Workflow editorial** (draft → promote, etc.)
- **Soft delete**
- **Reserved-key strip** en PATCH
- **POST reserve-id + PUT complete**
- **Build sync** (regeneración de bloques en config)
- **Tests adyacentes** vs **tests centralizados**
- **E2E en modos múltiples** (local vs deployed)

## 5. Comandos npm (lifecycle)
> Listar agrupando: quality / typecheck, tests, build, deploy, database lifecycle, generators, etc.

## 6. Tooling de scaffolding (skills/automatización del origen)
> Si el origen tiene skills/hooks/generadores propios, listarlos con propósito.

## 7. Tooling de scripts (en `scripts/` u homólogo)
> Listar cada script con su propósito.

## 8. Forma de implementar una nueva <unidad> (síntesis del patrón)
> Pasos típicos para crear/agregar lo que el template está pensado para producir.

## 9. Convención multi-agente (si aplica)
> Cómo expone el template skills/rules a Claude, Cursor, etc. (típicamente symlinks desde `.claude/.cursor/` a `docs/`).

## 10. Configuración de bundle (si aplica)
> Decisiones de bundling: ESM/CJS, target, format, externals.

## 11. Lo que NO encarna este template
> Piezas que faltarían al adoptarlo para el proyecto destino — alimenta los ADRs futuros.

## 12. TL;DR
> Resumen de 5-10 bullets ultra-condensado de cómo está construido el template.
```

## Template — `notes.md`

```markdown
# Notas, gotchas y decisiones implícitas detectadas

## Decisiones técnicas que el template **encarna** (candidatas a ADR)
- (ej: "Usa `@sparticuz/chromium` en vez de `chrome-aws-lambda` → si se adopta este template, requiere ADR aceptado para esto. Verificar ADR-002.")
- (ej: "Define el handler como ES module — implica `type: module` en `package.json`.")

## Convenciones detectadas
- Naming de archivos: (ej: kebab-case, camelCase, etc.)
- Estructura: (ej: arquitectura por capas / por features / flat)
- Estilo de tests: (ej: cada handler tiene `*.test.ts` adyacente)

## Gotchas / cosas raras
- (ej: "El `template.yaml` setea `MemorySize: 2048` — alto, posiblemente por Chromium. Confirmar si aplica.")
- (ej: "Hay un script `postinstall` que descarga binarios — revisar antes de usar.")
- (ej: "Usa una variable `NODE_OPTIONS` que puede chocar con runtime de Lambda.")

## Archivos sospechosos / a revisar
- (ej: ".env.example tiene placeholders pero parece declarar secretos — confirmar")
- (ej: "Hay un archivo `secrets.json` que se copió — revisar si tiene contenido sensible")

## Posibles divergencias con la metodología del proyecto
(Cruzar con `docs/frmwk/rules/workflow.md`, `docs/works/product/decisions.md`, `docs/frmwk/settings/methodology.json`.)
- (ej: "El template asume CommonJS pero ADR-001 acepta Node 20 — puede usar ESM. No es divergencia técnica pero el código del template está en CommonJS.")

## TODOs explícitos del template original
(grep de `TODO:` / `FIXME:` / `XXX:` en el código copiado, listar archivo:línea)
```
