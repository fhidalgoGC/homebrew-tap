---
name: fremi-story-closure
description: Completa/firma el `FW-10_closure.md` de una story — matriz de trazabilidad CA→SC→SDD→Design→test→código + DoD + sign-off. Doc snapshot. Precondiciones: FW-09_checkwork al 100% + `/fremi-story-verify` con verdict PASS o PASS WITH WARNINGS. Bumpea versión de la feature padre (Regla 17). DIFERENTE de `/fremi-story-closure-check` (que audita antes de firmar).
---

# /fremi-story-closure — Completar y firmar FW-10 (cierre de la story)

Completa el `FW-10_closure.md` con la matriz de trazabilidad final, checklist DoD marcado, evidencia (PR/commits), y sign-off con fecha. Este skill **firma el cierre**; `/fremi-story-closure-check` **audita antes de firmar**.

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

- `FW-09_checkwork.md` en 100%.
- Última corrida de `/fremi-story-verify` es PASS o PASS WITH WARNINGS (aceptadas).
- `/fremi-story-closure-check` no reportó gaps CRITICAL.
- Todos los tests verdes, coverage cumplido, sin bloqueos.

**No invocar** si alguna precondición falta — resolverla primero.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json` → `identifiers.workflow_doc.items[name=closure]`, `identifiers.criterion`, `identifiers.scenario`, `identifiers.test_case`.
- `config.yaml` → `phase_rules.closure`, `parent_bump_triggers.story_closes`.

### Paso 1 — Validar precondiciones DURAS
1. `FW-09_checkwork.md` % progreso = 100 (verificar en frontmatter o cuerpo).
2. Última entrada en `## Última corrida de verify` del checkwork = **PASS** o **PASS WITH WARNINGS** (aceptadas).
3. Sin bugs abiertos en `HU-XX/bugs/` (o transferidos a follow-up).
4. Si algo falla → abortar y reportar qué falta.

### Paso 2 — Cargar template
- `references/FW-10_closure-template.md`.

### Paso 3 — Rellenar la matriz de trazabilidad

Para cada CA-XXX del `FW-01_definition.md`:
1. Buscar el SC-XXX (BDD) que lo cubre.
2. Buscar la cláusula SDD que aterriza el contrato.
3. Buscar la sección de Design (FW-06) que la implementa.
4. Buscar el TC-XXX del TDD que la verifica.
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
   - Requirements nuevos → **MINOR** de `FT-XX/spec.md` (living, cuando exista).
   - Requirements modificados → **MAJOR** de `FT-XX/spec.md`.
   - ADRs nuevos → **MINOR** de `FT-XX/decisions.md`.
   - Sólo aclaró supuestos → **PATCH** de `FT-XX/definition.md`.

2. Bumpear la(s) versión(es) del padre:
   - Leer frontmatter del(los) archivo(s) del padre.
   - Bumpear según análisis.
   - Actualizar `last_updated` y agregar entry al `## Changelog` del padre:
     ```
     - **v<nueva>** — YYYY-MM-DD — HU-YY cierra: <resumen>. [origen: HU-YY_<slug>]
     ```

3. Rellenar `ancestor.version_at_closure` en el frontmatter del `FW-10_closure.md` con la versión FINAL del padre.

### Paso 7 — Sign-off y reportar
- Escribir fecha de cierre, persona/agente que firma, próxima story si aplica.
- Marcar estado del closure como CERRADO.
- Guardar.
- Reportar al usuario:
  - CA-XXX cubiertos (X/N).
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

- Template: [`references/FW-10_closure-template.md`](references/FW-10_closure-template.md).
- Skill `/fremi-story-closure-check` — auditar ANTES de firmar.
- Skill `/fremi-story-verify` — corrida final que precede el closure.
- `config.yaml → phase_rules.closure`, `parent_bump_triggers.story_closes`.
- `~/.fremi/framework/rules/workflow.md` → Regla 11 (closure obligatorio para DONE), Regla 17 (bump del padre).
