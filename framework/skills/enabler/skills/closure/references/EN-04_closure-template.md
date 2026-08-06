# Template — `EN-04_closure.md` de un enabler

> **Para qué:** cierre formal del enabler. Confirma que la capacidad técnica quedó habilitada y que las features/stories vinculadas pueden avanzar.
> **Usado por:** `/fremi-enabler`, Paso 4 (crear archivo inicial — se completa al cierre).
> **Rol del archivo:** **sign-off**. Sin este doc validado, el enabler sigue abierto.

---

```markdown
# Cierre del enabler

**Fecha de cierre:** <YYYY-MM-DD>
**Firmado por:** <nombres / roles>

## Capacidad habilitada (confirmada)

<Una frase: "El enabler dejó habilitado <X>". Refleja lo que decía `EN-01_definition.md` § Capacidad habilitada, pero confirmado.>

## Trazabilidad de criterios

> Cada CA del `EN-01_definition.md` debe estar mapeado a evidencia técnica.

| CA | Descripción | Verificación | Estado |
|---|---|---|---|
| CA-001 | <copiado de EN-01> | <comando que retorna 0 / test / artefacto> | ✅ |
| CA-002 | <...> | <...> | ✅ |
| CA-003 | <...> | <...> | ✅ |

## Decisiones aplicadas

| Decisión | Doc fuente | ADR | Implementada en |
|---|---|---|---|
| D-01 | `EN-02_design.md` | `ADR-XXX` (si aplica) | <archivos / recursos> |
| D-02 | `EN-02_design.md` | — | <archivos / recursos> |

## Tareas ejecutadas

> Resumen del `EN-03_plan.md` con estado final. Sólo debería haber `[x]` o `[~]` con motivo. Si hay `[ ]` o `[/]` → el enabler NO se puede cerrar.

- task-001 — <título> — [x] cerrada el <fecha>
- task-002 — <título> — [x] cerrada el <fecha>
- task-XXX — Verificación integral — [x] cerrada el <fecha>

## Features / stories que ya pueden avanzar

> El enabler tenía vinculaciones declaradas en `EN-01_definition.md`. Confirmar que ahora cada una puede ejecutar.

- **`FT-XX`** — <feature que estaba bloqueada> — ✅ desbloqueada
- **`FT-YY_HU-ZZ`** — <story que estaba bloqueada> — ✅ desbloqueada

## Evidencia

- PR / commits: <links>
- Despliegue: <ambiente, fecha, ID>
- Verificación post-deploy: <link a logs / output del comando de verificación>

## Hallazgos durante la ejecución

> Cosas no previstas que aparecieron y cómo se resolvieron. Útil para el próximo enabler similar.

- <hallazgo + solución>
- <hallazgo + solución>

## Sync-back hacia capas superiores (Regla 12)

> Si durante la ejecución se descubrió algo que pertenece a `product/definition.md`, `product/decisions.md` o a una feature, anotarlo y confirmar que se actualizó.

- <doc actualizado / "ninguno">

## DoD (Definition of Done)

- [ ] Todos los CA del `EN-01_definition.md` verificados con evidencia.
- [ ] Implementación coincide con `EN-02_design.md`.
- [ ] Todas las tasks del `EN-03_plan.md` en `[x]` o `[~]`.
- [ ] ADRs aplicables registrados en `docs/works/product/decisions.md` (o feature local).
- [ ] Features/stories vinculadas pueden avanzar (verificado).
- [ ] Sin divergencias con capas superiores (Regla 12).
- [ ] Sign-off firmado.

## Sign-off

<rol 1>: <nombre> · <fecha>
<rol 2>: <nombre> · <fecha>
```

---

## Reglas de uso

1. **No se firma sin DoD 100%.** Si queda algún checkbox sin `[x]`, el enabler sigue abierto.
2. **Trazabilidad explícita.** Cada CA debe tener evidencia técnica concreta (comando, test, recurso).
3. **Stories/features vinculadas verificadas.** No basta con que el enabler funcione "técnicamente" — las consumidoras deben poder avanzar.
4. **Sin esto, el enabler no es DONE.** Aplica el mismo principio que Regla 11 (closure de story).
