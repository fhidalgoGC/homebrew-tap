# Regla de la cadena BDD → SDD → Design (dominio STORY)

> **Regla obligatoria 6.** Fija la progresión de artefactos centrales de una story y las reglas de frontera entre BDD (qué observable), SDD (qué contractual) y Design (cómo estructural).
>
> **Alcance:** esta regla es DOMAIN-específica de `story/`. Sólo la capa story tiene esta cadena. Se carga cuando se está trabajando en una story. No aplica a product / feature / enabler / extra.
>
> **Nota sobre identificadores:** este archivo usa **step IDs** (`bdd`, `sdd`, `design`, etc.) para referirse a los docs del workflow. El filename real de cada step se resuelve vía `~/.fremi/framework/settings/methodology.core.yaml → layers.story.files_in_order`. Ver `.claude/rules/no-hardcoded-identifiers.md`.
>
> Ver el índice global en `~/.fremi/framework/rules/workflow.md`.

---

## Regla 6 — Cadena BDD → SDD → Design (la spec dirige el diseño)

Dentro de cada story el orden de los artefactos centrales es:

```
step `bdd`           →    step `sdd`           →    step `design`
(qué OBSERVABLE)          (qué CONTRACTUAL)         (cómo ESTRUCTURAL)
```

**Cada artefacto sólo puede consumir decisiones tomadas en los artefactos ANTERIORES. Nunca puede depender de uno POSTERIOR.** Si un contenido depende de una decisión que se toma más adelante, ese contenido está en el archivo equivocado: se mueve, no se invierte el orden.

### Regla 6.1 — `scope` antes que `bdd`

Antes de escribir el doc `bdd` debe existir el doc `scope` con listas explícitas:
```markdown
## In-scope
- ...
## Out-of-scope
- ...
## Dependencias
- (otras stories o features de las que depende)
```
El scope **acota** la story. Sin él los escenarios BDD se expanden sin control.

### Regla 6.2 — `bdd` antes que `sdd`

Antes de escribir el doc `sdd` debe existir el doc `bdd` con al menos:
- El caso feliz.
- Un caso de error o borde relevante.

El doc `bdd` contiene el **"qué observable"** por el usuario en formato Given/When/Then. **No contiene** firmas, tipos ni decisiones técnicas. Si no se puede formular el comportamiento como Given/When/Then, la story está mal definida — volver al doc `definition`.

### Regla 6.3 — `sdd` antes que `design` (la spec dirige)

Antes de escribir el doc `design` debe existir el doc `sdd` con el **"qué contractual"** — únicamente fronteras que se sostienen **sin haber decidido tecnología**:
- Contratos de interfaces externas (firmas que otros consumen, endpoints, schemas de request/response).
- Tipos de entrada/salida.
- Tabla de códigos/errores expuestos por la interfaz.
- Requisitos no funcionales medibles (latencia, throughput, etc.).

**No se incluye en `sdd`** nada que dependa de una decisión técnica interna (elección de librería, capas/wrappers internos, adaptadores de una librería concreta). Eso pertenece al doc `design`.

### Regla 6.4 — `design` satisface el contrato, no lo redefine

El doc `design` contiene el **"cómo estructural"** — decisiones técnicas que **satisfacen** el contrato de `sdd`:
- Tecnologías y librerías elegidas (Puppeteer, AWS SDK, etc.) con su justificación.
- Componentes y responsabilidades internas; wrappers/adaptadores de las librerías.
- Contratos **internos** derivados de esas decisiones (firmas de funciones módulo-a-módulo).
- Diagramas de secuencia, modelo de datos / ER, pseudocódigo de algoritmos clave.
- Patrones aplicados (repository, strategy, factory, etc.).
- Manejo de errores internos, concurrencia, transacciones.
- Estructura de archivos/carpetas a crear.

El doc `design` resuelve el **cómo interno** antes de codear. **No es UI/UX** — para necesidades visuales se referencia desde otro lugar (ej: link a Figma).

### Reglas de frontera (anti-solapamiento)

- **`bdd` vs `sdd`:** "qué ve el usuario ante tal acción" = **`bdd`**. "Qué código HTTP / qué schema devuelve la interfaz" = **`sdd`**.
- **`sdd` vs `design`:** si el contrato puede escribirse sin decidir tecnología → **`sdd`**. Si sólo existe porque ya se eligió una librería/capa → **`design`**.
- Cualquier "TBD" se resuelve en el artefacto donde nace la decisión, no se arrastra al posterior.
