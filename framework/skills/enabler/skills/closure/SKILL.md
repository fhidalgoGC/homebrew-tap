---
name: fremi-enabler-closure
description: Completa y firma el `EN-04_closure.md` del enabler — sign-off + evidencia + qué quedó habilitado + bump del padre. Doc snapshot. Precondición: todas las tasks del EN-03 en `[x]`.
---

# /fremi-enabler-closure — Firmar EN-04 (cierre del enabler)

Completa el `EN-04_closure.md` del enabler y **bumpea el padre** según scope (Regla 17).

**Rol del doc**: garantía formal de que el enabler está DONE. Sin firmar, el enabler sigue abierto.

## Sintaxis

```
/fremi-enabler-closure <EN-ID>
```

## Cuándo invocarlo

- Todas las tasks del `EN-03_plan.md` en `[x]`.
- La capacidad técnica declarada en EN-01 está verificada (los criterios técnicos pasan).

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json`.
- `config.yaml` → `phase_rules.closure`, `parent_bump_triggers.enabler_closes`.
- `config.enabler.yaml` → `scopes.<placement>` para saber cuál es el padre.

### Paso 1 — Validar precondiciones DURAS

1. Todas las tasks de EN-03 marcadas `[x]` (o `[~]` descartadas con motivo).
2. Cada task cumplió su criterio verificable (Regla 7b).
3. Los criterios técnicos de EN-01 están verificados (comandos ejecutables, recursos existen, etc.).

Si falla alguno → abortar y reportar.

### Paso 2 — Cargar template
- `references/EN-04_closure-template.md`.

### Paso 3 — Rellenar closure

- **Qué quedó habilitado**: capacidad concreta activada.
- **Features/stories desbloqueadas**: link a los artifacts que ahora pueden avanzar.
- **Evidencia**: PR, commits, deploy, comandos con exit 0.
- **Sign-off**: fecha, agente/persona.

### Paso 4 — BUMP del padre (Regla 17 obligatorio)

Según `config.yaml → parent_bump_triggers.enabler_closes`:
- Placement global → bumpear `product/plan.md` MINOR (registra capacidad habilitada).
- Placement feature → bumpear `FT-XX/definition.md` MINOR o PATCH según impacto.
- Placement story → bumpear `HU-YY/FW-01_definition.md` PATCH (informativo).

Actualizar changelog del padre con entry apuntando al enabler cerrado.

Rellenar `ancestor.version_at_closure` en el frontmatter del EN-04.

### Paso 5 — Reportar
- Enabler cerrado.
- Padre bumpeado a versión X.
- Features/stories desbloqueadas.

## Validaciones
- Precondiciones duras cumplidas.
- Padre bumpeado según trigger.
- `ancestor.version_at_closure` rellenado.

## Anti-patrones
- ❌ Firmar con tasks pendientes.
- ❌ Firmar sin bumpear el padre (viola Regla 17).
- ❌ Criterios técnicos "verificados manualmente" sin evidencia.

## Referencias
- Template: [`references/EN-04_closure-template.md`](references/EN-04_closure-template.md).
- `config.yaml → phase_rules.closure`, `parent_bump_triggers.enabler_closes`.
- Regla 11 (closure obligatorio), Regla 17 (bump del padre).
