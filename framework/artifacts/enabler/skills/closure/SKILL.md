---
name: fremi-enabler-closure
description: Completa y firma el `{enabler.closure}` del enabler — sign-off + evidencia + qué quedó habilitado + bump del padre. Doc snapshot. Precondición: todas las tasks del step `plan` en `[x]`.
---

> **Nota sobre identificadores:** los prefijos concretos (carpeta enabler, carpeta feature) salen de `~/.fremi/framework/settings/methodology.core.yaml`. Este archivo usa step IDs semánticos (`definition`, `design`, `plan`, `closure`) y conceptos. Ver `.claude/rules/no-hardcoded-identifiers.md`.

# /fremi-enabler-closure — Firmar el doc `closure` del enabler

Completa el `{enabler.closure}` del enabler y **bumpea el padre** según scope (Regla 17).

**Rol del doc**: garantía formal de que el enabler está DONE. Sin firmar, el enabler sigue abierto.

## Sintaxis

```
/fremi-enabler-closure <ENABLER_ID>
```

## Cuándo invocarlo

- Todas las tasks del `{enabler.plan}` en `[x]`.
- La capacidad técnica declarada en el step `definition` está verificada (los criterios técnicos pasan).

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml`.
- `config.yaml` → `phase_rules.closure`, `parent_bump_triggers.enabler_closes`.
- `config.enabler.yaml` → `scopes.<placement>` para saber cuál es el padre.

### Paso 1 — Validar precondiciones DURAS

1. Todas las tasks del step `plan` marcadas `[x]` (o `[~]` descartadas con motivo).
2. Cada task cumplió su criterio verificable (Regla 7b).
3. Los criterios técnicos del step `definition` están verificados (comandos ejecutables, recursos existen, etc.).

Si falla alguno → abortar y reportar.

### Paso 2 — Cargar template
- `references/{enabler.closure}-template.md`.

### Paso 3 — Rellenar closure

- **Qué quedó habilitado**: capacidad concreta activada.
- **Features/stories desbloqueadas**: link a los artifacts que ahora pueden avanzar.
- **Evidencia**: PR, commits, deploy, comandos con exit 0.
- **Sign-off**: fecha, agente/persona.

### Paso 4 — BUMP del padre (Regla 17 obligatorio)

Según `config.yaml → parent_bump_triggers.enabler_closes`:
- Placement global → bumpear `product/plan.md` MINOR (registra capacidad habilitada).
- Placement feature → bumpear el doc `definition` de la carpeta feature MINOR o PATCH según impacto.
- Placement story → bumpear el `{workflow.definition}` de la story PATCH (informativo).

Actualizar changelog del padre con entry apuntando al enabler cerrado.

Rellenar `ancestor.version_at_closure` en el frontmatter del doc `closure`.

### Paso 5 — Reportar
- Enabler cerrado.
- Padre bumpeado a versión X.
- Features/stories desbloqueadas.

## Validaciones
- Precondiciones duras cumplidas.
- Padre bumpeado según trigger.
- `ancestor.version_at_closure` rellenado.

## Anti-patrones
- ❌ Firmar con tasks del step `plan` pendientes.
- ❌ Firmar sin bumpear el padre (viola Regla 17).
- ❌ Criterios técnicos "verificados manualmente" sin evidencia.

## Referencias
- Template: [`references/{enabler.closure}-template.md`](references/{enabler.closure}-template.md).
- `config.yaml → phase_rules.closure`, `parent_bump_triggers.enabler_closes`.
- Regla 11 (closure obligatorio), Regla 17 (bump del padre).
