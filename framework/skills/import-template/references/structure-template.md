# Template — `structure.md` (para uso de `/fremi-import-template`)

Doc de investigación #4 de 7. Layout físico del template importado. **Estructura, no lógica de negocio.**

```markdown
# Structure — <nombre del template>

## Árbol (nivel 1-2)

```
/template/
├── <dir1>/
│   ├── <subdir>/
│   └── <archivo>
├── <dir2>/
│   └── ...
├── package.json | pyproject.toml | go.mod | ...
├── README.md
└── .env.example
```

## Entrypoints detectados

| Tipo | Archivo | Cómo se invoca |
|---|---|---|
| CLI | <path> | <`node cli.js` | `python -m ...` | binario compilado> |
| HTTP server | <path> | <`npm start` | `uvicorn ...` | `go run ...`> |
| Lambda handler | <path> | <deploy via serverless | AWS SDK invoke> |
| Worker / job | <path> | <cron | job runner> |

## Estructura interna de una unidad reusable

<Describir la unidad "reusable" del template (una Lambda, un endpoint, un módulo, un feature). Usar UN ejemplo concreto del código importado.>

Ejemplo: `<path/a/unidad>/`

```
<unidad>/
├── <archivo-1>            ← <qué contiene>
├── <archivo-2>            ← <qué contiene>
├── <subdir>/
│   ├── <archivo-3>        ← <qué contiene>
│   └── ...
└── test/
    ├── unit/
    └── e2e/
```

## Carpetas clave del template

| Carpeta | Rol |
|---|---|
| `src/` | Código de producción |
| `test/` o co-locado | Tests |
| `scripts/` | Utilidades manuales (build custom, generators, migrators) |
| `config/` | Configuraciones estáticas |
| ... | ... |

## Archivos de configuración importantes

| Archivo | Rol | Modificar cuando |
|---|---|---|
| `package.json` / `pyproject.toml` / `go.mod` | Dependencies + scripts | agregás lib nueva |
| `tsconfig.json` / `mypy.ini` | Type checker config | rara vez |
| `serverless.yml` / `Dockerfile` / `terraform/*.tf` | IaC | cambios de infra |
| `.env.example` | Contrato de env vars | agregás var nueva |
| `vitest.config.ts` / `pytest.ini` | Runner de tests | cambios de setup |
| ... | ... | ... |

## Lo que NO se copió y por qué

- **Directorios de agentes**: `.claude/`, `.cursor/`, `.agent/`, `.hermes/` (contenido real vive en `docs/`).
- **Archivos ignorados por `.gitignore`** del origen: `node_modules/`, `dist/`, `build/`, `.venv/`, etc.
- **Otros excluidos hardcoded por el skill**: <si aplica listarlos>

## Resumen numérico

| Métrica | Valor |
|---|---|
| Total archivos en `/template/` | <N> |
| Total directorios | <N> |
| Líneas de código (aprox, sólo prod) | <N> |
| Lambdas / módulos / entrypoints | <N> |
| Archivos de test | <N> |
```
