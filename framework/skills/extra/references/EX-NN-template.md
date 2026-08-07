---
version: 1.0.0
created: {DATE}
last_updated: {DATE}
doc_type: snapshot
ancestor:
  id: project
  version_at_creation: "{PROJECT_VERSION}"
tipo: {tooling | script | iac | refactor | metodologia | otro}
estado: {en-curso | listo | archivado}
disparador: {descripción corta del disparador — issue, commit, pedido del user, sync-back}
---

# {ID} — {TITLE}

> Trabajo fuera del flujo (Regla 14). Un archivo por concepto cohesivo — si aparecen conceptos no-relacionados, split en varios `EX-NN`.

---

## Qué se hizo

(Resumen ejecutivo — 2-5 líneas.)

---

## Por qué NO es feature/story/task

(Justificación explícita. Debe descartar los criterios de:
- feature: no entrega valor user-facing nuevo
- story: no tiene comportamiento observable via Given/When/Then
- enabler: no habilita capacidad futura específica
- bug: no hay defecto identificado que amerite test rojo)

---

## Cambios concretos

(Lista de archivos / paths con qué cambió en cada uno.)

- `path/al/archivo1` — qué cambió
- `path/al/archivo2` — qué cambió

---

## Validación / cómo se probó

(Comandos, verificaciones manuales, tests que corrieron.)

- `comando 1` → resultado esperado
- `comando 2` → resultado esperado

---

<!-- SECCIONES CONDICIONALES — descomentar si aplican -->

<!-- ## Vinculaciones

(Obligatoria si el trabajo referencia ADRs vigentes, stories cerradas/en progreso,
otros EX relacionados, o issues externos.)

- ADR-XXX — descripción de la relación
- HU-XX de FT-YY — descripción
- EX-XX — descripción
-->

<!-- ## Notas / aprendizajes

(Obligatoria si durante el trabajo surgieron gotchas o convenciones reusables.)

- Gotcha 1: ...
- Convención descubierta: ...
-->
