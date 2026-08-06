# Reglas del flujo de reverse-engineering — makingFileReport

> **Documento de referencia:** `~/.fremi/framework/flows/flow.reverse.md`, `~/.fremi/framework/pipelines/pipeline.reverse.*.md`, `~/.fremi/framework/reverse-engineering/`.
>
> Este archivo contiene reglas **específicas del flujo de reverse-engineering** — la vía canónica para alinear código pre-existente al framework. Se lee **en adición** a `rules/workflow.md` (reglas forward). Ambos archivos son obligatorios.

---

## Contexto

Cuando en un proyecto ya existe **código en producción** (o mergeado a main) que **no siguió el flow forward** — porque nació antes del framework, porque una IA escribió el endpoint sin ciclo, porque hubo una urgencia de release, etc. — el framework provee un **conjunto paralelo de skills, un flow, 4 pipelines y un config propio** para reconstruir los docs y **alinear ese código al framework como si el flow se hubiera seguido desde el principio**.

Reverse-engineering **NO es procedimiento excepcional** — es una **vía formal de alineación**. Estas reglas gobiernan cómo se ejerce.

---

## Regla 25 — Reverse-engineering es vía formal de alineación del código al framework

Cuando existe trabajo real (endpoint, feature, product, tooling, bug fixeado, enabler técnico) **sin sus docs del flow correspondientes**, reverse-engineering es el camino canónico para alinearlo. Tiene sus propios artifacts:

- **6 skills**: `/fremi-reverse-story`, `/fremi-reverse-feature`, `/fremi-reverse-bug`, `/fremi-reverse-enabler`, `/fremi-reverse-product`, `/fremi-reverse-extra`.
- **4 pipelines**: `/fremi-pipeline-reverse-product`, `/fremi-pipeline-reverse-feature`, `/fremi-pipeline-reverse-story`, `/fremi-pipeline-reverse-enabler`. Bug y extra son de un solo archivo — se invoca el skill directo.
- **1 flow**: `~/.fremi/framework/flows/flow.reverse.md` con las 6 fases canónicas.
- **1 config**: `~/.fremi/framework/settings/config.reverse.yaml` con defaults, skills declarados y políticas transversales.
- **1 hook** (opcional): `check-reverse-alignment.sh` valida post-reverse (Regla 17 aplicada, gaps reportados, coherencia de ancestor).

### Precondición dura

Reverse **NO se usa para trabajo en curso**. Precondiciones:

1. **El trabajo está en producción o mergeado a main** (o al menos en un branch de release confirmado). Trabajo experimental que sigue cambiando no debe reverse-engineerarse — usar el flow forward.
2. **Framework instalado** (Regla 24) — reverse skills están en `.claude/skills/fremi-reverse-*` y `/fremi-install-framework` corrió.
3. **Se puede identificar la capa correcta** (product / feature / story / enabler / bug / extra). Si no está claro dónde encaja el trabajo, preguntar al usuario antes de arrancar.

### Post-condición dura

Después de correr reverse, el estado del repo debe ser **indistinguible del que dejaría el flow forward** en términos de completitud de artifacts, excepto por la marca de trazabilidad:

- Todos los docs del flow correspondiente existen con contenido real (no placeholders).
- Frontmatter completo (Regla 17) — versión, timestamps, ancestor.
- Padres bumpeados según `parent_bump_triggers`.
- CAs sin test asociado reportados como gaps al usuario (no ocultados).

---

## Regla 26 — Default `--transparent` — trazabilidad histórica visible

Los docs generados por skills/pipelines de reverse llevan por default el frontmatter extendido:

```yaml
---
version: 1.0.0
created: 2025-11-20                # fecha inferida del git history
last_updated: 2026-08-05           # fecha en que corrió reverse
doc_type: snapshot
ancestor:
  id: FT-05
  version_at_creation: "2.1.0"
reverse_engineered: true
reverse_engineered_at: 2026-08-05
reverse_engineered_source: git-history+tests
reverse_engineered_confidence: 0.85
---
```

**Por qué default transparent** (y no stealth):

- **Regla 10** — los docs son fuente de verdad; su origen forma parte de esa verdad. Ocultar que fueron reverse deforma la trazabilidad histórica.
- **Auditoría** — retrospectivas, análisis de deuda técnica y compliance necesitan saber qué se planificó vs qué se derivó.
- **Confianza limitada** — reverse infiere del código; el resultado tiene incertidumbre. `reverse_engineered_confidence` transporta esa señal a lectores futuros.

### Override explícito

El modo `--stealth` sigue disponible como override por invocación **cuando el usuario lo declara explícitamente**:

```
/fremi-reverse-story FT-05 HU-03 --stealth
/fremi-pipeline-reverse-story FT-05/HU-03 --stealth
```

Con `--stealth`, los docs quedan indistinguibles de un flow forward normal (no se agrega el bloque `reverse_engineered.*` al frontmatter). Uso legítimo: proyectos que quieren "borrar" el historial de que arrancó desconordenado — con conciencia del trade-off.

### Override por proyecto

El proyecto puede setear en `~/.fremi/framework/settings/config.reverse.yaml`:

```yaml
default_mode: transparent   # framework default
# default_mode: stealth     # overridable por proyecto si tiene motivo declarado
```

**Cambiar el default a `stealth` a nivel proyecto requiere justificación en un ADR** (Regla 3b — bifurcación de política).

---

## Regla 27 — Preguntas dirigidas para gaps no-inferibles

Reverse **infiere** del código, tests, commits, PRs y docs sueltos. Cuando la información **no está en esos artifacts**, la skill/pipeline debe **preguntar al usuario** — nunca inventar. Gaps típicos que requieren pregunta:

1. **`So that` del `FW-01_definition`** — el propósito de negocio no se puede inferir del código. Preguntar al usuario o dejar `TBD` con nota de gap.
2. **Iniciativa asociada (`init-XXX`)** — a qué hipótesis de negocio pertenece este trabajo. Preguntar o dejar sin vincular con warning.
3. **Motivación de un ADR** — el código muestra la decisión implementada; no el por qué. Preguntar el rationale.
4. **CAs sin test asociado** — si un CA obvio no está cubierto en tests, preguntar si es gap real (falta test) o CA fantasma (el negocio no pidió eso, el dev lo agregó por su cuenta).
5. **RNFs medibles** — latencia esperada, throughput, tamaños de payload — no derivables del código en general. Preguntar valores.
6. **Origen de la story vs la feature** — si hay ambigüedad sobre a qué feature pertenece un endpoint, preguntar.

**Anti-patrón**: inventar `So that`, motivación de ADR o CAs para "completar" el doc. Reverse tiene que declarar los gaps, no rellenarlos.

---

## Regla 28 — Reverse NO reemplaza revisión humana

El output de reverse es **base**, no verdad final. El usuario **debe revisar**:

- Los `SC-XXX` de BDD reconstruidos de tests — pueden reflejar "cómo el dev lo implementó" en vez de "cómo lo espera el negocio".
- Los edge cases que **no** aparecen (los que el dev no pensó → sin test → sin SC-XXX). Son gaps invisibles.
- El wording de `FW-01_definition` — reverse tiende a producir descripciones técnicas; el negocio debería sonar a negocio.
- Los ADRs derivados — el skill infiere que se tomó una decisión; el usuario confirma si esa fue la decisión real o accidental.

Los skills/pipelines de reverse deben **reportar los gaps al usuario** al terminar, no ocultarlos. Ver Regla 27 (gaps declarados) + Regla 29 (Regla 8 inconstruible).

---

## Regla 29 — Regla 8 (test rojo primero) es inconstruible retroactivamente

Regla 8 exige, al fixear un bug, escribir primero un test rojo que reproduzca el bug y después el fix. Si el bug ya se fixeó sin ese ciclo, **no se puede recrear el test rojo** — el código actual pasa el test.

`/fremi-reverse-bug` documenta esta limitación explícitamente en el `BG-XX_<slug>.md` que reconstruye:

- Sección "Reproducción / test rojo" → marca `no reconstruible retroactivamente — bug reverse-engineered`.
- Sección "Cierre" → recomienda al usuario correr `git log --oneline -p <archivo>` para intentar recuperar la versión pre-fix y escribir el test contra ella (esfuerzo manual, no automatizable).

**No pretender que se cumplió Regla 8** cuando reverse-bug no puede hacerlo. Marcar el gap explícitamente.

---

## Regla 30 — Regla 17 (versionado + linaje) SÍ aplica en reverse

A diferencia de la Regla 8, la Regla 17 sí es reconstruible con timestamps inferidos:

- `created` = fecha del primer commit relacionado (via `git log --diff-filter=A --follow -- <archivo>`).
- `last_updated` = fecha del último commit relacionado (o la fecha de la corrida de reverse si el archivo sigue creciendo).
- `version` = `1.0.0` para snapshots (docs FW-XX, EN-XX, BG-XX), `0.1.0` para docs living en su primer estado.
- `ancestor.version_at_creation` = versión del padre en la fecha inferida (usando git blame sobre el frontmatter del padre, o versión actual como fallback con warning).
- Changelog para docs living: entradas retroactivas por commit relacionado si el usuario habilita `--from-git-history`.

**Cuando reverse cierra un doc snapshot** (ej: firma `FW-10_closure.md` reconstruido), debe **bumpear el padre** exactamente como el flow forward — `parent_bump_triggers` no distingue entre closure normal o reverse.

Si no hay git history disponible (`.git` ausente), reverse aborta esta fase con warning y pide al usuario que provea fechas manuales, o setea todo a "hoy" con `reverse_engineered_confidence: 0.3`.

---

## Regla 31 — Reverse NO se usa para trabajo nuevo

Reverse es **exclusivamente para trabajo pre-existente sin docs**. No puede usarse para:

- ❌ **Feature nueva que se va a arrancar** — usar `/fremi-pipeline-feature` o `/fremi-feature`.
- ❌ **Bug con fix aún no aplicado** — usar `/fremi-story-bug` o `/fremi-feature-bug` + Regla 8 (test rojo primero).
- ❌ **Refactor sin cambio de comportamiento** — Regla 9 (no requiere docs nuevos).
- ❌ **"Rellenar" un doc que se salteó del flow forward en curso** — completar el doc a mano y arrancar el siguiente step del flow forward. Reverse no es atajo para saltar etapas actuales.

Si el equipo se ve tentado a usar reverse rutinariamente para "regularizar" trabajo reciente que arrancó fuera del flow, **la disciplina del flow forward está rota** — hay que corregir eso, no compensar con reverse. Ver anti-patrones abajo.

---

## Regla 32 — Ratio reverse/forward — señal de salud del framework

Un proyecto sano tiene **>95% de artifacts producidos por el flow forward** y **<5% reverse-engineered**. Si el ratio se desliza (ej: 20% de las stories son reverse), es señal de:

- La IA está saltando el flow al ejecutar pedidos ("hacé el endpoint X" sin ciclo previo).
- El equipo prioriza velocidad sobre disciplina.
- El framework no está adaptado al modo de trabajo real (revisar `config.<capa>.yaml`).

**El hook `check-reverse-alignment.sh` reporta el ratio al correr `audit-on-stop.sh`** (opcional). No es bloqueante — es señal.

**Umbral sugerido** (declarable en `config.reverse.yaml`):

```yaml
health:
  reverse_ratio_warning: 0.15    # >15% reverse → warning
  reverse_ratio_critical: 0.30   # >30% reverse → críticos (framework no está siendo respetado)
```

---

## Anti-patrones de reverse-engineering

- ❌ **Usar reverse como forma habitual de trabajar.** Reverse es para trabajo pre-existente, no para saltar el flow y "arreglarlo después".
- ❌ **Marcar como reverse trabajo que sí siguió el flow.** Si el flow se respetó, no hay nada que reverse-engineerar.
- ❌ **Invocar reverse sin git history** para trabajo antiguo cuya evolución no se puede rastrear — el resultado tiene confidence bajísimo. Preguntar al usuario si igual quiere avanzar.
- ❌ **Bajar la confianza a `1.0`** en `reverse_engineered_confidence` — ese valor es para docs producidos por el flow forward, no reverse.
- ❌ **Ocultar gaps** al usuario al reportar. Reverse debe declararlos, no completarlos silenciosamente.
- ❌ **Reverse-engineerar un bug sin marcar Regla 29** — pretender que Regla 8 se cumplió cuando no es reconstruible.
- ❌ **Correr un pipeline reverse en modo `--stealth` sin decisión explícita del proyecto.** Default es `transparent` por Regla 26; cambiarlo requiere ADR.

---

## Cómo aplicar estas reglas

Antes de invocar cualquier skill o pipeline de reverse:

1. **Verificar precondición dura** (Regla 25): trabajo está mergeado/producción, framework instalado, capa identificada.
2. **Elegir el skill/pipeline correcto** según el alcance del trabajo huérfano:
   - 1 story → `/fremi-reverse-story` o `/fremi-pipeline-reverse-story`.
   - 1 feature completa → `/fremi-pipeline-reverse-feature`.
   - Producto entero → `/fremi-pipeline-reverse-product` (interactive fuertemente recomendado).
   - Enabler técnico ya montado → `/fremi-pipeline-reverse-enabler` o skill suelto.
   - Bug ya fixeado → `/fremi-reverse-bug` (declara Regla 29).
   - Tooling / EX ya aplicado → `/fremi-reverse-extra`.
3. **Correr en modo `transparent` (Regla 26)** salvo decisión explícita.
4. **Responder gaps** cuando el skill/pipeline pregunte (Regla 27). No inventar respuestas.
5. **Revisar el output** (Regla 28) — reverse produce base, no verdad final.
6. **Cerrar los padres** cuando aplique (Regla 30 — versionado retroactivo respeta parent_bump_triggers).

## Referencias

- `~/.fremi/framework/rules/workflow.md` — reglas del flow forward (Regla 1-24). Se aplican **también** durante reverse cuando corresponda (Regla 17, 10, 12).
- `~/.fremi/framework/flows/flow.reverse.md` — descripción narrativa del flujo canónico de reverse.
- `~/.fremi/framework/settings/config.reverse.yaml` — config operativo de reverse.
- `~/.fremi/framework/reverse-engineering/README.md` — casos de uso + advertencias.
- `~/.fremi/framework/pipelines/pipeline.reverse.*.md` — pipelines de auto-ejecución por capa.
