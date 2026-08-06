---
name: fremi-reverse-product
description: Reconstruye la capa producto completa (iniciativas, ideas, planteamiento, definition, strategies, decisions, plan) a partir de features y stories existentes. Modo default `--transparent` (Regla 26 — fuertemente recomendado por riesgo alto de racionalización post-hoc); `--stealth` disponible pero desaconsejado. Aplica Regla 17. Usar cuando el proyecto tiene features en producción pero nunca se formalizó la capa producto — el caso más ambicioso de reverse-engineering.
---

# /fremi-reverse-product — Ingeniería inversa de la capa producto

Reconstruye los 7 docs de la capa producto a partir de features/stories existentes. Es el caso más **ambicioso** de reverse-engineering — implica inferir estrategia y motivación desde artifacts operativos.

**Precondición conceptual**: existen features en producción (o al menos en desarrollo formal) pero `docs/works/product/*` está vacío o incompleto.

## Sintaxis

```
/fremi-reverse-product [--stealth|--transparent] [--dry-run] [--interactive]
```

- `--interactive` (recomendado): guía paso a paso, hace preguntas.

## Cuándo invocarlo

- El proyecto tiene 3+ features en producción pero `product/definition.md` no existe.
- Se importó código legacy al framework y hay que formalizar producto.
- Se está haciendo una auditoría de fundación de producto.

**NO invocar** si el producto está arrancando ahora — usar el flow normal (`/fremi-product-iniciativas` → `/fremi-product-ideas` → ...).

## Procedimiento

### Paso 0 — Cargar configuración
- `methodology.core.yaml`, `config.product.yaml`.

### Paso 1 — Inventario de features y stories

Escanear:
```
📁 docs/works/features/*/
   - N features detectadas
   - Extraer: título, descripción, capacidades in-scope, stories dentro

📁 docs/works/product/ (estado actual)
   - Qué docs existen y qué falta.
```

### Paso 2 — Preguntas dirigidas al usuario

En modo `--interactive`, guía por 5 rondas de preguntas:

#### Ronda 1 — Producto (definition)
- ¿Qué hace este producto en 3-5 líneas? (para quién, cómo se diferencia)
- ¿Quiénes son los usuarios primarios? ¿Secundarios?
- ¿Qué KPIs medibles definen el éxito?
- ¿Qué restricciones globales aplican (regulatorias, técnicas, negocio)?

#### Ronda 2 — Iniciativas (retroactivas)
- Agrupá las features en 1-3 iniciativas estratégicas (hipótesis de negocio SAFe).
- Cada iniciativa: hipótesis, métricas leading/lagging, escala esperada.

#### Ronda 3 — Ideas exploradas
- ¿Qué approaches se descartaron al arrancar? (Brainstorm retroactivo)
- Cada idea: pros/contras, motivo de descarte.

#### Ronda 4 — Planteamiento (approach elegido)
- ¿Cuál fue el approach elegido y por qué?
- Restricciones del approach.

#### Ronda 5 — Estrategias técnicas
- ¿Qué stack se eligió y por qué? (¿había alternativas?)
- Del `package.json` / `serverless.yml` / IaC → inferir stack actual.

### Paso 3 — Reconstruir docs

Con las respuestas + escaneo:

- **`iniciativas.md`**: 1-3 iniciativas basadas en Ronda 2.
- **`ideas.md`**: brainstorm reconstruido de Ronda 3.
- **`planteamiento.md`**: framing + approach de Ronda 4.
- **`definition.md`**: producto formal de Ronda 1 + capacidades in-scope agregadas de features.
- **`strategies.md`**: comparación de 2-3 estrategias (Ronda 5). Marcar la actual como Elegida.
- **`decisions.md`**:
  - ADRs globales inferidos del stack (ej: "ADR-001 — Node.js sobre Python", "ADR-002 — Serverless Framework sobre CDK").
  - Marcar cada ADR con la fecha del primer commit relacionado.
- **`plan.md`**: roadmap con features existentes + estados (Cerradas / En curso / Planeadas).

### Paso 4 — ADRs históricos con `--transparent` recomendado

Los ADRs reconstruidos representan decisiones que **realmente se tomaron** en algún momento pero sin registrar. Recomendación:
- Usar `--transparent` acá — marcar cada ADR con `reverse_engineered: true` y fecha.
- Alternativamente, poner en el contexto de cada ADR: "Decisión tomada de facto al arrancar el proyecto (YYYY-MM). Formalizada retroactivamente."

### Paso 5 — Aplicar Regla 17

- Cada doc living con `v0.1.0` inicial (o versiones más avanzadas si querés reflejar madurez).
- Changelogs retroactivos con `--from-git-history` si es posible.
- Ancestros: `iniciativas.md` es raíz (sin ancestor real). Los demás anidan según cadena.

### Paso 6 — Reportar

```
▶ Capa producto reconstruida (7 docs)
  - iniciativas.md    (v0.1.0) — N iniciativas (retroactivas)
  - ideas.md          (v0.1.0) — N ideas brainstormeadas
  - planteamiento.md  (v0.1.0) — approach elegido
  - definition.md     (v0.1.0) — N capacidades in-scope
  - strategies.md     (v0.1.0) — N estrategias evaluadas
  - decisions.md      (v0.1.0) — N ADRs históricos
  - plan.md           (v0.1.0) — N features en roadmap

▶ Advertencias:
  ⚠ Este es el caso más ambicioso de reverse-engineering.
  ⚠ Las iniciativas reconstruidas son INTERPRETACIONES post-hoc — pueden no reflejar
     la motivación estratégica original (que puede ni haber existido formalmente).
  ⚠ Ideas descartadas son casi imposibles de reconstruir sin memoria del equipo.
  ⚠ Recomendación: usar --transparent para trazabilidad.
  ⚠ Validar con stakeholders originales si están disponibles.
```

## Advertencias muy fuertes para reverse-product

### ⚠️ Riesgo alto de racionalización post-hoc

La capa producto refleja **intención estratégica** que a menudo no existió formalmente al arrancar. Reverse-engineerarla puede producir docs que se ven razonables pero son ficción — "así hubiéramos querido que arrancara" en lugar de "así arrancó".

### ⚠️ ADRs reconstruidos son de hecho, no de derecho

Un ADR-001 que dice "elegimos Node.js sobre Python" retroactivamente asume que hubo comparación. Si sólo se usó Node.js por default, el ADR es ficticio. **Marcar como `--transparent`** con nota "Decisión de facto".

### ⚠️ Este skill no reemplaza estrategia

Reverse-product es útil para **inventariar** el producto tal como está — no para SUSTITUIR el trabajo estratégico de definir a dónde va. Después de reverse, hacer un ejercicio real de discovery para actualizar iniciativas hacia adelante.

## Anti-patrones

- ❌ Usar reverse-product como forma de "arrancar el producto" — mejor arrancar con `/fremi-product-iniciativas` de verdad.
- ❌ Firmar los docs sin validar con stakeholders originales.
- ❌ Modo `--stealth` para producto — la trazabilidad histórica de estrategia importa.

## Referencias

- README del concepto: [`../README.md`](../README.md).
- Skills del flow normal: [`/fremi-product`](../../skills/product/SKILL.md) + sub-skills.
- Regla 4 (Discovery antes de formalización) — se está aplicando al revés.
- Regla 17 (versionado).
