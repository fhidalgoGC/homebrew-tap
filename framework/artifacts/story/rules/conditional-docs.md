# Regla de docs condicionales `explore` y `proposal` (dominio STORY)

> **Regla obligatoria 16.** Dentro de la cadena de docs de la story, dos steps son de **obligatoriedad condicional**: `explore` y `proposal`. El resto son obligatorios siempre.
>
> **Alcance:** esta regla es DOMAIN-específica de `story/`. Se carga sólo cuando se está trabajando en una story.
>
> **Nota sobre identificadores:** este archivo usa **step IDs** (`explore`, `definition`, `proposal`, `scope`, etc.) para referirse a los docs del workflow. El filename real de cada step se resuelve vía `~/.fremi/framework/settings/methodology.core.yaml → layers.story.files_in_order` y la lista de condicionales vía `layers.story.conditional_files`. Ver `.claude/rules/no-hardcoded-identifiers.md`.
>
> Ver el índice global en `~/.fremi/framework/rules/workflow.md`.

---

## Regla 16 — `explore` y `proposal` son condicionales, gobernados por `config.user.yaml`

De los steps declarados en `workflow.yaml → steps[]`, dos son de **obligatoriedad condicional**:

- **`explore`** — investigación previa (contexto del codebase, alternativas técnicas, hallazgos).
- **`proposal`** — intent + approach + decisions + impact + rollout + risk. Puente entre `definition` (por qué usuario) y `scope` (alcance detallado).

Los demás steps (`definition`, `scope`, `bdd`, `sdd`, `design`, `tdd`, `plan`, `checkwork`, `closure`) son **obligatorios siempre**.

### Fuente de verdad: `config.user.yaml` (runtime del proyecto)

`~/.fremi/framework/artifacts/story/config.user.yaml` (o su copia en `<project>/.fremi/settings/story/config.user.yaml` si el proyecto está instalado) bajo la clave `conditional_rules` declara **cuándo son obligatorios y cuándo se pueden omitir**. Es la única fuente autorizada para decidir esto; los skills que generan/validan stories leen ese archivo.

**Criterios actuales (resumen — el detalle vive en `config.user.yaml`):**

Step `explore` es OBLIGATORIO si al menos UNO aplica:
- La story toca un área del codebase que el implementador no conoce.
- Existen 2+ approaches técnicos plausibles que ameritan comparar antes de proponer.
- La story integra con una librería/servicio externo no usado antes en el proyecto.
- La story es de migración o reemplazo.

Step `proposal` es OBLIGATORIO si al menos UNO aplica:
- La story introduce un contrato externo nuevo (endpoint, evento, comando público).
- La story tiene una bifurcación técnica que dispara Regla 3b.
- La story afecta 3+ archivos no triviales o cruza módulos.
- La story cambia comportamiento visible al usuario final.
- La story tiene riesgo de rollback (migración de datos, API break).

Ambos son **opcionales** en el resto de los casos (bug fixes chicos, ajustes de configuración interna, refactors locales).

### Procedimiento cuando SÍ aplican

1. Antes de arrancar la story, evaluar los criterios de arriba. Si aplica alguno → crear el doc.
2. `explore` se escribe ANTES que `definition` (el explore informa el definition — codebase real puede reencuadrar el problema).
3. `proposal` se escribe DESPUÉS de `definition` y ANTES de `scope`. El definition dice "por qué", el proposal dice "cómo alto nivel + qué decidimos + qué riesgo aceptamos", y recién ahí el scope detalla límites.
4. Si en el proposal aparecen bifurcaciones técnicas → aplica Regla 3b (pausar, opciones al usuario, ADR).

### Procedimiento cuando NO aplican

- Omitir el archivo. **No crear placeholders vacíos** con texto tipo "N/A" — un archivo ausente es señal legítima de "no aplica".
- El doc `closure` NO exige presencia de `explore`/`proposal` si no aplicaron; solo verifica su completitud si existen.

### Anti-patrones a evitar

- ❌ Escribir el doc `proposal` cuando el criterio no aplica sólo por "completitud" — es papeleo puro.
- ❌ Meter en el doc `definition` contenido que pertenece a proposal (approach, decisiones técnicas) porque no se creó el proposal.
- ❌ Copiar el doc `explore` de una story vieja porque "el codebase se ve parecido" — el explore es específico al terreno actual.
- ❌ Cambiar los criterios de obligatoriedad inline en una story — se cambian en `config.user.yaml` y se hace sweep.
