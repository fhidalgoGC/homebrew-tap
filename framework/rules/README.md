# `~/.fremi/framework/rules/` — Reglas duras de la metodología

> **Esta carpeta es configuración para los agentes (IA).** Los archivos `.md` acá son reglas que la IA **debe aplicar obligatoriamente** al trabajar en el proyecto. No son documentación opcional ni guías sugeridas.
>
> Este README es para humanos: explica qué reglas hay, dónde se cargan, y cómo extender.

---

## Contenido

| Archivo | Propósito |
|---|---|
| `workflow.md` | Reglas 1–12 del flujo de trabajo: jerarquía 3-capas, orden de creación, principio rector, Regla 3b (ADRs vía bifurcación), Regla 6 (cadena BDD→SDD→Design), Regla 11 (closure), Regla 12 (sync-back). |
| `README.md` | Este archivo. |

---

## ¿Quién lee estos archivos?

- **CLAUDE.md** (raíz del proyecto) referencia explícitamente `~/.fremi/framework/rules/workflow.md` como "**Reglas duras**" que deben leerse antes de cualquier acción no trivial. Esto carga las reglas automáticamente en el contexto de la IA.
- **Skills** (`~/.fremi/framework/skills/*/SKILL.md`) referencian secciones específicas (ej: "ver Regla 6 en `~/.fremi/framework/rules/workflow.md`").
- **Humanos** consultan estos archivos cuando quieren entender por qué la IA pide crear un doc previo o pausar antes de implementar.

---

## Relación con otros docs

| Archivo | Diferencia |
|---|---|
| `~/.fremi/framework/rules/workflow.md` (este) | **Reglas obligatorias.** "Antes de N, debe existir N-1." Son normativas. |
| `~/.fremi/framework/flows/workflow.md` | **Descripción del flujo.** Explicativo, didáctico. Muestra cómo se hace, cuándo, con qué resultado. |
| `~/.fremi/framework/settings/methodology.core.yaml` | **Configuración de nomenclatura.** Datos estructurados (prefijos, formatos). No tiene reglas — tiene parámetros. |
| `CLAUDE.md` (raíz) | **Punto de entrada para los agentes.** Sintetiza qué leer y qué comportamiento aplicar. |

Una regla nueva va a `rules/workflow.md`. Una explicación didáctica de cómo se aplica esa regla va a `flows/workflow.md`. Un parámetro configurable (ej: padding de dígitos) va a `settings/methodology.core.yaml`.

---

## Cómo agregar una regla

1. Numerar secuencialmente: la última hoy es **Regla 12 (sync-back)**. La próxima sería **Regla 13**.
2. No reciclar números — si una regla se reemplaza, marcarla `Reemplazada por Regla X` y crear una nueva con número siguiente.
3. Estructura obligatoria de cada regla:
   - **Título corto** (qué prohíbe o impone).
   - **Justificación** (por qué existe — el problema que evita).
   - **Procedimiento** (cómo se aplica concretamente).
   - **Anti-patrones** (qué NO hacer que viola la regla).
   - **Ejemplos** (cuando ayudan a entender un borde).
4. Si la regla introduce una excepción a otra regla, mencionar explícitamente cuál y por qué.
5. Reflejar la regla nueva en `CLAUDE.md` (sección "Comportamiento esperado") y posiblemente en `~/.fremi/framework/flows/workflow.md` si necesita explicación didáctica.

### Cuándo NO crear una regla

- La situación se resuelve con una skill existente.
- Es preferencia de estilo (poner en convenciones del lenguaje, no acá).
- Aplica sólo a una feature (acotar a `FT-XX_<slug>/decisions.md` o al doc de la feature).

---

## Cómo modificar una regla existente

- **Cambio menor (clarificación, ejemplo agregado)** → editar en el lugar; no cambia el número.
- **Cambio que invierte o redefine la regla** → crear una regla nueva con número siguiente y marcar la vieja como reemplazada. No reescribir la regla original — eso pierde rastro histórico.

---

## Anti-patrones de esta carpeta

- ❌ Documentación general del flujo (eso va a `~/.fremi/framework/flows/`).
- ❌ Configuración parametrizable (eso va a `~/.fremi/framework/settings/`).
- ❌ Decisiones técnicas del producto (eso va a `docs/works/product/decisions.md`).
- ❌ Reglas opcionales / sugerencias (las reglas acá son **obligatorias**; lo opcional va a otro lado).
