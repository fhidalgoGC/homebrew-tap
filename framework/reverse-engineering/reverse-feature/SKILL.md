---
name: fremi-reverse-feature
description: Reconstruye los docs de una feature (`FT-XX/definition.md` y opcionalmente `FT-XX/decisions.md`) a partir de stories existentes o código legacy. Modo default `--transparent` (Regla 26); `--stealth` disponible como override explícito. Aplica Regla 17. Usar cuando existen stories o código de una feature pero nunca se creó el `FT-XX/definition.md` formal, o cuando el `definition.md` existe pero está desactualizado.
---

# /fremi-reverse-feature — Ingeniería inversa de una feature

Reconstruye los docs de una feature a partir de:
- Stories ya existentes bajo `FT-XX/user-stories/*`.
- Código legacy sin story asociada.
- ADRs locales encontrados en el proyecto.

**Precondición conceptual**: existe trabajo bajo una feature pero el `FT-XX/definition.md` (u otros docs de feature) NO existen o están vacíos.

## Sintaxis

```
/fremi-reverse-feature <FT-XX> [--stealth|--transparent] [--dry-run]
```

## Cuándo invocarlo

- Existe `FT-XX/user-stories/*` con stories reales pero no hay `FT-XX/definition.md`.
- El `definition.md` de feature quedó obsoleto tras varias stories cerradas y hay que reconstruirlo del estado actual.
- Se está migrando código legacy al framework y se necesita formalizar la feature.

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.json`, `config.feature.yaml`, `config.yaml` master.

### Paso 1 — Identificar la feature
- Verificar existencia del folder `docs/works/features/{FT-XX}_<slug>/`.
- Si no existe → abortar (usar `/fremi-feature` normal para crear feature nueva).

### Paso 2 — Escanear artifacts sobrevivientes

```
📁 Stories existentes en FT-XX/user-stories/*
   - Enumerar HU-YY y extraer:
     - Título de FW-01_definition.md
     - Capacidades in-scope de FW-03_scope.md
     - Contratos de FW-05_sdd-spec.md
     - Términos técnicos usados

📂 Código relacionado (si aplica)
   - Rutas / módulos / features referenciados en la feature.

📜 ADRs locales
   - Buscar en FT-XX/decisions.md o en HU-YY/decisions.md (delta).
```

### Paso 3 — Inferir contenido de `FT-XX/definition.md`

Reconstruir con:
- **Título de la feature**: del slug del folder + títulos agregados de stories.
- **Descripción**: agregación de descripciones de FW-01 de cada story.
- **Iniciativa conectada**: **preguntar al usuario** (no se puede inferir).
- **Cómo aporta a métricas**: preguntar.
- **Dependencias de capacidades**: mencionar capacidades de `product/definition.md` referenciadas por las stories.
- **Alcance**: agregación de in-scope de FW-03 de cada story.
- **Fuera de alcance**: agregación de out-of-scope.
- **Criterios de éxito de feature**: derivar de agregación de CAs de todas las stories (**preguntar** para refinar).
- **Lista de user stories**: enumerar cada HU-YY con estado (Planeada / En curso / Cerrada según FW-10_closure).
- **Decisiones técnicas vinculadas**: enumerar ADRs referenciados por las stories.
- **Glosario local**: términos técnicos que aparecen en 2+ stories y no están en glosario de producto.

### Paso 4 — Reconstruir `FT-XX/decisions.md` (si aplica)

Si existen ADRs locales a esta feature:
- Consolidar entries + agregar changelog reconstruido.
- Living doc: v0.1.0 inicial + entries retroactivas por cada ADR aceptado.

### Paso 5 — Aplicar Regla 17

- `created`: fecha del primer commit de código en `src/functions/*` relacionado con la feature (con `--from-git-history`) o fecha actual.
- `ancestor.version_at_creation`: versión de `product/plan.md` al momento inferido.
- Modo `--stealth`: sin flag reverse_engineered.
- Modo `--transparent`: con flag.

### Paso 6 — Bumpear `product/plan.md`

- Verificar que la feature está listada en `product/plan.md`.
- Si no → agregarla + bumpear MINOR de plan.md (Regla 17).

### Paso 7 — Reportar

```
▶ Feature reconstruida: FT-XX_<slug>
▶ Docs creados:
  - FT-XX/definition.md (v0.1.0, ancestor=product@X.Y.Z)
  - FT-XX/decisions.md (opcional, si hay ADRs)

▶ Stories consolidadas: N cerradas + N en curso
▶ Capacidades in-scope: N (agregadas de stories)
▶ Gaps que necesitan revisión humana:
  ⚠ Iniciativa conectada — el usuario debe indicar init-XXX
  ⚠ Métricas de aporte — inferir del negocio, no del código
  ⚠ Sync-back: X ADRs locales podrían promoverse a producto
```

## Advertencias

- **Iniciativa asociada**: no se puede inferir del código. Preguntar al usuario.
- **Métricas de éxito de feature**: aunque haya CAs de stories, la meta de la feature es de negocio.
- **Feature legacy sin stories previas**: la reconstrucción es más pobre — mayormente del código. Considerar crear las stories con `/fremi-reverse-story` primero.

## Anti-patrones

- ❌ Usar `/fremi-reverse-feature` para features nuevas — usar `/fremi-feature` normal.
- ❌ Firmar el `definition.md` reconstruido sin revisar iniciativa/métricas.
- ❌ Ignorar ADRs locales que deberían promoverse a producto.

## Referencias

- README del concepto: [`../README.md`](../README.md).
- Skill del flow normal: [`/fremi-feature`](../../skills/feature/SKILL.md).
- Regla 12 (sync-back) — importante al reconstruir feature.
- Regla 17 (versionado).
