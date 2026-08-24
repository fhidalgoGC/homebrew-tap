---
name: fremi-story-closure
description: Completa/firma el doc `closure` (`{workflow.closure}`) de una story — matriz de trazabilidad criterio→escenario→sdd→design→test→código + DoD + sign-off. Doc snapshot. Precondiciones: {workflow.checkwork} al 100% + `/fremi-story-verify` con verdict PASS o PASS WITH WARNINGS. Bumpea versión de la feature padre (Regla 17). DIFERENTE de `/fremi-story-closure-check` (que audita antes de firmar).
---

> **Nota sobre identificadores:** los prefijos concretos (feature, story, workflow doc, criterios de aceptación, escenarios, test cases) salen de `~/.fremi/framework/settings/methodology.core.yaml`. Este archivo usa step IDs semánticos. Ver `.claude/rules/no-hardcoded-identifiers.md`.

# /fremi-story-closure — Completar y firmar el doc `closure` (cierre de la story)

Completa el `{workflow.closure}` con la matriz de trazabilidad final, checklist DoD marcado, evidencia (PR/commits), y sign-off con fecha. Este skill **firma el cierre**; `/fremi-story-closure-check` **audita antes de firmar**.

**Rol del doc**: garantía formal de que la story está DONE. Sin este archivo firmado, la story sigue abierta (Regla 11).

**Diferencia con `/fremi-story-closure-check`**:
- `/fremi-story-closure` — **completa y firma** el archivo (llena matriz + DoD + sign-off).
- `/fremi-story-closure-check` — **audita** que el archivo esté completo y sin gaps antes de firmar.

Flujo típico: `/fremi-story-verify` PASS → `/fremi-story-closure-check` reporta OK → `/fremi-story-closure` firma.

## Sintaxis

```
/fremi-story-closure <FEATURE_ID> <STORY_ID>
```

## Cuándo invocarlo

- `{workflow.checkwork}` en 100%.
- Última corrida de `/fremi-story-verify` es PASS o PASS WITH WARNINGS (aceptadas).
- `/fremi-story-closure-check` no reportó gaps CRITICAL.
- Todos los tests verdes, coverage cumplido, sin bloqueos.

**No invocar** si alguna precondición falta — resolverla primero.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml` → `identifiers.workflow_doc.items[name=closure]`, `identifiers.criterion`, `identifiers.scenario`, `identifiers.test_case`.
- `config.yaml` → `phase_rules.closure`, `parent_bump_triggers.story_closes`.

### Paso 1 — Validar precondiciones DURAS
1. `{workflow.checkwork}` % progreso = 100 (verificar en frontmatter o cuerpo).
2. Última entrada en `## Última corrida de verify` del checkwork = **PASS** o **PASS WITH WARNINGS** (aceptadas).
3. Sin bugs abiertos en la carpeta `bugs/` de la story (o transferidos a follow-up).
4. Si algo falla → abortar y reportar qué falta.

### Paso 2 — Cargar template
- `references/{workflow.closure}-template.md`.

### Paso 3 — Rellenar la matriz de trazabilidad

Para cada criterio de aceptación del doc `definition` (`{workflow.definition}`):
1. Buscar el escenario BDD (doc `bdd`) que lo cubre.
2. Buscar la cláusula SDD (doc `sdd`) que aterriza el contrato.
3. Buscar la sección del doc `design` que la implementa.
4. Buscar el test case del doc `tdd` que la verifica.
5. Buscar el archivo de implementación (grep en codebase).
6. Marcar estado ✅ / 🟡 / ⬜.

Si algún casilla queda vacía → **abortar el closure** y reportar como gap (llamar `/fremi-story-closure-check` para detalle).

### Paso 4 — Rellenar checklist DoD
- Verificar los 12 items canónicos (nada fuera del scope, tests verdes, ADRs respetados, coverage OK, sync-back validado, etc.).
- Marcar cada uno `[x]` sólo si se cumple.

### Paso 5 — Registrar evidencia
- Link a PR(s).
- Hash de commits relevantes.
- Link a demo si aplica.
- Link a CI verde.

### Paso 6 — Versionado y BUMP del padre (Regla 17 — obligatorio)

Consultar `config.yaml → parent_bump_triggers.story_closes`:

1. Analizar qué agregó/modificó esta story vs. la feature padre:
   - Requirements nuevos → **MINOR** del doc `spec` de la feature (living, cuando exista).
   - Requirements modificados → **MAJOR** del doc `spec` de la feature.
   - ADRs nuevos → **MINOR** del doc `decisions` de la feature.
   - Sólo aclaró supuestos → **PATCH** del doc `definition` de la feature.

2. Bumpear la(s) versión(es) del padre:
   - Leer frontmatter del(los) archivo(s) del padre.
   - Bumpear según análisis.
   - Actualizar `last_updated` y agregar entry al `## Changelog` del padre:
     ```
     - **v<nueva>** — YYYY-MM-DD — HU-YY cierra: <resumen>. [origen: HU-YY_<slug>]
     ```

3. Rellenar `ancestor.version_at_closure` en el frontmatter del `{workflow.closure}` con la versión FINAL del padre.

### Paso 7 — Sign-off y reportar
- Escribir fecha de cierre, persona/agente que firma, próxima story si aplica.
- Marcar estado del closure como CERRADO.
- Guardar.
- Reportar al usuario:
  - Criterios de aceptación cubiertos (X/N).
  - Versión final del padre después del bump.
  - Sugerir siguiente: archivar la story o arrancar la siguiente (`/fremi-story`).

## Validaciones

- Precondiciones duras cumplidas (checkwork 100%, verify PASS/WARN, sin bugs abiertos).
- Matriz sin celdas vacías.
- DoD 100% marcado o con excepción justificada.
- Versión del padre bumpeada según `parent_bump_triggers.story_closes`.
- `ancestor.version_at_closure` rellenado.

## Anti-patrones

- ❌ Firmar closure con checkwork < 100% o verify FAIL — precondición violada.
- ❌ Firmar sin bumpear la feature padre (viola Regla 17).
- ❌ Rellenar DoD con `[x]` en items que no se cumplen — cierre falso.
- ❌ Reciclar closure de otra story — cada story tiene el suyo.
- ❌ Firmar con bugs abiertos sin transferirlos a follow-up explícito.

## Referencias

- Template: [`references/{workflow.closure}-template.md`](references/{workflow.closure}-template.md).
- Skill `/fremi-story-closure-check` — auditar ANTES de firmar.
- Skill `/fremi-story-verify` — corrida final que precede el closure.
- `config.yaml → phase_rules.closure`, `parent_bump_triggers.story_closes`.
- `~/.fremi/framework/rules/workflow.md` → Regla 11 (closure obligatorio para DONE), Regla 17 (bump del padre).
