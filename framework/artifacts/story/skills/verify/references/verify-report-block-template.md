# Template — Bloque de reporte de `/fremi-story-verify` (para insertar en `{workflow.checkwork}`)

Este bloque se **inserta o reemplaza** dentro de `{workflow.checkwork}` del artifact bajo la sección `## Última corrida de verify`. No se crea un archivo dedicado — la decisión operativa vive en `config.story.yaml → verify_phase.dedicated_doc = false`.

**Uso**:
1. Ejecutar los checks declarados en `config.yaml → testing.*`.
2. Rellenar la tabla de evidencia con los comandos ejecutados y su resultado.
3. Clasificar issues residuales en CRITICAL / WARNING / SUGGESTION.
4. Calcular verdict: PASS (0 CRITICAL + 0 WARNING) / PASS WITH WARNINGS (0 CRITICAL, N WARNING con justificación) / FAIL (≥1 CRITICAL).
5. Sobrescribir la sección `## Última corrida de verify` del checkwork con el bloque rellenado.

---

```markdown
## Última corrida de verify — YYYY-MM-DD HH:MM

**Verdict**: PASS | PASS WITH WARNINGS | FAIL

### Evidencia de corrida
| Check | Comando | Result |
|---|---|---|
| Type check | `<comando>` | ✅ / ❌ |
| Test runner | `<comando>` | X passed / Y failed |
| Unit | `<comando>` | X passed |
| E2E | `<comando>` | X passed |
| Coverage | `<comando>` | XX% (threshold YY%) |

### Issues

**CRITICAL** (N):
- <descripción + archivo:línea si aplica>

**WARNING** (N):
- <descripción + justificación de aceptación>

**SUGGESTION** (N):
- <descripción + acción recomendada>
```

---

## Reglas de uso

1. **Verdict debe respetar exit codes reales.** No marcar PASS si algún test falló, ni "adornar" el reporte. Si es aceptable, es WARNING con justificación explícita del usuario.
2. **Cada CRITICAL bloquea closure.** No se firma `{workflow.closure}` con CRITICAL abierto.
3. **WARNINGS requieren aceptación explícita del usuario** para no bloquear closure. Documentar la justificación en la línea de cada warning.
4. **Timestamp preciso** — `YYYY-MM-DD HH:MM` real de la corrida, no aproximado.
5. **Si `{workflow.checkwork}` no existe** (caso raro) → crear el archivo con este bloque como sección única + placeholder para el resto del contenido (`## Estado general`, `## ✅ Listo`, etc.).
