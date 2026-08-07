# `~/.fremi/framework/installs/` — Skills de instalación del framework

Skills que **instalan** el framework en el proyecto — sincronizan `.claude/`, registran hooks, y verifican estructura.

Diferencia con otros skills del framework:
- **Otros skills** operan sobre `docs/works/` (crean/pueblan documentos del flujo de trabajo).
- **Estos skills** operan sobre `.claude/` y `CLAUDE.md` (configuran el entorno del agente).

---

## Skills disponibles

| Skill | Rol |
|---|---|
| [`install-framework/`](./fremi-install-framework/) | Instala/sincroniza todos los symlinks de skills + reporta hooks + verifica rules |

---

## Cuándo se usan

- **Al clonar el proyecto**: `/fremi-install-framework` para sincronizar `.claude/`.
- **Cuando cambia la estructura** de `~/.fremi/framework/skills/` — hay que recrear symlinks.
- **Cuando aparecen symlinks broken** — el skill los detecta y recrea.

---

## Idempotencia

Los skills de `installs/` son **idempotentes por diseño**:
- Symlink ya existe apuntando al target correcto → skip.
- Symlink apunta al target INCORRECTO → recrea.
- File real donde debía ir un symlink → pide confirmación (o `--force`).

No hay riesgo de correrlos varias veces.

---

## Referencias

- Regla 21 (Skills organizados jerárquicamente por capa) en [`../rules/workflow.md`](../rules/workflow.md).
- Estructura de skills: [`../skills/`](../skills/).
- Configuración operativa: [`../settings/config.yaml`](../settings/config.yaml) + `config.<capa>.yaml`.
