# Regla de trabajo fuera del flujo (dominio EXTRA)

> **Regla 14 — dominio-específica de la capa EXTRA.**
> Fuente original: `~/.fremi/framework/rules/optional-artifacts.md` (movida acá).
> Se lee junto con `~/.fremi/framework/rules/workflow.md` y `~/.fremi/framework/rules/framework-mechanics.md`.

---

## Regla 14 — Trabajo fuera del flujo se documenta en la carpeta `extra/`

No todo el trabajo cae en feature / story / task. Tooling, scripts, fixes de IaC, mejoras a la metodología, refactor de utilidades y limpieza de código heredado son legítimos pero no son spec-driven — no tienen un criterio "como usuario quiero... para que..." de usuario. Igual deben quedar trazados.

### Cuándo aplica

Va a la carpeta `extra/` (como archivo extra, numerado globalmente) cualquier trabajo que:

- **No** genera código user-facing nuevo (no es endpoint, no es bug fix con test, no es comportamiento observable).
- Pero **sí** modifica el repo de forma duradera: cambia tooling, mejora un script, ajusta IaC sin cambiar contratos externos, introduce o modifica metodología, refactoriza utilidades sin cambiar API pública, o limpia código zombi.

El formato concreto del nombre de archivo (prefijo, padding de dígitos) se configura en `~/.fremi/framework/settings/methodology.core.yaml → layers.extra.filename_pattern`. No se hardcodea acá.

### Regla "un archivo por concepto cohesivo"

- **Un archivo agrupa cambios relacionados a UN concepto.** Aunque haya varios sub-cambios atómicos, si todos responden al mismo problema, viven juntos.
- **Conceptos distintos = archivos distintos.** No fusionar trabajos no-relacionados sólo porque ocurrieron el mismo día.

Ejemplo: "mejoras al generador de Postman" (renombre + multipart override + baseUrl dinámico) es UN archivo. "Duplicar servicios" hecho la semana siguiente es otro archivo distinto.

### Estructura obligatoria del archivo

Cada archivo extra debe contener (las primeras 4 son obligatorias, las últimas 2 opcionales):

1. **Qué se hizo** — resumen ejecutivo.
2. **Por qué no es feature/story/task** — justificación de por qué cae fuera del flujo.
3. **Cambios concretos** — lista de archivos/paths con qué cambió en cada uno.
4. **Validación / cómo se probó** — comandos o pasos para verificar.
5. **Vinculaciones** (opcional, condicional según `config.user.yaml → conditional_rules.extra_linkages_when`) — ADRs, stories, otros archivos extra relacionados.
6. **Notas / aprendizajes** (opcional, condicional según `config.user.yaml → conditional_rules.extra_notes_when`) — lo que se descubrió.

Plus frontmatter informativo (Regla 17): tipo, fecha, estado, disparador, versión, ancestor.

Ver template canónico en `~/.fremi/framework/artifacts/extra/references/`.

### Numeración

La numeración de archivos extra es **global y secuencial al proyecto**. El formato (prefijo, padding) se configura en `methodology.core.yaml → layers.extra.filename_pattern`. El próximo número se calcula listando los archivos existentes en `docs/works/extra/` y tomando el máximo.

El skill `/fremi-extra` realiza este cálculo automáticamente — no hacer a mano.

### Anti-patrones a evitar

- ❌ Usar la carpeta `extra/` como excusa para saltar el flujo cuando el trabajo **sí** es spec-driven (un endpoint nuevo va a story, no a extra).
- ❌ Crear un archivo extra por cada commit chico — un concepto cohesivo puede tener N commits.
- ❌ Hacer un archivo extra que mezcla varios conceptos no-relacionados.
- ❌ Notas personales / scratch pad — la carpeta extra es para docs comprensibles por otros.
- ❌ Olvidar crear el archivo extra cuando se hace tooling. Si después de cerrar la story alguien se pregunta "cuándo cambió X y por qué", debe haber rastro.

### Cuándo `extra/` se promueve a story

Si un trabajo que arrancó como extra resulta tener comportamiento user-facing significativo, se promueve a story:
1. Crear la story con el ciclo completo de docs (flujo canónico — Regla 1).
2. Dejar el archivo extra como pointer histórico: `> Promovido a story <story-id> de <feature-id> el YYYY-MM-DD. Ver allí para el flujo completo.`
3. No borrar el archivo extra — sirve como rastro de cómo arrancó.

---

## Procedimiento al clasificar trabajo como extra

1. **Confirmar con el usuario** que el trabajo NO es spec-driven (ver preguntas en el skill `/fremi-extra`, paso "Paso 1 — Confirmar clasificación").
2. **Invocar el skill**: `/fremi-extra <slug>`. El skill calcula el número, confirma el slug, y crea el archivo con el template.
3. **Rellenar manualmente** las 4 secciones obligatorias (y las condicionales si aplican). El skill NO llena el contenido — requiere contexto humano.
4. **Si durante el trabajo aparece una bifurcación técnica** → aplicar Regla 3b (ver `~/.fremi/framework/artifacts/story/rules/adr.md`): pausar, presentar opciones, decidir con el usuario, crear ADR en el scope correcto.
5. **Al terminar** → verificar Regla 17: el archivo extra lleva frontmatter con versión, `doc_type: snapshot`, y `ancestor.id: project` con `version_at_creation` leído de la configuración del proyecto.

---

## Relación con otras reglas

| Regla | Relación |
|---|---|
| **Regla 1** (`hierarchy.md`) | La capa extra NO tiene precondición de capa superior — cualquier trabajo puede ser extra si cumple los criterios de esta regla. |
| **Regla 9** (`bug-fix-and-refactor.md`) | Un refactor que no cambia comportamiento puede documentarse en extra si es work suficientemente durable. |
| **Regla 15** (`~/.fremi/framework/artifacts/story/rules/bugs.md`) | Enablers y bugs son opcionales del flujo principal; extra es diferente — es trabajo sin As a/I want/So that ni test rojo. No confundirlos. |
| **Regla 17** (`versioning.md`) | Los archivos extra llevan frontmatter (snapshot, ancestor.id = project). |
| **Regla 18** (`framework-mechanics.md`) | El único step automatizable de extra es el scaffold (`/fremi-extra`). El relleno de secciones es `procedure_manual`, no step invocable. |
| **Regla 24** (`framework-mechanics.md`) | Verificar instalación antes de invocar `/fremi-extra`. |
