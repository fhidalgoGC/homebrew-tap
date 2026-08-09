# Template — `{workflow.closure}` de una story

> **Para qué:** Definition of Done explícito de la story, con matriz de trazabilidad de criterio→BDD→SDD→Design→test→código.
> **Usado por:** `/fremi-story`, Paso 4 (crear archivo inicial con esqueleto); `/fremi-story-closure-check` para auditar antes del sign-off (Regla 11).
> **Rol del archivo:** **cierre** — la story no es DONE sin este archivo validado.
> **Sin este archivo completo, la story sigue abierta** — no se reportan métricas, no se considera implementada, no se cuenta en burndown.

---

```markdown
---
version: 1.0.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
doc_type: snapshot
ancestor:
  id: {feature_id}
  version_at_creation: "<versión de FT-XX/definition.md al momento de crear la story>"
  version_at_closure: "<versión final de FT-XX/definition.md después de bumpear al firmar closure>"
---

# Cierre de story: `{feature_id}_{story_id}_{slug}`

> ⏳ **Estado:** En curso. Completar cuando todas las tareas de `{workflow.plan}` estén `[x]` y todos los TC de `{workflow.tdd}` estén verdes.
>
> **Regla 17 — Bump del padre al firmar**: al completar sign-off, el skill `/fremi-story-closure-check` debe verificar que `FT-XX/definition.md` (y `FT-XX/spec.md`, `FT-XX/decisions.md` cuando existan como living) fueron bumpeados según `parent_bump_triggers.story_closes` de `config.yaml`. Escribir la versión final en `ancestor.version_at_closure` de arriba.

## Matriz de trazabilidad

> Cada **criterio de aceptación** de `{workflow.definition}` debe mapear a:
> - escenario BDD (`FW-04`)
> - contrato SDD (`FW-05`)
> - decisión Design (`FW-06`)
> - test concreto (`FW-07` → archivo:función)
> - archivo de implementación
> - estado actual

| Criterio | Escenario BDD | Contrato SDD | Decisión Design | Test (archivo::función) | Implementación | Estado |
|---|---|---|---|---|---|---|
| CA-001 | SC-001 | <contrato> | <decisión + ADR> | `tests/handler.test.ts::generatesPdf` | `src/lambda/handler.ts` | ⬜ |
| CA-002 | SC-002 | <error 400> | <ADR-XXX> | `tests/handler.test.ts::rejectsInvalidInput` | `src/shared/errors.ts` | ⬜ |
| CA-003 | SC-003 | <RNF> | <decisión> | `tests/perf.test.ts::p95UnderBudget` | `src/pdf/PdfGenerator.ts` | ⬜ |

**Leyenda de estado:** ⬜ pendiente | 🟡 en curso | ✅ cerrado

## Definition of Done

- [ ] **Nada fuera del `{workflow.scope}` fue implementado.** Verificado revisión de diff vs scope.
- [ ] **Implementación coincide con `{workflow.design}`.** Estructura de archivos, componentes y patterns aplicados se respetan.
- [ ] **Todos los SC-XXX tienen test que pasa.** Cubrimiento del `FW-04` por TC concretos.
- [ ] **Todos los contratos SDD implementados.** Cubrimiento del `FW-05`.
- [ ] **Todos los TC-XXX marcados `[x]`** en `{workflow.tdd}`.
- [ ] **Todas las task-XXX marcadas `[x]`** en `{workflow.plan}` (excluyendo `[~]` descartadas con motivo).
- [ ] **ADRs aplicables respetados.** ADRs referenciados desde `FW-06` se cumplen en el código.
- [ ] **Coverage ≥ umbrales declarados en `{workflow.tdd}`** (semánticamente, no sólo el número).
- [ ] **Sin divergencias con capas superiores** (Regla 12). Producto + feature reflejan lo que la story descubrió.
- [ ] **Documentación actualizada si correspondía** (README de módulo, docs públicas, glosario).
- [ ] **Lint + format limpios.** Comando `<lint cmd>` retorna 0.
- [ ] **CI verde en la rama / PR de la story.**

## Evidencia

- **PR(s):** <link al PR principal y sub-PRs si aplica>
- **Commits relevantes:** <hash(es) que materializan la story>
- **Demo:** <link a video / screencast / instructivo de cómo probarla — si aplica>
- **Resultado de CI:** <link al build verde>

## Decisiones tomadas durante la ejecución

> Si durante la implementación apareció una decisión técnica imprevista, ya debería haber un ADR. Listar los ADRs creados durante esta story acá.

- <ADR-XXX> — <título>

## Cambios al spec durante la ejecución (si los hubo)

> Si se modificó BDD/SDD/Design durante la implementación (Regla 10: divergencia intencional), documentar acá qué cambió y por qué.

- <ej: "Se agregó SC-004 (caso de borde descubierto) — actualizado FW-04 y agregado TC-008">

## Sync-back validado (Regla 12)

- [ ] Restricciones nuevas detectadas → propagadas a `product/definition.md` o `feature/definition.md`.
- [ ] Capacidades nuevas → reflejadas en `product/definition.md` (In-scope).
- [ ] Términos técnicos transversales → agregados a glosario de producto.
- [ ] Decisiones técnicas transversales → promovidas a ADR de producto.

## Sign-off

**Fecha de cierre:** TBD (completar cuando todos los items del DoD estén `[x]`)
**Cerrada por:** <persona o rol>
**Próxima story:** <referencia a la siguiente HU si aplica>
```

---

## Reglas de uso

1. **No firmar el closure con items pendientes.** Si algún DoD está `[ ]`, la story sigue abierta. Excepción: items marcados como N/A explícitamente con motivo.
2. **Matriz completa.** Cada CA-XXX debe tener fila. Cada fila completa hasta la columna "Estado".
3. **Implementación trazable.** La columna "Implementación" debe apuntar a archivos reales que existen. Si un CA no tiene archivo asociado, falta implementación.
4. **`/fremi-story-closure-check` antes del sign-off.** Auditar con la skill para detectar gaps automáticos.
5. **Sync-back obligatorio** (Regla 12). Si durante la story se descubrió algo de capa superior, eso debió quedar arriba — el closure verifica que sí ocurrió.
