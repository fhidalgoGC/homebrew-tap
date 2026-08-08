# Template — Bloque de ADR

> **Para qué:** estructura canónica de un ADR (Architecture Decision Record) que se anexa a `decisions.md` (producto o feature).
> **Usado por:** `/fremi-product-adr` / `/fremi-feature-adr` / `/fremi-story-adr`, Paso 4 (anexar al archivo).
> **Placeholders:** todo lo que esté entre `<...>` se reemplaza con valores reales antes de anexar. `{adr_id}` viene del Paso 2 del skill; `<fecha>` se completa con la fecha actual (`date +%Y-%m-%d`).
> **No editar a mano dentro del template** — para cambiar la estructura de los ADRs, editar este archivo y refrescar los ADRs existentes con un sweep manual.

---

```markdown
---

## {adr_id} — <título corto>

**Estado:** Aceptada
**Fecha:** <YYYY-MM-DD>
**Scope:** product | <FEATURE_ID>_<slug>

**Contexto:**
<Qué problema, restricción, oportunidad u observación motivó esta decisión. 2-5 líneas. Si la decisión vino de una bifurcación detectada por Regla 3b, mencionarlo explícitamente.>

**Decisión:**
<Qué se eligió, con la mínima descripción técnica suficiente para que un lector futuro entienda QUÉ se hizo (no por qué — eso va arriba).>

**Alternativas descartadas:**
- **<alt 1>:** <por qué no>
- **<alt 2>:** <por qué no>
- **<alt 3>:** (si aplica) <por qué no>

**Consecuencias:**
- (+) <consecuencia positiva 1>
- (+) <consecuencia positiva 2>
- (−) <consecuencia negativa 1>
- (−) <consecuencia negativa 2 — si aplica>

**Aplica a:**
- <story / feature / componente afectado>
- <referencia explícita desde FW-05/FW-06 o feature/definition.md donde nació la decisión>
```

---

## Reglas de uso

1. **Numeración global.** Aún si el ADR vive en `feature/decisions.md`, el `{adr_id}` viene de la numeración global del proyecto.
2. **No editar ADRs aceptados.** Si la decisión cambia, marcar el viejo como `Estado: Reemplazada por <adr-id-nuevo>` y crear uno nuevo.
3. **Una alternativa por bullet.** No fusionar varias opciones en un mismo bullet.
4. **Consecuencias balanceadas.** Si sólo hay positivas o sólo negativas → revisar; probablemente falta análisis.
5. **Sin TBDs.** Si algún campo no se puede completar, no anexar el ADR todavía — la decisión todavía no está madura para registrar.
