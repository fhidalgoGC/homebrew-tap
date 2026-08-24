# Regla R15-enabler — Ciclo de vida del enabler

> **Dominio:** artifact `enabler` (`~/.fremi/framework/artifacts/enabler/`).
> Se lee junto con las reglas cross-domain de `~/.fremi/framework/rules/` (R1, R17, R10, R12, R3, R3b, R20).
>
> Esta regla se extrajo del antiguo `rules/optional-artifacts.md` (R15 — parte enabler). El archivo original fue borrado; su contenido restante está en `~/.fremi/framework/artifacts/story/rules/bugs.md` (R15-bugs) y `~/.fremi/framework/artifacts/extra/rules/extra-doc.md` (R14).
> El archivo global ahora contiene sólo la parte de bugs (pendiente de mover a `artifacts/bug/`).

---

## R15-enabler — Cuándo crear un enabler y cómo gestionarlo

Un **enabler** es trabajo técnico que **habilita capacidad futura** del producto, feature o story, pero que **no entrega valor user-facing por sí solo**.

Ejemplos: migrar a una versión mayor del runtime, levantar infraestructura compartida, montar un pipeline CI/CD, instalar una capa base (librerías de sistema, contenedores), fundación de seguridad/auth, configurar herramientas de monitoreo.

### Cuándo crear un enabler

Crear un enabler cuando **al menos UNO** de los siguientes aplica:

- El usuario lo pide explícitamente ("antes de la feature X hay que hacer Y").
- Al planificar una feature/story aparece un bloqueante técnico que no es feature/story por sí mismo.
- **Si NO se hace este trabajo, una o más features/stories quedan bloqueadas o degradadas.**

Test rápido: "¿qué pasa si NO hago este trabajo?"
- "Una feature/story queda bloqueada o degradada" → **enabler**.
- "Nada se bloquea, pero el dev experience empeora" → `extra/` (Regla 14).
- "El usuario final no recibe capacidad X" → **feature/story**.

### Cuándo NO crear un enabler

| Si el trabajo... | Entonces es... |
|---|---|
| Entrega valor user-facing (endpoint nuevo, modo de entrega, capacidad visible) | Feature o story |
| Es tooling / script / refactor que no habilita ninguna capacidad nueva | `extra/` (Regla 14) |
| Es un defecto en código de producción | Bug (ver `~/.fremi/framework/artifacts/story/rules/bugs.md`) |
| Es cambio de docs / metodología | `~/.fremi/framework/` directo o `extra/` si se documenta como work item |

### Ubicación según scope

El scope se declara al invocar el orquestador. Los formatos concretos de folder y path salen de `methodology.core.yaml → identifiers.enabler + layers.enabler.*`.

| Scope | Cuándo | Path base |
|---|---|---|
| **Global** (default) | Transversal — no pertenece a una sola feature/story | Directorio global de enablers del proyecto |
| **Feature** (flag `--feature <feature-id>`) | Habilita capacidad que aplica sólo a una feature | Carpeta `enablers/` dentro de la feature |
| **Story** (flag `--story <feature-id>/<story-id>`) | Habilita capacidad que aplica sólo a una story | Carpeta `enablers/` dentro de la story |

Los formatos de `feature-id` y `story-id` se resuelven de `methodology.core.yaml → identifiers.feature` e `identifiers.story`. No hardcodear prefijos.

**Numeración global al proyecto:** el ID del enabler es global (no local al scope) para evitar colisiones al referenciar. El próximo ID se calcula buscando en los 3 scopes — ver `workflow.yaml → step[definition]` + el orquestador.

### Estructura — cadena liviana de 4 docs

El enabler no tiene BDD/SDD/TDD separados porque no tiene comportamiento user-facing. La cadena liviana basta:

```
doc `definition`  ← qué habilita, vinculado a quién, criterios técnicos
doc `design`      ← decisiones técnicas + ADRs aplicables
doc `plan`        ← tareas atómicas con criterios verificables (Regla 7b)
doc `closure`     ← sign-off + qué quedó habilitado + bump del padre
```

Los filenames reales se resuelven de `methodology.core.yaml → layers.enabler.files_in_order[]`. Los tokens `{enabler.definition}`, `{enabler.design}`, `{enabler.plan}`, `{enabler.closure}` son simbólicos — **no hardcodear los nombres de archivo**.

Todos los docs del enabler son **snapshot**; ninguno es living.

### Procedimiento de ciclo de vida

1. **Crear el enabler:** invocar el orquestador con el scope correcto y el nombre descriptivo. El orquestador asigna ID global, crea el folder y los 4 docs scaffold.
2. **Completar el doc `definition`:** qué habilita, quién depende, criterios técnicos de aceptación.
3. **Completar el doc `design`:** decisiones técnicas que satisfacen el doc `definition`. Bifurcaciones (Regla 3b) → pausar → opciones → usuario decide → ADR → continuar.
4. **Completar el doc `plan`:** descomponer el design en tasks atómicas con criterios verificables. Cada task tiene objetivo, mapeo al design, DoD (comando/test/output), estado, y `depends_on` si aplica.
5. **Implementar (apply):** ejecutar tasks del doc `plan` en orden de dependencias.
6. **Firmar el doc `closure`:** verificar criterios técnicos del doc `definition` + 100% tasks del doc `plan`. Bumpear el padre (Regla 17).

### Restricciones del doc `design` — bifurcaciones (Regla 3b)

Durante la escritura del doc `design`, si aparece una decisión técnica con 2+ caminos viables:

1. **Pausar** la redacción en el punto exacto de la bifurcación. No elegir silenciosamente.
2. Presentar al usuario 2-3 opciones con pros/contras explícitos.
3. Esperar la elección.
4. Crear el ADR en el scope correcto (Regla 20): scope del enabler o superior si aplica a más.
5. Referenciar el ADR desde el doc `design` y continuar.

### Cierre del enabler (doc `closure`)

El enabler sigue **abierto** (en curso) mientras no exista su doc `closure` firmado con:

1. **Verificación de criterios técnicos** del doc `definition` — cada criterio mapeado a evidencia concreta (comando que pasa, infra que existe, output verificable).
2. **100% tasks del doc `plan`** en estado completado — sin tasks pendientes ni en curso.
3. **Bump del padre** (Regla 17): según scope, bumpear el padre correcto en el proyecto con entry en changelog.
4. **Sign-off + fecha**.

Sin doc `closure` firmado:
- El enabler no se considera completo.
- Las features/stories que dependen del enabler pueden estar bloqueadas o en estado degradado.

### Anti-patrones

- Crear enabler "porque suena bien" sin features/stories vinculadas que lo justifiquen.
- Llamar enabler a un refactor sin cambio de capacidad — eso es `extra/` (Regla 14).
- Llamar enabler a una feature que entrega valor user-facing — eso es feature/story.
- Usar nombres de archivo hardcodeados para los docs del enabler — usar tokens + methodology.
- Cerrar el enabler (firmar doc `closure`) sin haber bumpeado al padre (Regla 17).
- Crear un enabler global para trabajo que claramente pertenece a UNA feature o story.
- Dejar el enabler sin scope declarado cuando el trabajo tiene un scope claro de feature o story.

---

## Referencias

- Orquestador: `/fremi-enabler` (`~/.fremi/framework/artifacts/enabler/SKILL.md`)
- Workflow canónico: `~/.fremi/framework/artifacts/enabler/workflow.yaml`
- Agentes + paralelismo: `~/.fremi/framework/artifacts/enabler/config.core.yaml`
- Reglas applies por step: `~/.fremi/framework/artifacts/enabler/rules/applies.yaml`
- Regla 14 (extra/): `~/.fremi/framework/artifacts/extra/rules/extra-doc.md`
- Regla 3b (bifurcaciones → ADR): `~/.fremi/framework/artifacts/story/rules/adr.md`
- Regla 17 (versioning + bump): `~/.fremi/framework/rules/versioning.md`
- Regla 20 (scope de ADRs): `~/.fremi/framework/artifacts/story/rules/adr.md`
