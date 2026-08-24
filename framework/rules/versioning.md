# Regla de versionado vivo, changelog y linaje

> **Regla obligatoria 17.** Gobierna el frontmatter obligatorio, las reglas de bump (MAJOR / MINOR / PATCH), el changelog inline en docs living, y el rastreo ancestral entre padres e hijos.
>
> **Alcance:** cross-domain — aplica a TODOS los artifacts (product, feature, story, enabler, extra, bug). Los ejemplos usan docs de story por brevedad; la regla es análoga en otros artifacts.
>
> Se lee junto con `rules/workflow.md`.

---

## Regla 17 — Living Versioning: cada artifact tiene versión + changelog + linaje

Todos los artifacts del framework llevan una **versión semver** (`MAJOR.MINOR.PATCH`) en su frontmatter. Los docs **living** (que crecen con el tiempo) llevan además un **changelog inline** al pie. Los docs **snapshot** registran la **versión del padre** al momento de crear y al momento de cerrar.

**Objetivo**: en cualquier momento poder responder "¿en qué versión del producto/feature nació y se cerró este artifact?" — sin esto, la trazabilidad histórica se pierde.

### Fuente de verdad operativa

`~/.fremi/framework/settings/config.core.yaml → versioning.*` gobierna:
- **`doc_types.living` / `doc_types.snapshot`** — qué archivos son living y cuáles son snapshot.
- **`bump_rules`** — cuándo se bumpea MAJOR / MINOR / PATCH.
- **`frontmatter`** — campos obligatorios en el YAML del inicio de cada doc.
- **`changelog`** — formato del changelog inline al pie de docs living.
- **`parent_bump_triggers`** — cuándo un evento (story cierra, feature cierra, ADR aceptado…) obliga a bumpear un padre.

Los skills consultan este archivo antes de crear o cerrar artifacts. No se cambia la política de versionado inline en el doc — se cambia en el config.

### Frontmatter obligatorio

Todo doc del framework arranca con este bloque YAML:

**Doc living** (product/*, feature/definition|spec|decisions, FW-09_checkwork):
```yaml
---
version: 1.3.0
created: 2026-06-15
last_updated: 2026-07-13
doc_type: living
ancestor:                     # sólo si el doc tiene padre
  id: product                 # ID del padre
  version_at_creation: "0.5.0"
---
```

**Doc snapshot** (FW-01..08,10, EN-*, BG-*, EX-*):
```yaml
---
version: 1.0.0                # snapshots suelen quedar en 1.0.0
created: 2026-06-19
last_updated: 2026-06-19
doc_type: snapshot
ancestor:
  id: FT-01
  version_at_creation: "2.1.0"
  version_at_closure: "2.2.0"  # se rellena cuando el snapshot cierra
---
```

### Reglas de bump (docs living)

| Segmento | Cuándo | Ejemplo |
|---|---|---|
| **MAJOR** | Breaking change — el contrato/scope existente cambia | Story MODIFICA un requirement previo del spec; producto re-scoped |
| **MINOR** | Agregado — nuevo contenido válido bajo contrato actual | Story AGREGA nuevo requirement; nuevo ADR aceptado; nueva feature al plan |
| **PATCH** | Aclaración sin cambio semántico | Typo, mejor redacción, completar TBD ya decidido |

### Changelog inline (docs living)

Al pie del doc, sección `## Changelog`:

```markdown
## Changelog

- **v2.2.0** — 2026-06-21 — HU-04 cierra: agrega R3 (modo delivery URL) y modifica R2. [origen: HU-04_delivery-mode-url-and-direct]
- **v2.1.0** — 2026-06-19 — HU-02 cierra: agrega R2 (render PDF). [origen: HU-02_static-html-to-pdf]
- **v1.0.0** — 2026-05-30 — Feature creada. [origen: usuario]
```

Cada entry incluye el **origen** — qué artifact disparó el bump. Es la trazabilidad hacia abajo.

### Fase de "actualización live" al cerrar un artifact

Cerrar un snapshot (firmar `FW-10_closure`, `EN-04_closure`, sección `Cierre` del bug, etc.) **obliga a bumpear los padres afectados** según `parent_bump_triggers`:

- **Story cierra** → bumpear `feature/spec.md` (según qué agregó/modificó la story), `feature/decisions.md` (si hubo ADRs nuevos), `feature/definition.md` (patch si confirmó supuestos).
- **Feature cierra** → bumpear `product/plan.md` (marca completada), `product/definition.md` (patch/minor/major según impacto).
- **Enabler cierra** → bumpear su padre (product/feature/story según scope).
- **Bug cierra** → bumpear `feature/spec.md` según qué implicó el fix.
- **ADR aceptado** → bumpear `product/decisions.md` o `FT-XX/decisions.md` (MINOR por default; MAJOR si reemplaza otro ADR).

Esta operación es **obligatoria antes de firmar el snapshot** — el closure inválido si no bumpeó al padre.

### Rastreo ancestral al crear cualquier artifact

Cuando cualquier skill crea un artifact nuevo, DEBE:

1. Leer la versión **actual** del padre inmediato (feature, product, o story según aplique).
2. Rellenar el `ancestor.version_at_creation` en el frontmatter del artifact recién nacido.
3. Registrar en el changelog del padre (si el padre es living) que el nuevo artifact nació apoyado en esa versión.

**Ejemplo concreto**:
- Feature FT-05 nace cuando `product/plan.md` está en v1.5.0. `FT-05/definition.md` frontmatter registra `ancestor.version_at_creation: "1.5.0"`.
- Story HU-01 de FT-05 nace cuando `FT-05/definition.md` está en v1.0.0. `HU-01/FW-01_definition.md` frontmatter registra `ancestor.version_at_creation: "1.0.0"`.
- HU-01 cierra cuando `FT-05/definition.md` está en v1.2.0 (bumpeó por otras stories). `HU-01/FW-10_closure.md` frontmatter registra `ancestor.version_at_closure: "1.2.0"`.

Con esto podés reconstruir la línea temporal completa: qué se sabía cuándo, y qué cambió entre creación y cierre.

### Herramientas

- **`/fremi-story-closure-check`** verifica que los padres afectados fueron bumpeados correctamente antes de firmar.
- **`/spec-merge`** (futuro, cuando se implemente living-spec por feature) hace el bump automático al cerrar la story.
- Skills que crean artifacts (`/fremi-story`, `/fremi-feature`, `/fremi-enabler`, `/fremi-story-bug` o `/fremi-feature-bug`, `/fremi-product-adr` / `/fremi-feature-adr` / `/fremi-story-adr`, `/fremi-product-iniciativas` / `/fremi-product-ideas` / `/fremi-product-planteamiento`) cachean la versión del padre al momento de crear.

### Anti-patrones a evitar

- ❌ Crear un artifact sin frontmatter (queda huérfano de versionado).
- ❌ Bumpear el número inventando cuál corresponde — aplicar `bump_rules` de `config.yaml` como referencia.
- ❌ Firmar closure sin actualizar el padre — deja el rastro incompleto.
- ❌ Cambiar la versión de un doc snapshot ya firmado (el snapshot es inmutable después de cerrar).
- ❌ Editar el changelog "creativamente" — cada entry debe corresponder a un cambio real y a un origen identificable.
- ❌ Duplicar versiones (dos entries con el mismo número).
