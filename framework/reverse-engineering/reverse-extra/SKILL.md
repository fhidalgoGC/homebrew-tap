---
name: fremi-reverse-extra
description: Reconstruye un archivo `EX-NN_<slug>.md` a partir de trabajo de tooling/scripts/IaC ya aplicado. Modo default `--transparent` (Regla 26); `--stealth` disponible como override explícito. Aplica Regla 17 (versionado global de EX-NN). Usar cuando existen cambios de tooling/refactor/metodología sin haber creado el archivo `EX-NN` correspondiente.
---

# /fremi-reverse-extra — Ingeniería inversa de un extra

Reconstruye un `EX-NN_<slug>.md` a partir de cambios de tooling / scripts / IaC / metodología ya aplicados sin haberse registrado como `EX-NN`.

**Precondición conceptual**: existe trabajo mergeado en el repo (fuera del flow lineal feature/story) pero no hay `docs/works/extra/EX-NN_<slug>.md`.

## Sintaxis

```
/fremi-reverse-extra <slug> [--stealth|--transparent] [--dry-run] [--from-git-history]
```

## Cuándo invocarlo

- Existen cambios de tooling / build / IaC / scripts / refactor en git log pero no hay `EX-NN`.
- Se hizo una mejora a la metodología (nuevos skills, hooks, rules) sin registrarla.
- Se aplicaron múltiples fixes sueltos que ameritan agruparse en un concepto cohesivo.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json`, `config.extra.yaml`.

### Paso 1 — Identificar el trabajo

Preguntar:
- ¿Qué **concepto cohesivo** representa este trabajo? (ej: "mejoras al generador Postman", "migración a Node 24")
- ¿Qué **commits** o **PRs** son parte del trabajo?
- ¿Qué **archivos** cambiaron?

**Validar cohesión**: si el trabajo mezcla conceptos distintos → sugerir crear múltiples `EX-NN` (uno por concepto).

### Paso 2 — Determinar próximo EX-NN

- `ls docs/works/extra/ | grep EX- | sort | tail -1` → +1.
- Numeración global al proyecto.

### Paso 3 — Escanear artifacts

```
📜 Git:
   git log <archivos> --oneline
   → fechas, mensajes, autores.

📂 Diff acumulado:
   git diff <base_commit>..<HEAD> -- <archivos>
   → qué se cambió específicamente.

📁 Archivos afectados:
   Enumerar paths + tipo (config / script / doc / test / build).
```

### Paso 4 — Inferir secciones del EX-NN

#### `what-was-done`
- Resumen ejecutivo de los cambios (2-5 líneas).
- Inferir de mensajes de commits + descripción del usuario.

#### `why-not-feature-story-task`
- Justificación de por qué esto NO es feature/story/task.
- Ej: "cambio de tooling sin habilitar capacidad futura", "refactor sin cambio de comportamiento", "mejora a metodología".
- **Regla 14** aplica: si el trabajo SÍ era spec-driven, el reverse es incorrecto → mejor usar `/fremi-reverse-story` o `/fremi-reverse-enabler`.

#### `concrete-changes`
- Lista de archivos afectados con qué cambió en cada uno.
- Extraer del diff.

#### `validation`
- Comandos que verifican que el cambio funciona.
- Inferir de:
  - Tests que se agregaron/pasaron con el cambio.
  - Comandos de build/lint que ahora exit 0.
  - Verificación manual (documentar cómo).

#### `linkages` (condicional)
- ADRs relacionados (si el cambio implementa/afecta una decisión existente).
- Stories/features tocadas indirectamente.
- Otros EX-NN relacionados.

#### `notes-learnings` (condicional)
- Gotchas descubiertos durante el trabajo (inferir de comentarios en commits o PR discussions).

### Paso 5 — Aplicar Regla 17

Los `EX-NN` son snapshots con `ancestor.id: global` (sin padre estructural):
- `version: 1.0.0`.
- `created`: fecha del primer commit (con `--from-git-history`).
- `last_updated`: fecha del último commit.
- `ancestor.version_at_creation: null` (no aplica).
- `ancestor.version_at_closure: null` (no dispara bumps de padre).

Modo `--stealth` o `--transparent`.

### Paso 6 — Reportar

```
▶ EX-NN reconstruido: EX-XX_<slug>.md
▶ Concepto: <título>
▶ Commits: <hash1>..<hash2> — N archivos

▶ Contenido:
  - what-was-done: ✅
  - why-not-feature-story-task: ✅ (requiere revisión — ver advertencia)
  - concrete-changes: ✅ (N archivos)
  - validation: ✅
  - linkages: (condicional) — N ADRs relacionados detectados
  - notes-learnings: (condicional)

▶ Advertencias:
  ⚠ Validar que el trabajo SÍ es fuera-del-flujo (Regla 14).
     Si es spec-driven → usar /fremi-reverse-story o /fremi-reverse-enabler.
  ⚠ Cohesión: si los commits mezclan conceptos → considerar múltiples EX-NN.
```

## Advertencias

### ⚠️ La justificación `why-not-feature-story-task` es crítica

Reverse-extra sólo aplica si el trabajo genuinamente **está fuera del flujo lineal**. Si el trabajo tenía comportamiento user-facing, era spec-driven — reverse-story es el correcto. Si habilitaba capacidad futura → reverse-enabler.

Regla 14 anti-patrón: usar `extra/` como excusa para saltar el flujo.

### ⚠️ Cohesión de un archivo por concepto

Si los commits mezclan varios trabajos no-relacionados → NO forzar un solo EX-NN. Crear múltiples con `/fremi-reverse-extra` invocado varias veces.

## Anti-patrones

- ❌ Usar reverse-extra para trabajo que era feature/story/enabler.
- ❌ Fusionar múltiples conceptos no-relacionados en un solo EX-NN.
- ❌ Reverse-extra rutinario — el equipo debería registrar `EX-NN` cuando hace el trabajo, no después.

## Referencias

- README del concepto: [`../README.md`](../README.md).
- Regla 14 (trabajo fuera del flujo) — [`../../rules/workflow.md`](../../rules/workflow.md).
- Regla 17 (versionado).
- `config.extra.yaml` — declara que extra NO tiene skills; reverse-extra es la única forma programática de crear un EX-NN.
