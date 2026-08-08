---
name: fremi-reverse-enabler
description: Reconstruye los 4 docs de un enabler (EN-01..EN-04) a partir de infra/tooling ya montado (IaC, scripts, config de deploys, packages instalados). Modo default `--transparent` (Regla 26); `--stealth` disponible como override explícito. Aplica Regla 17. Usar cuando existe infraestructura o fundación técnica sin haber creado el enabler formal.
---

# /fremi-reverse-enabler — Ingeniería inversa de un enabler

Reconstruye la cadena de 4 docs (EN-01..EN-04) de un enabler a partir de:
- Infra as Code ya deployada (Terraform, CDK, Serverless).
- Scripts de setup / migration ya corridos.
- Dependencies instaladas en `package.json` / `pyproject.toml`.
- Docs sueltos de setup / provisioning.

**Precondición conceptual**: existe infraestructura o fundación técnica funcionando pero no hay `EN-XX_*/EN-01..04.md`.

## Sintaxis

```
/fremi-reverse-enabler <nombre> [--scope global|feature|story] [--parent FT-XX | FT-XX/HU-YY]
                          [--stealth|--transparent] [--dry-run]
```

- `<nombre>`: slug del enabler (ej: `chromium-layer-build`, `redis-queue-setup`).
- `--scope`: dónde vive el enabler (default: global).
- `--parent`: obligatorio si scope no es global.

## Cuándo invocarlo

- Existe infra (Lambda layer, DB, cache, queue) provisionada pero no hay docs.
- Se hizo un setup técnico habilitador sin seguir el flow del enabler.
- Se está migrando fundación legacy al framework.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml`, `config.enabler.yaml`.

### Paso 1 — Identificar el enabler

Preguntar:
- ¿Qué **capacidad técnica** habilita? (ej: "generar PDFs en Lambda")
- ¿Qué **archivos de infra/tooling** implementan esta capacidad? (paths)
- ¿Qué **features/stories** dependen de esta capacidad?

### Paso 2 — Escanear artifacts

```
📂 IaC / Config:
   - serverless.yml, cdk/*.ts, terraform/*.tf, Dockerfile, .github/workflows/*
   - Identificar recursos declarados (Lambda layers, DBs, buckets, IAM).

📦 Dependencies:
   - package.json / pyproject.toml — libs instaladas específicas del enabler.

📜 Scripts:
   - scripts/ — comandos de setup, seed, deploy.

🌐 Git history:
   - Commits del setup inicial del enabler.
```

### Paso 3 — Determinar scope y ubicación

Según `--scope`:
- **Global**: `docs/works/enablers/EN-XX_<nombre>/`.
- **Feature**: `docs/works/features/FT-XX/enablers/EN-XX_<nombre>/`.
- **Story**: `docs/works/features/FT-XX/user-stories/HU-YY/enablers/EN-XX_<nombre>/`.

Calcular próximo `EN-XX` **global al proyecto** (buscar en todos los scopes).

### Paso 4 — Inferir contenido de los 4 docs

#### `EN-01_definition.md`
- **Qué habilita**: derivar de recursos IaC + libs instaladas + descripción del usuario.
- **Vinculaciones**: features/stories que declaran dependencia (leer los definition.md de features/stories para menciones).
- **Criterios técnicos**: enumerar recursos IaC verificables (existe el layer, la DB responde ping, el bucket tiene X permisos).

#### `EN-02_design.md`
- **Tecnologías + librerías**: del IaC y package.json.
- **Estructura**: paths de archivos de infra.
- **Firmas TS reales**: si hay wrappers en `src/lib/` — extraerlos.
- **ADRs**: buscar decisiones documentadas en commits o docs sueltos. Si hay bifurcaciones evidentes → sugerir generar ADR ahora (`--transparent` recomendado en este caso).

#### `EN-03_plan.md`
- **Tasks T-XXX**: reconstruir de commits git (uno por commit significativo).
- **Criterios verificables**: comandos que verifican cada task (ej: `aws lambda get-layer-version`, `psql <db> -c "select 1"`).
- **Estados**: todos `[x]` (el enabler ya está montado).

#### `EN-04_closure.md`
- **Qué quedó habilitado**: derivar de EN-01.
- **Features/stories desbloqueadas**: enumerar.
- **Evidencia**: PR/commits del setup + comandos con exit 0.
- **Sign-off**: fecha del último commit del setup (con `--from-git-history`) o fecha actual.

### Paso 5 — Aplicar Regla 17

- Snapshots `v1.0.0`, `ancestor.version_at_creation` = versión del padre según scope.
- `--stealth` o `--transparent`.

### Paso 6 — Bumpear padre (Regla 17)

Consultar `parent_bump_triggers.enabler_closes`:
- Global → bumpear `product/plan.md` MINOR.
- Feature → bumpear `FT-XX/definition.md`.
- Story → bumpear `HU-YY/FW-01_definition.md` PATCH.

### Paso 7 — Reportar

```
▶ Enabler reconstruido: EN-XX_<nombre>
▶ Scope: global | feature | story
▶ Ubicación: <path>

▶ Docs creados: EN-01..EN-04 firmados.
▶ Padre bumpeado: <path>: vA.B.C → vA.B.(C+1)

▶ Advertencias:
  ⚠ EN-02 design puede tener bifurcaciones históricas sin ADR — revisar
  ⚠ EN-03 tasks reconstruidas de commits — criterios verificables pueden requerir ajuste
  ⚠ Vinculaciones inferidas — validar que features/stories realmente dependen
```

## Advertencias

- **Bifurcaciones históricas sin ADR**: al montar el enabler pudo haber decisiones técnicas con 2+ caminos evaluados. Sin registro, el skill sugiere generar ADRs "retroactivos" pero deben marcarse claramente.
- **IaC descriptivo vs prescriptivo**: el IaC muestra el estado final, no las alternativas consideradas.

## Anti-patrones

- ❌ Reverse un enabler nuevo — usar `/fremi-enabler` + sub-skills normales.
- ❌ Firmar `EN-04` sin validar que la capacidad realmente funciona (correr los criterios).
- ❌ Inferir vinculaciones "porque parece" — validar con las features/stories.

## Referencias

- README del concepto: [`../README.md`](../README.md).
- Skills del flow normal: [`/fremi-enabler`](../../artifacts/enabler/SKILL.md) + sub-skills.
- Regla 17 (versionado).
