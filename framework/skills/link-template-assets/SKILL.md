---
name: fremi-link-template-assets
description: Enlaza (o desenlaza con --remove) skills/rules/hooks entre /template/docs/ y docs/project/ (symlinks, no copias). Modo enlace: skills → .claude/skills/ (auto-invocables), rules → referencia auto en CLAUDE.md "## Project rules", hooks → instrucciones de registro en .claude/settings.json. Modo --remove: borra symlinks que apunten a /template/, limpia referencias en CLAUDE.md (sólo las del template), reporta hooks que quedaron registrados a mano. La cadena de symlinks termina siempre en /template/ — único archivo real. Usar después de /fremi-import-template para adoptar, o con --remove para deshacer la adopción.
---

# /fremi-link-template-assets — Enlazar assets del template al proyecto

Adopta **skills, rules y/o hooks** del template importado (`/template/`) como assets del proyecto (`docs/project/`) y los expone al agente. **No copia archivos** — crea symlinks en cadena: `.claude/` → `docs/project/` → `/template/docs/` (donde vive el archivo real).

## Sintaxis

```
/fremi-link-template-assets [tipo] [--remove]
```

- `tipo` (opcional): uno de `skills | rules | hooks`. Si se omite → procesa los 3.
- `--remove` (opcional): **invierte la operación**. Desenlaza los assets que apuntan a `/template/` (no toca los de `~/.fremi/framework/framework/` ni los creados con `/fremi-add-skill` / `/fremi-add-hook` / `/fremi-add-rule` / `/fremi-add-mcp`).

**Combinaciones válidas:**

| Comando | Acción |
|---|---|
| `/fremi-link-template-assets` | Enlaza los 3 tipos. |
| `/fremi-link-template-assets skills` | Enlaza sólo skills. |
| `/fremi-link-template-assets --remove` | Desenlaza los 3 tipos del template. |
| `/fremi-link-template-assets skills --remove` | Desenlaza sólo los skills del template. |
| `/fremi-link-template-assets rules --remove` | Desenlaza sólo los rules del template. |
| `/fremi-link-template-assets hooks --remove` | Desenlaza sólo los hooks del template. |

## Cuándo invocarlo

### Modo enlace (sin `--remove`)

- Justo después de `/fremi-import-template` cuando el usuario quiere **adoptar la forma de trabajar** del template (rules/skills/hooks específicos del proyecto).
- Cuando se agregan nuevos skills/rules/hooks al `/template/` y se quiere refrescar los links.
- Usuario dice "enlazá los skills del template", "exponé las rules del template", "adoptá los hooks", "linkeá lo del template".

### Modo `--remove`

- Usuario dice "quitá los skills/rules/hooks del template", "desadoptá el template", "deshacé el link", "remové lo que linkeé".
- Antes de importar un template nuevo que pueda colisionar con los assets actuales.
- Cleanup post-experimento si el template no terminó siendo lo que buscabas.

**No invocarlo si:**
- (modo enlace) El template no fue importado todavía (`/template/` no existe) → ejecutar `/fremi-import-template` primero.
- El template no tiene la estructura esperada (`/template/docs/skills`, `/template/docs/rules`, `/template/docs/hooks`).
- Se quiere crear un skill/rule/hook desde cero (no del template) → eso es `/fremi-add-skill` / `/fremi-add-hook` / `/fremi-add-rule` / `/fremi-add-mcp`.
- (modo `--remove`) Se quiere borrar un asset creado por `/fremi-add-skill` / `/fremi-add-hook` / `/fremi-add-rule` / `/fremi-add-mcp` → este skill **no toca esos** porque no apuntan a `/template/`; borrarlos a mano con `rm` y limpiar referencias en CLAUDE.md y `.claude/settings.json` según corresponda.

## Topología resultante

```
/template/docs/skills/<name>/SKILL.md            ← ÚNICO ARCHIVO REAL
/template/docs/rules/<name>.mdc                  ← real
/template/docs/hooks/<name>/                     ← real

docs/project/skills/<name>                       → symlink → ../../../template/docs/skills/<name>
docs/project/rules/<name>.mdc                    → symlink → ../../../template/docs/rules/<name>.mdc
docs/project/hooks/<name>                        → symlink → ../../../template/docs/hooks/<name>

.claude/skills/<name>                            → symlink → ../../docs/project/skills/<name>
                                                   (cadena resuelve a /template/...)
```

> Cualquier edición debe hacerse en `/template/docs/...`. Editar a través de los symlinks toca el archivo real del template — lo que probablemente es lo que querés (es la fuente de verdad para los assets adoptados).

## Procedimiento

### Paso 0 — Validar precondiciones

1. Verificar que `/template/` existe en la raíz del proyecto. Si no → avisar al usuario que ejecute `/fremi-import-template` primero. Abortar.
2. Verificar que `/template/docs/` existe. Si no → avisar que el template no sigue la convención esperada. Abortar.
3. Resolver `tipo` (si fue pasado) o el array de tipos a procesar (default: `[skills, rules, hooks]`).
4. Validar `tipo` ∈ `{skills, rules, hooks}` si se pasó. Si no, abortar mostrando opciones válidas.

### Paso 1 — Para cada tipo a procesar, validar la fuente

Para cada `<type>` en la lista:

1. Verificar que `/template/docs/<type>/` existe. Si no:
   - Avisar al usuario que el template no tiene assets de ese tipo y **continuar con los otros tipos** (no abortar global).
2. Listar los items (archivos o carpetas) dentro de `/template/docs/<type>/`.
   - Para `skills`: cada subdir con un `SKILL.md` dentro.
   - Para `rules`: cada archivo `.mdc` o `.md`.
   - Para `hooks`: cada subdir o archivo ejecutable.
3. Excluir `README.md` y otros archivos no-asset (heurística: si no parece skill/rule/hook, saltar y reportar).

### Paso 2 — Detección de colisiones (antes de crear cualquier symlink)

Para cada item detectado en Paso 1:

1. **Colisión con metodología (`~/.fremi/framework/framework/<type>/<same-name>`):** si existe → **abortar todo el skill** (no procesa nada). Mostrar al usuario:
   - Cuál es el item conflictivo.
   - Sugerencia: renombrar el item en `/template/docs/<type>/` antes de re-invocar.
   - Razón de abortar: dos sources distintos con mismo nombre confunde a Claude Code y al lector.

2. **Colisión con un link previo (`docs/project/<type>/<same-name>` ya existe):**
   - Si es un symlink que **ya apunta al mismo target** → saltar (idempotente, no es error).
   - Si es un symlink a otro target o un archivo real → **abortar** y avisar al usuario con sugerencia: borrar manualmente lo que esté ahí o renombrar el del template.

Si hay colisiones, **no procesar ningún tipo**. Es atómico: o todo o nada.

### Paso 3 — Crear symlinks en `docs/project/<type>/`

Para cada item validado:

1. Asegurar que `docs/project/<type>/` existe (crearla con `mkdir -p` si no).
2. Crear symlink:
   - **Skills:** `ln -s ../../../template/docs/skills/<name> docs/project/skills/<name>`.
   - **Rules:** `ln -s ../../../template/docs/rules/<name>.mdc docs/project/rules/<name>.mdc` (mantener extensión `.mdc` o `.md` original).
   - **Hooks:** `ln -s ../../../template/docs/hooks/<name> docs/project/hooks/<name>`.
3. Verificar que el symlink resuelve (lee correctamente el archivo target).

### Paso 4 — Exponer al agente según el tipo

#### Si `type = skills`:

1. Verificar estado de `.claude/skills/`:
   - Si es symlink (estado heredado) → convertir a folder-of-symlinks (mismo procedimiento que `/fremi-add-skill` / `/fremi-add-hook` / `/fremi-add-rule` / `/fremi-add-mcp`):
     - `rm .claude/skills`
     - `mkdir .claude/skills`
     - Para cada subdir en `~/.fremi/framework/framework/skills/`: `ln -s ../../~/.fremi/framework/framework/skills/<frmwk-skill> .claude/skills/<frmwk-skill>`.
   - Si ya es carpeta: continuar.
2. Para cada skill nuevo: `ln -s ../../docs/project/skills/<name> .claude/skills/<name>`.
3. Verificar que `.claude/skills/<name>/SKILL.md` se lee correctamente (cadena resuelve hasta `/template/`).

#### Si `type = rules`:

1. **No tocar `.claude/rules/`** — Claude Code no autodescubre rules ahí. Se cargan vía referencias en `CLAUDE.md`.
2. Leer `CLAUDE.md` del root del proyecto.
3. Buscar la sección `## Project rules`. Si no existe, crearla al final del archivo con el encabezado:

   ```markdown
   ## Project rules

   Reglas específicas de este proyecto (linkeadas desde `/template/` u creadas con `/fremi-add-skill` / `/fremi-add-hook` / `/fremi-add-rule` / `/fremi-add-mcp`). Cargadas automáticamente desde `docs/project/rules/`.
   ```

4. Para cada rule nueva, verificar si ya está referenciada. Si no, agregar bullet:

   ```markdown
   - `docs/project/rules/<name>.<ext>` — <una línea derivada de la `description` del frontmatter del .mdc>
   ```

5. **Idempotente:** si la referencia ya existe, no duplicar.

#### Si `type = hooks`:

1. **No tocar `.claude/hooks/`** — Claude Code no autodescubre hooks ahí. Se registran en `.claude/settings.json`.
2. Para cada hook nuevo, **imprimir en el reporte** instrucciones para registrar manual en `.claude/settings.json`. Cada hook necesita: `hookEventName` (`PreToolUse`, `PostToolUse`, `Stop`, `UserPromptSubmit`, etc.) y `matcher`, datos que el usuario debe completar conscientemente.

---

## Modo `--remove` — Desenlazar assets del template

Cuando se invoca con `--remove`, el skill **invierte** el procedimiento de enlace. Es destructivo pero **acotado**: sólo toca symlinks que apunten al `/template/`. Nunca borra archivos reales, ni symlinks que apunten a otros destinos (`~/.fremi/framework/framework/`, `docs/project/` con archivos reales creados por `/fremi-add-skill` / `/fremi-add-hook` / `/fremi-add-rule` / `/fremi-add-mcp`, etc.).

### Paso R0 — Validar precondiciones (modo remove)

1. Resolver el `tipo` (si se pasó) o `[skills, rules, hooks]` (default).
2. **`/template/` puede no existir** (si el usuario ya lo borró, los symlinks quedaron rotos — igual los limpiamos).
3. Si `/template/` existe: resolver su ruta absoluta para comparar con los targets de symlinks.

### Paso R1 — Enumerar los assets a remover

Para cada tipo en la lista, hacer un **scan no destructivo** primero (sin borrar):

#### Skills (modo remove):

1. Listar entradas en `.claude/skills/`. Para cada una:
   - Si NO es symlink → **omitir** (no fue creada por este skill).
   - Si es symlink: resolver target. Si la cadena resuelve a un path dentro de `/template/docs/skills/<X>` → marcar para remover.
   - Si el target es `/template/...` pero está roto (template borrado) → **igual marcar para remover** (cleanup).
2. Idem para `docs/project/skills/`: marcar los symlinks que apunten a `/template/docs/skills/<X>`.

#### Rules (modo remove):

1. Listar entradas en `docs/project/rules/`. Para cada una:
   - Si NO es symlink → omitir.
   - Si es symlink y apunta a `/template/docs/rules/<X>` → marcar para remover.
2. Leer `CLAUDE.md`. Identificar las líneas en `## Project rules` que referencien los rules marcados (formato `- \`docs/project/rules/<name>.<ext>\` — ...`). Marcar para remover esas líneas.

#### Hooks (modo remove):

1. Listar entradas en `docs/project/hooks/`. Para cada una:
   - Si NO es symlink → omitir.
   - Si es symlink y apunta a `/template/docs/hooks/<X>` → marcar para remover.
2. **Leer y parsear `.claude/settings.json`** (si existe). Buscar entries en `hooks.<EventName>[].hooks[]` cuyo `command` referencie paths bajo `docs/project/hooks/<name>` (donde `<name>` está en la lista marcada para remover).
   - **Marcar esas entries para remover** (no sólo listarlas).
   - Si el archivo `settings.json` tiene sintaxis no estándar (comentarios JSONC, trailing commas, etc.) → degradar a "listar manual" y avisar (no editar para evitar corromper).
   - Si `settings.json` no existe → no hay nada que limpiar (no es error).

### Paso R2 — Preview + confirmación (recomendado)

Antes de borrar, **mostrar al usuario** el resumen:

```
⚠️ Modo --remove: se van a desenlazar los siguientes assets del template.

Skills a remover (<N>):
  - .claude/skills/<name>  (symlink)  →  /template/...
  - docs/project/skills/<name>  (symlink)  →  /template/...
  ...

Rules a remover (<N>):
  - docs/project/rules/<name>.<ext>  (symlink)  →  /template/...
  + 1 referencia removida de CLAUDE.md § Project rules
  ...

Hooks a remover (<N>):
  - docs/project/hooks/<name>  (symlink)  →  /template/...
  + N entries en .claude/settings.json (hooks.<EventName>[]) que referenciaban los borrados → SE LIMPIAN auto (con backup defensivo).
    Vista previa de las entries afectadas:
      - hooks.PostToolUse[].hooks[] cuyo command es "bash .../docs/project/hooks/<name>/hook.sh"
      ...
  ...

Items que NO se tocan (creados por /fremi-tools o externos): <lista>
Settings keys NO tocadas: permissions, env, modelo, etc. (sólo se toca hooks.<EventName>[]).

¿Confirmás la remoción? (y/N)
```

Si el usuario no confirma → abortar sin borrar nada.

> **Excepción a la confirmación:** si el skill se invoca con `--remove --yes` o similar (futuro), saltar el prompt. Por ahora, **siempre pedir confirmación** en modo remove.

### Paso R3 — Ejecutar la remoción

Tras confirmación:

#### Skills:

1. Para cada symlink marcado en `.claude/skills/<name>`: `rm` (sólo borra el symlink, no el target).
2. Para cada symlink marcado en `docs/project/skills/<name>`: `rm`.

#### Rules:

1. Para cada symlink marcado en `docs/project/rules/<name>.<ext>`: `rm`.
2. Editar `CLAUDE.md`:
   - Remover las líneas marcadas dentro de `## Project rules`.
   - Si después de la remoción la sección queda **sólo con el encabezado + párrafo intro** (sin bullets) → **remover la sección entera** (encabezado, párrafo y línea en blanco siguiente).
   - Si quedan bullets (porque hay rules de `/fremi-add-skill` / `/fremi-add-hook` / `/fremi-add-rule` / `/fremi-add-mcp` u otros sources) → conservar la sección.

#### Hooks:

1. Para cada symlink marcado en `docs/project/hooks/<name>`: `rm`.
2. **Editar `.claude/settings.json` para limpiar entries** que referencian los hooks removidos (procedimiento detallado abajo).

##### Procedimiento detallado de cleanup de `.claude/settings.json`:

1. **Backup defensivo:** copiar `.claude/settings.json` a `.claude/settings.json.bak` antes de modificar. Si el cleanup falla, el usuario tiene el archivo original.
2. **Parsear** el JSON. Si falla (sintaxis no estándar, JSONC, trailing commas) → abortar el cleanup automático, restaurar del bak, y degradar a "listar manual" (informar al usuario para que lo haga a mano).
3. **Filtrar las entries** dentro de `hooks.<EventName>[].hooks[]`:
   - Remover cada entrada cuyo `command` contenga `docs/project/hooks/<name>` para algún `<name>` en la lista marcada para remover.
   - Match flexible: el `command` puede ser `bash /abs/path/.../docs/project/hooks/<name>/hook.sh` o relativo — buscar la subsecuencia.
4. **Limpieza en cascada:**
   - Si una entrada `{ matcher, hooks: [...] }` queda con `hooks: []` después del filter → remover la entrada entera del array.
   - Si `hooks.<EventName>` queda con array vacío `[]` → remover la key `<EventName>`.
   - Si `hooks` queda como objeto vacío `{}` → conservar la key vacía (no quitar `hooks` del settings, mantiene la estructura).
5. **Escribir el resultado** con formato JSON indentado (2 espacios, igual al original).
6. **Borrar el backup** `.claude/settings.json.bak` si todo salió OK; conservarlo si hubo cualquier error.

##### Casos edge (settings.json):

- **`.claude/settings.json` no existe** → no hay nada que limpiar (no es error).
- **`hooks` no existe en settings.json** → no hay nada que limpiar.
- **Una entry referencia un hook que NO está en la lista de removidos** → preservar intacta.
- **Una entry de la cadena tiene un `command` con un path RELATIVO** que matchea → igual remover (el filtro busca por subsecuencia del string).
- **El array de entries está vacío después del filter pero antes había contenido** → eliminar la cascada (matcher block → eventName key) según las reglas de arriba.

### Paso R4 — Reportar al usuario (modo remove)

```
✅ Assets desenlazados del template

🗑️ Skills removidos (<N>):
   - .claude/skills/<name>  (symlink removido)
   - docs/project/skills/<name>  (symlink removido)
   ...
   El archivo real en /template/docs/skills/<name>/SKILL.md NO fue tocado.

🗑️ Rules removidos (<N>):
   - docs/project/rules/<name>.<ext>  (symlink removido)
   - CLAUDE.md: <N> referencias removidas de "## Project rules"
   - Sección "## Project rules" en CLAUDE.md: <conservada / removida porque quedó vacía>

🗑️ Hooks removidos (<N>):
   - docs/project/hooks/<name>  (symlink removido)

🧹 .claude/settings.json: <N> entries removidas (hooks.<EventName>[]) que referenciaban los hooks borrados.
   - Backup defensivo creado y borrado al terminar OK.
   - Limpieza en cascada aplicada: matchers vacíos → removidos; eventNames sin matchers → removidos.
   - (Si settings.json tenía JSONC/sintaxis no estándar: degradado a "listar manual" y se restauró del backup. Revisar abajo.)

⚠️ (Sólo si degradado a manual) Entries en .claude/settings.json que referencian paths borrados — revisar a mano:
   - <command> que referencia docs/project/hooks/<name>/hook.sh
   ...

Items NO tocados:
   - <N> skills/rules/hooks creados por /fremi-tools o externos (no apuntan a /template/).
   - El propio /template/ NO fue tocado — los archivos reales siguen intactos.

Próximos pasos:
- Si querés también borrar /template/: `rm -rf /template/` (manual).
- Si querés re-linkear: /fremi-link-template-assets (sin --remove).
```

### Validaciones específicas del modo remove

- **Symlink rotos (target inexistente):** se tratan igual que symlinks válidos — se eliminan. Razón: si el target del symlink dice `/template/docs/...` pero `/template/` ya fue borrado, igual sabemos que el symlink fue creado por este skill.
- **Archivo real en lugar de symlink:** si en `docs/project/skills/<name>` hay una carpeta REAL (no symlink), **no la toca** — fue creada por `/fremi-add-skill` / `/fremi-add-hook` / `/fremi-add-rule` / `/fremi-add-mcp` u otro proceso. Reportar en "Items NO tocados".
- **Symlink apuntando a otro destino que no sea `/template/`:** no se toca. Por ejemplo, si alguien linkeó manualmente a otro repo, eso no es de este skill.
- **`/template/` no existe:** seguir adelante con la remoción (los symlinks están rotos pero apuntan a paths bajo `/template/`).
- **`CLAUDE.md` no es legible:** abortar — no podemos limpiar referencias sin leer el archivo.
- **Atómico:** si en medio de la remoción algo falla, idealmente rollback. En la práctica, los `rm` de symlinks son operaciones individuales — si una falla, las demás ya hechas no se revierten (limitación aceptable: el usuario puede re-invocar el skill para limpiar el resto, es idempotente).

### Paso 5 — Reportar al usuario

Imprimir:

```
✅ Assets del template enlazados

🔗 Skills enlazados a docs/project/skills/ y expuestos en .claude/skills/:
   - <name1> → /template/docs/skills/<name1>/SKILL.md
   - <name2> → /template/docs/skills/<name2>/SKILL.md
   (total: <N>)

🔗 Rules enlazados a docs/project/rules/ y referenciados en CLAUDE.md:
   - <name1>.<ext> → /template/docs/rules/<name1>.<ext>
   (total: <N>)
   ⚠️ CLAUDE.md actualizado bajo "## Project rules" con <N> referencias nuevas.

🔗 Hooks enlazados a docs/project/hooks/ (NO auto-registrados):
   - <name1> → /template/docs/hooks/<name1>
   (total: <N>)
   ⚠️ Para activarlos, agregá esto a .claude/settings.json por cada hook:
   { "hooks": { "<HookEventName>": [ { "matcher": "<pattern>", "hooks": [
     { "type": "command", "command": "<ruta absoluta a docs/project/hooks/<name>>" }
   ] } ] } }

🔄 Estado de .claude/skills/: (si hubo conversión, mencionar)
   - Antes: symlink a ~/.fremi/framework/framework/skills.
   - Después: carpeta con N symlinks individuales (M de frmwk + <N> del template).

⏭️ Tipos saltados:
   - <type>: no existe /template/docs/<type>/ — el template no provee assets de este tipo.

⚠️ Conflictos resueltos:
   - <items que ya estaban linkeados al mismo target — saltados idempotentemente>

Próximos pasos:
1. Verificar que los skills se invocan correctamente (escribir /<skill-name> en chat).
2. Para hooks: registrar manualmente cada uno siguiendo el bloque de arriba.
3. Si querés crear assets NUEVOS específicos del proyecto (no del template) → /fremi-tools.
```

## Validaciones

- **`/template/` no existe** → abortar; sugerir `/fremi-import-template <ruta>` primero.
- **`/template/docs/` no existe** → abortar; el template no sigue la convención esperada.
- **`tipo` inválido** → abortar; mostrar valores válidos.
- **Colisión con `~/.fremi/framework/framework/<type>/<name>`** → abortar **todo el skill** (atómico); sugerir renombrar en el template.
- **Colisión con un link previo en `docs/project/<type>/<name>` apuntando a otro target** → abortar; pedir resolución manual.
- **`CLAUDE.md` no es legible** (cuando `type=rules`) → abortar con error claro.
- **No crear nada que toque `~/.fremi/framework/framework/`, `docs/works/`, `/template/`** — esos quedan inmutables.
- **Symlinks atómicos:** crear todos los symlinks de una vez al final del Paso 3-4. Si algún paso falla a mitad, rollback de los symlinks ya creados en esta invocación.

## Reglas

- **El único archivo real es el de `/template/`.** Todo lo demás son symlinks.
- **No se duplica contenido.** Editar un asset = editar en `/template/docs/<type>/<name>` (a través del symlink, o directo).
- **Skills colisionando con frmwk = abortar.** No se renombran automáticamente — el usuario decide.
- **Linkear es seguro y reversible.** `rm` del symlink no toca el archivo real del template.
- **Idempotente:** invocar el skill múltiples veces sin cambios en `/template/` no genera duplicados ni errores.
- **Atómico:** si un tipo falla, los otros tipos válidos sí se procesan; pero dentro de un mismo tipo, si una colisión aborta, no se procesa nada de ese tipo.
- **`--remove` sólo toca symlinks que apunten a `/template/`.** Archivos reales en `docs/project/` (creados por `/fremi-add-skill` / `/fremi-add-hook` / `/fremi-add-rule` / `/fremi-add-mcp` u otros) **no se tocan**. La operación está acotada al alcance del skill — no hace cleanup global.
- **`--remove` no toca `/template/`.** Es el archivo real importado — respetar.
- **`--remove` SÍ toca `.claude/settings.json`** para limpiar entries que referencian hooks removidos (con backup defensivo). Si el archivo tiene sintaxis no estándar (JSONC, comentarios, trailing commas) → degradar a "listar manual" + restaurar del backup, **NO editar a ciegas**. Otras keys del settings.json (`permissions`, `env`, etc.) **nunca se tocan**.
- **`--remove` siempre pide confirmación.** Es una operación destructiva (aunque limitada a symlinks); preview obligatorio antes de borrar.

## Diferencia con `/fremi-add-skill` / `/fremi-add-hook` / `/fremi-add-rule` / `/fremi-add-mcp`

| | `/fremi-tools <type> <name>` | `/fremi-link-template-assets [type]` |
|---|---|---|
| **Crea** | Asset NUEVO desde cero, archivo real en `docs/project/<type>/<name>` | Symlinks; el archivo real vive en `/template/docs/<type>/<name>` |
| **Fuente** | Templates inline del skill | `/template/` (importado vía `/fremi-import-template`) |
| **Cuándo** | Necesitás un asset propio del proyecto, sin un template externo | Querés adoptar lo que ya viene en un template importado |
| **Cantidad** | 1 a la vez | Bulk (todos los de un tipo o los 3 tipos a la vez) |
| **Exposición a `.claude/`** | Idéntica (skill → `.claude/skills/`, rule → CLAUDE.md, hook → instrucciones) | Idéntica |
