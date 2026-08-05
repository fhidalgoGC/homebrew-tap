# Template — `stack.md` (para uso de `/fremi-import-template`)

Doc de investigación #2 de 7. **Genérico a cualquier stack** — completar según lo que se detecte en el template importado. Omitir secciones que no aplican.

```markdown
# Stack — <nombre del template>

## Lenguaje / runtime

- **Lenguaje**: <TypeScript 5.x | Python 3.11 | Go 1.22 | ...>
- **Runtime**: <Node.js 24.x | Bun 1.x | JVM 21 | AWS Lambda | ...>
- **Package manager**: <npm | yarn | pnpm | pip | poetry | go mod | ...>
- **Bundler / build tool**: <esbuild | webpack | vite | tsup | pyinstaller | ...>

## Framework(s) principales

| Capa | Framework | Versión | Notas |
|---|---|---|---|
| Web / HTTP | <Express | Fastify | FastAPI | Gin | Serverless Framework | ...> | <ver `package.json`/`go.mod`> | <observación> |
| Router | <declarado por el web fw o custom> | | |
| ORM / DB access | <Prisma | TypeORM | SQLAlchemy | GORM | Drizzle | ...> | | |
| IaC | <Serverless Framework v3 | SAM | CDK | Terraform | ...> | | |
| CI/CD | <GitHub Actions | GitLab CI | ...> | | |

## Autenticación / criptografía

- <ej: JWT vía `jsonwebtoken`, bcrypt para hash, Auth0 password-realm, custom Cognito, N/A si no aplica>

## Validación

- <ej: Zod (TS), Pydantic (Python), Joi, go-validator — con path a schemas típicos>

## Test

| Nivel | Framework | Comando |
|---|---|---|
| Unit | <vitest | jest | pytest | go test | ...> | <`npm test` | `pytest` | `go test ./...`> |
| Integration | <si aplica> | |
| E2E | <si aplica> | |
| Coverage | <si aplica> | |

## Lint / Format

- **Linter**: <eslint | ruff | golangci-lint | ...> — config en <path>
- **Formatter**: <prettier | black | gofmt | ...>
- **Type checker**: <tsc | mypy | pyright | ...>

## CI/CD

- Pipelines detectados en <`.github/workflows/*` | `.gitlab-ci.yml` | ...>
- Jobs: <lint, test, build, deploy>

## Otras libs notables

<Listar libs de terceros no cubiertas arriba con su rol (ej: `axios` para HTTP client, `pino` para logging, `chromium-lambda` para render PDF).>

## Versiones clave

Extraídas de `package.json` / `pyproject.toml` / `go.mod` / equivalente:

```
<snapshot del manifiesto de dependencies>
```

## Path aliases

- <ej: TSConfig `@lib/*` → `src/lib/*`, esbuild resolve, vitest resolve>
- (o "N/A — no se usan aliases")

## Comentarios / observaciones sobre versiones

<¿Hay versiones desactualizadas? ¿Alguna deprecada? ¿Alguna atípica que merezca destacar?>
```
