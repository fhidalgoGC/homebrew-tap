# Reglas de docs como fuente de verdad y sync-back cross-layer (cross-domain)

> **Reglas obligatorias 10, 12.** Gobiernan que los docs son fuente de verdad (código nunca queda desincronizado silenciosamente), y la sincronía bidireccional entre capas (product ↔ feature ↔ story).
>
> **Alcance:** verdaderamente cross-domain — cruzan capas por definición. **NO son reglas de closure de ningún artifact**; son reglas de coherencia entre docs y código, y entre capas del framework.
>
> Las reglas de closure específicas de dominio viven en cada artifact:
> - Story closure → `~/.fremi/framework/artifacts/story/rules/closure.md`
> - Story checkwork → `~/.fremi/framework/artifacts/story/rules/checkwork.md`
>
> Se lee junto con el índice global `rules/workflow.md`.

---

## Regla 10 — Los docs son fuente de verdad

Si el código diverge del spec:
- Divergencia intencional → actualizar spec + ADR.
- Divergencia accidental → corregir el código.
- Nunca dejar la divergencia silenciosa.

---

## Regla 12 — Sincronía bidireccional entre capas (sync-back obligatorio)

El flujo principal es **top-down**: producto → feature → story. Pero los docs son **fuente de verdad viva**, no fotos del arranque. Si trabajando en una capa inferior se descubre algo que debería vivir en una capa superior, **actualizar la superior PRIMERO**, antes de continuar el trabajo de la inferior.

### Casos típicos que disparan sync-back

> Los ejemplos abajo usan docs de story (`FW-XX`) por ser el flujo más completo. La regla aplica **análogamente** cuando el descubrimiento nace en cualquier otro artifact (feature, enabler, extra). Cada dominio nombra sus propios docs en su carpeta `rules/`.

| Descubierto en (ejemplos) | Pertenece a | Acción |
|---|---|---|
| Story: scope o bdd — una restricción que claramente aplica a otras stories | `product/definition.md` (Restricciones) | Mover/copiar al producto, referenciar desde la story |
| Story: design, o feature/decisions — decisión técnica que aplica a más de una feature | `product/decisions.md` (ADR global) | Promover el ADR al nivel producto, marcar el anterior como "promovido a ADR-XXX" |
| Story: definition o bdd — una capacidad nueva referenciada (nuevo formato, adapter, modo de entrega) que no está en producto | `product/definition.md` (In-scope) | Sumar al in-scope de producto y, si afecta a la iniciativa, ajustar `iniciativas.md` |
| Cualquier nivel: un término técnico transversal no definido | `product/definition.md` (Glosario) | Sumar al glosario |
| feature/definition.md: una iniciativa nueva o ajuste al MVP | `product/iniciativas.md` | Actualizar la iniciativa o sumar `init-002` si es realmente otra |
| Story durante implementación: el alcance se infló o redujo | `feature/definition.md` y posiblemente `product/plan.md` | Reflejar el cambio antes de proceder |

### Procedimiento

1. **Detectar la divergencia** (manual o vía `/fremi-sync-check`).
2. **Pausar** el trabajo en la capa inferior.
3. **Actualizar** la capa superior (con justificación en el commit o ADR).
4. **Validar** que la actualización no rompe otras features/stories existentes.
5. **Continuar** el trabajo en la capa inferior con la base sincronizada.

### Anti-patrones a evitar

- ❌ Dejar la divergencia silenciosa "porque ya está y funciona".
- ❌ Documentar en la story algo que es producto y nunca subirlo.
- ❌ Crear ADR a nivel feature cuando aplica a producto.
- ❌ Inventar glosario inline en una story para términos que se van a reusar.

### Cuándo NO hace falta sync-back

- Detalle puramente local a la story (ej: nombre de una variable interna, decisión de algoritmo entre opciones equivalentes).
- ADR que **explícitamente** sólo afecta a una feature por construcción (ej: layout específico de un único reporte).

Si hay duda, **default a promover hacia arriba**. Es más fácil bajar después que detectar divergencias acumuladas.
