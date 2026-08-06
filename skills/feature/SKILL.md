---
name: fremi-feature
description: Crea una nueva feature en docs/works/features/ con su definition.md inicial. Lee la nomenclatura desde ~/.fremi/framework/settings/methodology.json (NO usa prefijos hardcoded). Usar cuando el usuario quiere crear o registrar una feature nueva del producto. Valida que la capa producto esté lista antes de avanzar.
---

# /fremi-feature — Crear nueva feature

Crea el folder y el `definition.md` de una nueva feature, respetando la nomenclatura definida en **`~/.fremi/framework/settings/methodology.json`** y validando precondiciones.

> **Importante:** este skill NO tiene prefijos ni formatos hardcoded. Antes de hacer cualquier cosa, lee el JSON de configuración y deriva los patrones de `identifiers.feature`, `slug` y `paths`. Si la convención cambia (ej: `FT-01` → `F-001`), el skill se adapta automáticamente.

## Sintaxis

```
/fremi-feature <nombre-descriptivo>
```

- `<nombre-descriptivo>`: texto libre. El skill lo convierte a kebab-case según `slug.transforms` del JSON.
- Si el usuario no pasa nombre → preguntárselo.

## Cuándo invocarlo

- Usuario dice "creemos una feature", "agregar feature X", "voy a empezar una feature nueva".
- Aparece una nueva línea de trabajo lo suficientemente grande para tener varias user stories.

## Procedimiento

### Paso 0 — Cargar configuración de nomenclatura (OBLIGATORIO)

1. Leer `~/.fremi/framework/settings/methodology.json`.
2. Extraer la configuración relevante:
   - `feat_cfg = identifiers.feature` → `prefix`, `scope`, `id_format`, `folder_format`, `folder_regex`, `examples`.
   - `slug_cfg = slug` → `regex`, `case`, `max_length`, `transforms`.
   - `paths.features_dir` → dónde viven las features (default: `docs/works/features`).
   - `paths.product_dir` → dónde vive `definition.md` de producto.
   - `paths.fields_for_methodology_doc` (si existe) — referencias a docs internos.

Si el JSON no existe o está corrupto → abortar y avisar al usuario que falta `~/.fremi/framework/settings/methodology.json`.

### Paso 1 — Validar precondiciones (Regla 1)

Verificar que exista con contenido:
- `{paths.product_dir}/definition.md`

Si no:
- Avisar al usuario que falta capa producto.
- Proponer ejecutar `/fremi-product-iniciativas` / `/fremi-product-ideas` / `/fremi-product-planteamiento` primero o completar el `definition.md` de producto.
- **No avanzar** sin confirmación explícita.

### Paso 2 — Determinar el ID

1. Listar carpetas existentes en `{paths.features_dir}`.
2. Filtrar las que matcheen `feat_cfg.folder_regex` (típicamente `^FT-\d{2}_[a-z][a-z0-9-]*$`).
3. Extraer el número de cada ID existente (parsear según `feat_cfg.id_format`).
4. Próximo número = max(existentes) + 1. Si no hay → 1.
5. Construir el `id` aplicando `feat_cfg.id_format` con `{prefix}` y `{number}` (con padding según el format spec — `{number:02d}`, `{number:03d}`, etc.).
6. **No reciclar** IDs de features eliminadas.

**Ejemplo** (con configuración default): `feat_cfg.prefix="FT"`, `feat_cfg.id_format="{prefix}-{number:02d}"` → primera feature = `FT-01`, octava = `FT-08`.

### Paso 3 — Normalizar el slug

Aplicar `slug_cfg.transforms` en orden (default: lowercase, replace spaces/underscores con `-`, strip acentos, strip non-alphanumeric excepto `-`).

Validar contra `slug_cfg.regex` (default: `^[a-z][a-z0-9-]*$`).

Validar largo ≤ `slug_cfg.max_length`.

Si el slug colisiona con uno existente → avisar al usuario y pedir variación.

### Paso 4 — Crear el folder y `definition.md`

Aplicar `feat_cfg.folder_format` (default: `{id}_{slug}`) → ej: `FT-01_core-report-generation`.

Crear:
```
{paths.features_dir}/{folder}/
└── definition.md
```

1. Leer el template canónico de [`references/definition-template.md`](references/definition-template.md) (relativo a la carpeta del skill: `~/.fremi/framework/skills/feature/references/definition-template.md`).
2. **Capturar versión del padre (Regla 17)**: leer el frontmatter de `docs/works/product/plan.md` y extraer su `version` actual. Este valor se inyecta como `ancestor.version_at_creation` en el frontmatter del nuevo `definition.md`. Si `plan.md` no tiene frontmatter (pre-Regla 17) → asumir `"0.0.0"` y avisar.
3. Reemplazar los placeholders del template:
   - `{id}` y `{slug}` → con los valores derivados de Paso 2 y 3.
   - `<...>` → con la info del usuario sobre la feature (o dejarlos como TODO si la conversación aún no llegó al detalle).
   - **Frontmatter (Regla 17)**: `version: 0.1.0`, `created`/`last_updated` fecha actual, `doc_type: living`, `ancestor.id: product`, `ancestor.version_at_creation`: valor capturado arriba.
4. Escribir el archivo `definition.md` con el resultado.

> El template incluye reglas de uso y restricciones. Respetarlas al rellenar: in-scope describible, conexión obligatoria con iniciativas, ADRs por bifurcación, sync-back de restricciones transversales.

### Paso 5 — Actualizar `product/plan.md` (bump MINOR)

Agregar la feature a la lista de "Features activas" en `{paths.product_dir}/plan.md` como entrada nueva:

```markdown
- **{id}_{slug}** — <título corto>. Estado: en planificación.
```

**Bump del padre (Regla 17)**: agregar feature al plan.md dispara **MINOR** en `product/plan.md`:
1. Leer versión actual del frontmatter (ej: `1.5.0`).
2. Bumpear a la próxima MINOR (ej: `1.6.0`).
3. Actualizar `last_updated` a fecha actual.
4. Agregar entry al changelog al pie:
   ```
   - **v1.6.0** — YYYY-MM-DD — Nueva feature {id}_{slug} agregada al roadmap. [origen: /fremi-feature]
   ```

### Paso 6 — Validar sincronía con capa producto (Regla 12)

Al terminar de armar la feature `definition.md` con contenido real:

- Verificar que cada **capacidad** referenciada en la feature esté declarada en `{paths.product_dir}/definition.md` (In-scope) o en `{paths.product_dir}/iniciativas.md` (Capacidades).
- Verificar que cada **restricción** mencionada que parezca transversal ya esté en `{paths.product_dir}/definition.md` (Restricciones).
- Verificar que los **términos técnicos** estén en el glosario de producto si se usan ampliamente.
- Si se detecta algo que no está arriba → **avisar al usuario** y proponer actualizar producto antes de continuar.

Si el usuario confirma sync-back necesario, **pausar** el flujo de feature, hacer el update a producto, y recién después continuar.

### Paso 7 — Reportar

Decir al usuario:
- ID y slug asignados (formato derivado del JSON).
- Path completo creado.
- Si hubo sync-back: qué docs de producto se actualizaron.
- Próximo paso: completar `definition.md` y luego crear la primera story con `/fremi-story {id} <nombre>`.

## Template canónico

El template de `definition.md` vive en [`references/definition-template.md`](references/definition-template.md). El skill lo lee en el Paso 4 para instanciar el archivo.

Para cambiar la estructura del `definition.md` de las features, **editar el template**, no este SKILL.md. Si la estructura cambia significativamente, hacer un sweep manual de los `definition.md` existentes.

## Validaciones extras

- Si el `<nombre>` recibido es ambiguo o muy corto (< 3 palabras), pedir al usuario que lo clarifique.
- Si el usuario pide un slug que ya existe, sugerir agregar contexto (`-v2`, `-extension`, etc.) o pedir nombre alternativo.
- Si `methodology.json` no es legible o está malformado → **abortar y avisar**. No usar fallbacks hardcoded.
