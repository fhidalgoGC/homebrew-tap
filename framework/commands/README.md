# `docs/frmwk/commands/` — Comandos custom (alternativa a skills)

> **Esta carpeta es configuración del entorno del agente.** Algunos harness exponen el concepto de "comando" además de "skill" — son atajos simples que el usuario invoca pero que no implican un procedimiento complejo. Esta carpeta los aloja.
>
> Este README es para humanos: explica la diferencia con skills, cuándo usar uno u otro, y cómo agregar uno.

---

## Estado actual

**Carpeta vacía.** Hoy el proyecto usa **skills** (`docs/frmwk/skills/`) para todo. Los comandos quedan disponibles como categoría aparte por si en el futuro aparecen atajos de bajo nivel.

---

## Diferencia con skills

| | Skill (`docs/frmwk/skills/<X>/SKILL.md`) | Comando (`docs/frmwk/commands/<X>.md`) |
|---|---|---|
| Invocación | `/<nombre>` | `/<nombre>` (idéntica) |
| Estructura | `SKILL.md` con frontmatter + procedimiento Markdown | Un archivo plano con instrucciones cortas |
| Complejidad | Procedimiento de varios pasos, validaciones, branching | Atajo simple, una o pocas acciones directas |
| Estado interno | Puede leer/escribir archivos, parsear configuración (`methodology.json`), invocar herramientas | Típicamente sin lógica condicional compleja |
| Ejemplo típico | `/fremi-feature` (crea folder + valida precondiciones + actualiza plan) | `/list-stories` (sólo lista carpetas de stories) |

**Regla práctica:** si el procedimiento cabe en 3 líneas, considerar comando. Si tiene branching o consulta configuración → skill.

---

## Cómo agregar un comando

1. Crear `docs/frmwk/commands/<nombre>.md` con instrucciones claras y cortas.
2. **Documentarlo en este README** (tabla de Contenido).
3. Wirearlo en la configuración del agente si el harness lo requiere.

### Plantilla mínima

```markdown
# /<nombre> — <descripción corta>

Cuando el usuario invoca `/<nombre>`, hacer:

1. <paso concreto>
2. <paso concreto>

Reportar el resultado al usuario en formato <X>.
```

---

## Cuándo NO crear un comando

- Es algo que el usuario puede pedir en lenguaje natural sin atajo (ej: "lista las stories" — no necesita `/list-stories`).
- Tiene branching o validación → es un **skill**.
- Es un comportamiento automático → es un **hook**.
- Es configuración estática → es un archivo en **`settings/`**.

---

## Listado de comandos

(Vacío por ahora.)

| Comando | Archivo | Propósito |
|---|---|---|
| — | — | — |
