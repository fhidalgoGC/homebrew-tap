---
version: 1.0.0
created: 2026-08-11
last_updated: 2026-08-11
doc_type: snapshot
ancestor:
  id: reverse-extra
  version_at_creation: null
---

# Flujo — Skill REVERSE-EXTRA (`/fremi-reverse-extra`)

> **Config operativa:** [`workflow.yaml`](./workflow.yaml) — fuente de verdad de la secuencia de reconstrucción.
> **Invocación / documentación:** [`SKILL.md`](./SKILL.md).
> **Flujo canónico reverse:** [`~/.fremi/framework/reverse-engineering/flow.md`](../flow.md) — las 6 fases genéricas. Este skill las instancia para trabajo extra ya aplicado.

Este documento describe la **narrativa del flujo** que el skill atraviesa cuando corre. Complementa `SKILL.md` (invocación, sintaxis) y `workflow.yaml` (secuencia machine-readable).

---

## Contexto: por qué reverse-extra existe

`extra/` no tiene skills de forward. No existe `/fremi-extra-new` ni `/fremi-pipeline-extra`. Reverse-extra es **la única forma programática de crear un `EX-NN`** — sea trabajo reciente que se registró tarde o trabajo histórico que se regulariza.

La razón: los extras son por definición trabajo **fuera del flujo lineal** (R14). No tienen ciclo spec-driven, no tienen BDD, no tienen TDD. Su "forward" es documentar mientras se hace; su "reverse" es documentar lo que ya se hizo. El skill unifica ambos casos.

---

## Qué hace el skill

Reconstruye **1 archivo** (`{extra.filename}`, típicamente `EX-NN_<slug>.md`) a partir de commits y archivos de trabajo de tooling / scripts / IaC / metodología ya aplicados sin haberse registrado.

**Casos típicos:**
- Migración de runtime (Node 18 → 24) sin EX-NN.
- Mejora a skills o hooks del framework sin registro.
- Refactor de naming de archivos sin cambio de comportamiento.
- Setup de tooling de CI/CD sin haberse planificado como enabler.

**Termina con el doc firmado, sin bump de padre (extra no tiene padre estructural), y con un reporte de validación de cohesión y R14.** No modifica el código.

---

## Diferencia con reverse-enabler

| Criterio | reverse-extra | reverse-enabler |
|---|---|---|
| ¿Habilita capacidad futura para features/stories? | NO | SÍ |
| ¿Tiene comportamiento user-facing? | NO | Indirecto (habilita) |
| ¿Tiene scope (global/feature/story)? | NO — siempre global | SÍ |
| ¿Dispara bump de padre? | NO | SÍ |
| ¿Cuántos docs produce? | 1 (`EX-NN`) | 4 (`EN-01..04`) |
| Regla que lo define | R14 | R15 |

Si hay dudas sobre cuál usar → stop event `r14_boundary_ambiguous`.

---

## Arco narrativo

### 1. Descubrimiento — los commits del trabajo

El skill arranca identificando los commits y archivos del trabajo a documentar. El usuario puede proveer SHA directos, o el skill busca en `git log` por paths de archivos relevantes.

Escanea en este orden:
1. `git log <archivos> --oneline` → commits, fechas, mensajes, autores.
2. `git diff <base_commit>..<HEAD> -- <archivos>` → qué se cambió específicamente.
3. Tipo de archivos afectados: config / script / doc / test / build.
4. PR descriptions o notas del usuario (contexto adicional).

**Validación de cohesión al descubrir**: antes de arrancar la inferencia, el skill verifica que el conjunto de commits y archivos representa un **concepto cohesivo**. Si mezcla conceptos no relacionados → stop event `cohesion_mixed`.

### 2. Inferencia — de los commits al doc

Con los commits y el diff, el skill mapea cada fragmento a una sección del `EX-NN`:

| Fragmento del trabajo | Sección del doc |
|---|---|
| Mensajes de commits + descripción del usuario | `what-was-done`: resumen ejecutivo (2-5 líneas) |
| Tipo de archivos (tooling/refactor/metodología) | `why-not-feature-story-task`: justificación R14 |
| Diff acumulado — archivos con cambios específicos | `concrete-changes`: lista de archivos con qué cambió |
| Tests que pasaron / comandos de build en commits | `validation`: comandos que verifican el cambio |
| ADRs referenciados, stories tocadas indirectamente | `linkages` (condicional) |
| Comentarios en commits / PR discussions | `notes-learnings` (condicional) |

**La sección `why-not-feature-story-task` es crítica (R14)**: debe contener una justificación sustantiva de por qué el trabajo está fuera del flujo lineal. Ejemplos válidos:
- "Refactor sin cambio de comportamiento (R9) — no habilita capacidad futura."
- "Mejora al tooling de build — sin criterios de aceptación user-facing."
- "Migración de versión de runtime — cambio de infraestructura, no de funcionalidad."

Señales de alerta que indican que NO es extra:
- El trabajo habilitó una capacidad futura (features dependen de él) → puede ser enabler (R15).
- El trabajo cambió comportamiento user-facing → puede ser story/feature.

Si hay señales de alerta → stop event `r14_boundary_ambiguous`.

### 3. Preguntas dirigidas — gaps no inferibles (Regla 27)

El skill pregunta al usuario los gaps que los commits no revelan:

- **Concepto cohesivo** — si los mensajes de commits no lo dejan claro: "¿Qué concepto representa este trabajo?"
- **Justificación R14** — si el tipo de archivos es ambiguo: "¿Por qué no es feature/story/enabler?"
- **Validación** — si no hay comandos de verificación en los commits: "¿Cómo verificás que el cambio funciona?"
- **Gotchas** — si hay comentarios de alerta en commits o PRs: ¿hay learnings que documentar?

**Validación de cohesión activa**: si el usuario confirma que el trabajo mezcla conceptos distintos, el skill recomienda crear múltiples `EX-NN` y puede ejecutarse varias veces. La recomendación de múltiples docs se reporta al final.

### 4. Timestamps y linaje (Regla 30)

El skill infiere fechas del trabajo via `git log`:

```bash
# Fecha del primer commit (created)
git log --format="%ai" -- <archivos> | tail -1

# Fecha del último commit (last_updated)
git log -1 --format="%ai" -- <archivos>
```

**Frontmatter del doc generado (extra):**
```yaml
version: 1.0.0
created: <fecha del primer commit>
last_updated: <fecha del último commit>
doc_type: snapshot
ancestor:
  id: global
  version_at_creation: null       # sin padre estructural
  version_at_closure: null        # no dispara bumps de padre
reverse_engineered: true          # modo transparent
reverse_engineered_at: 2026-08-11
reverse_engineered_source: git-history+commits
reverse_engineered_confidence: 0.80
```

Extra no tiene padre estructural: `ancestor.version_at_creation: null` y no se disparan bumps de padre. A diferencia de story, feature, enabler y bug, el `EX-NN` no bumpea ningún doc al firmarse.

Si no hay `.git`: pedir fechas al usuario o usar "hoy" con `confidence: 0.3`.

### 5. Escritura + R14 activo

Con toda la información, el skill escribe el `EX-NN_<slug>.md`:

**Modo `--transparent` (default):** frontmatter con bloque `reverse_engineered.*` completo.

**Modo `--stealth` (override explícito):** sin bloque `reverse_engineered.*`.

**La sección `why-not-feature-story-task` siempre se escribe con contenido sustantivo** (R14). No se acepta "porque se hizo así". Debe mencionar explícitamente qué tipo de trabajo es y por qué no cae en el flujo lineal.

Las secciones `linkages` y `notes-learnings` son condicionales: se incluyen sólo si hay ADRs relacionados, stories tocadas indirectamente, o gotchas detectados.

**Sin bump de padre**: extra no tiene padre estructural. No se bumpea ningún doc al firmar el `EX-NN`.

---

## Stop events — dónde pausa el skill

Ver `workflow.yaml → stop_events` para el detalle machine-readable. Resumen narrativo:

1. **`cohesion_mixed`** — los commits mezclan conceptos no relacionados. Presentar grupos detectados y preguntar si crear múltiples EX-NN.
2. **`r14_boundary_ambiguous`** — el trabajo tiene señales de ser enabler o story/feature. Presentar criterios de distinción y pedir confirmación al usuario.
3. **`concept_not_clear`** — los commits no revelan el concepto cohesivo. Preguntar al usuario directamente.
4. **`git_history_missing`** — no hay `.git` o commits identificables. Pedir fechas manualmente.
5. **`validation_commands_missing`** — no se pueden inferir comandos de validación. Preguntar al usuario.
6. **`r14_force_extra_needed`** — el trabajo parece ser feature/story/enabler pero el usuario usó reverse-extra de todas formas. Alertar y pedir confirmación.

**Anti-patrones — el skill NO debe hacer:**
- Forzar un solo EX-NN que mezcla conceptos no relacionados.
- Inventar la justificación `why-not-feature-story-task`.
- Silenciar R14 cuando el trabajo parece ser enabler/story.
- Usar este skill para trabajo en curso — documentar mientras se hace.

---

## Reporte final (obligatorio)

Al terminar exitosamente, el skill reporta:

```
▶ Extra reconstruido: EX-NN_<slug>.md
▶ Concepto: <título>
▶ Commits: <hash1>..<hash2> — N archivos afectados

▶ Docs creados:
  - EX-NN_<slug>.md  v1.0.0  ancestor: global (sin padre estructural)

▶ Confidence global: 0.XX

▶ Gaps declarados (R27):
  ⚠ <gap 1> — [resuelto | TBD]
  ...

▶ ADRs relacionados/sugeridos: <lista o "ninguno">

▶ Padre bumpeado: N/A (extra no tiene padre estructural)

▶ Modo: transparent (default) | stealth (override explícito)

▶ Revisión humana recomendada (R28):
  · Validar que el trabajo genuinamente es fuera-del-flujo (R14).
  · Si hay señales de que era enabler → considerar migrar el doc.
  · Cohesión: <si se detectaron conceptos mixtos → EX-NN adicionales recomendados>
```

---

## Precondiciones duras (abortan el skill)

Ver `workflow.yaml → hard_preconditions` — resumen:

- **R24** — Framework instalado.
- `methodology.core.yaml` + `config.extra.yaml` existen y parsean.
- **R25** — El trabajo está mergeado a main o en versión confirmada.
- Commits o archivos identificables del trabajo.
- **R14** — El trabajo parece genuinamente fuera del flujo lineal (validación previa).

Si el trabajo es claramente una feature/story/enabler → abortar y sugerir el skill correcto.

---

## Reglas activas durante la ejecución

- **R25** — Precondición dura: trabajo mergeado.
- **R26** — Default transparent.
- **R27** — Preguntas dirigidas para concepto, justificación R14, validación.
- **R28** — Justificación `why-not-feature-story-task` requiere revisión humana.
- **R30** — R17 con timestamps inferidos. Extra no dispara bump de padres.
- **R31** — No se usa para trabajo en curso.
- **R32** — Ratio reverse/forward como señal de salud.
- **R17** — Frontmatter versionado. `ancestor.id: global`, `version_at_creation: null`.
- **R14** — CRÍTICA: extra sólo aplica a trabajo fuera del flujo lineal. Sección `why-not-feature-story-task` obligatoria.
- **R9** — Refactor sin cambio de comportamiento: caso típico de extra.
- **R3b** — Si el trabajo implicó decisiones técnicas con bifurcaciones → ADR retroactivo.
- **R24** — Framework instalado.

---

## Estado final después del skill

El extra queda reconstruido con su doc firmado:

```
docs/works/extra/
└── EX-NN_<slug>.md    (v1.0.0, snapshot — con justificación R14 en why-not-feature-story-task)
```

El repo queda **indistinguible del que dejaría la documentación contemporánea** en términos de completitud de artifacts, excepto por el bloque `reverse_engineered.*` en el frontmatter (en modo `transparent`).

**No hay "próximo paso natural"** en el sentido de story/enabler — el extra está cerrado. Si la revisión humana detecta que era enabler o story, el siguiente paso es migrar el doc usando el skill correspondiente.

---

## Referencias

- Config operativa: [`workflow.yaml`](./workflow.yaml)
- Invocación: [`SKILL.md`](./SKILL.md)
- **Regla 14**: [`~/.fremi/framework/artifacts/extra/rules/extra-doc.md`](../../artifacts/extra/rules/extra-doc.md)
- Reglas reverse (R25-R32): [`~/.fremi/framework/reverse-engineering/rules/reverse.md`](../rules/reverse.md)
- Flujo canónico reverse: [`~/.fremi/framework/reverse-engineering/flow.md`](../flow.md)
- Artifact extra: [`~/.fremi/framework/artifacts/extra/`](../../artifacts/extra/)
- Config reverse global: [`~/.fremi/framework/settings/config.reverse.core.yaml`](../../settings/config.reverse.core.yaml)
- Regla 9 (refactor sin cambio de comportamiento): [`~/.fremi/framework/artifacts/story/rules/bug-fix-and-refactor.md`](../../artifacts/story/rules/bug-fix-and-refactor.md)

---

## Changelog

- **v1.0.0** — 2026-08-11 — Creación inicial: flujo narrativo del skill reverse-extra con R14 como concepto central.
