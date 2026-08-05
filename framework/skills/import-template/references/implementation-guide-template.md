# Template — `implementation-guide.md` (para uso de `/fremi-import-template`)

Doc de investigación #6 de 7 — **conocimiento aplicado**. Cómo escribir código real siguiendo el patrón del template. Cada sección es una guía práctica con snippets del lenguaje del template importado.

Este template es **genérico a cualquier stack** — los snippets se generan adaptándose al lenguaje real. Ver "Procedimiento GENÉRICO" del SKILL.md del `/fremi-import-template` para el algoritmo de generación.

```markdown
# Implementation Guide — <nombre del template>

Esta guía captura **cómo se escribe código siguiendo el patrón del template**. Snippets adaptados al stack del template importado. **NO** contiene lógica de negocio — sólo la forma.

---

## 1. Anatomía completa de una unidad reusable

<Describir la unidad reusable (Lambda, endpoint, módulo, feature) con su árbol de archivos, roles y dependencias entre archivos. Referenciar `structure.md` para el layout físico.>

## 2. Entrypoint — `<archivo-principal>`

<Snippet real del entrypoint típico, adaptado al stack. Explicar qué wireing hace: parseo de request, dispatch a handler, response.>

```<lang>
<snippet real del template>
```

## 3. Handler / lógica principal

<Cómo se estructura un handler típico. Firmas, error handling estándar, tipos de retorno.>

```<lang>
<snippet>
```

## 4. Validación de input

<Cómo se valida input en este stack — Zod, Pydantic, class-validator, JSON schema, etc.>

```<lang>
<snippet de un schema típico>
```

## 5. Middlewares / interceptores

<Cómo se crean y wirean middlewares (o el concepto equivalente: filters, guards, interceptors).>

```<lang>
<snippet>
```

## 6. Unit tests

<Cómo se escribe un test unitario en el framework del template (vitest, jest, pytest, go test).>

```<lang>
<snippet de test típico>
```

## 7. Integration / E2E tests (si aplica)

<Setup, fixtures, teardown, cómo se invoca contra ambiente real o mock.>

```<lang>
<snippet>
```

## 8. Acceso a datos

<Cómo se accede a la base de datos siguiendo el patrón del template — repository, DAO, query builder, raw SQL. Con snippet.>

```<lang>
<snippet>
```

## 9. Cómo crear una nueva unidad (síntesis paso a paso aplicada)

Pasos concretos para agregar una unidad nueva al proyecto, integrando todo lo anterior:

1. **Crear archivos**: <lista de archivos con path>
2. **Definir schema de input**: <cómo>
3. **Implementar handler**: <cómo>
4. **Escribir unit tests**: <qué cubrir>
5. **Wirear el entrypoint**: <cómo>
6. **Registrar rutas / endpoints**: <dónde>
7. **Deployar / correr**: <comandos>

## 10. Convenciones cross-unit / cross-módulo

<Convenciones que se aplican **entre** unidades: naming de rutas, códigos de error, envelope de response, versioning, feature flags, etc. Cada una con snippet.>

## 11. Manejo de errores

<Tipos canónicos de error del template, cómo se propagan, cómo se serializan al cliente.>

```<lang>
<snippet — ej: clase de error base + jerarquía>
```

## 12. Comandos de uso diario (cheatsheet)

```bash
# Setup
<comando>

# Desarrollo
<comando>

# Test
<comando>

# Deploy
<comando>
```
```
