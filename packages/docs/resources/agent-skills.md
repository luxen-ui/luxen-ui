# Agent Skills

Luxen UI ships an [Agent Skill](https://agentskills.io/) — a structured documentation format that helps AI coding assistants generate accurate UI code using Luxen UI components.

::: info WHY USE IT?
Without an Agent Skill, AI assistants often hallucinate class names, invent non-existent APIs, or produce outdated markup. The skill provides the exact component catalog, CSS classes, custom properties, and HTML patterns — so the AI generates correct code on the first try.
:::

## Accessing the Skill

The skill is included in the `luxen-ui` npm package:

```
node_modules/luxen-ui/dist/skills/luxen-ui/
├── SKILL.md
└── references/
    ├── badge.md
    ├── button.md
    ├── close-button.md
    ├── dialog.md
    ├── select.md
    └── progress.md
```

| File              | Description                                                                      |
| ----------------- | -------------------------------------------------------------------------------- |
| `SKILL.md`        | Overview of Luxen UI, installation, available elements, and quick patterns       |
| `references/*.md` | Per-element documentation with HTML examples, CSS classes, and custom properties |

## How to Use It

### Claude Code

Install the skill with the `skills` CLI:

```bash
npx skills add ./node_modules/luxen-ui/dist/skills/luxen-ui
```

The skill is installed as a symlink, so it stays up to date when you update Luxen UI via npm.

To remove:

```bash
npx skills remove luxen-ui
```

### Cursor

Add the skill as documentation context in your Cursor settings. Point to the `SKILL.md` file:

```
node_modules/luxen-ui/dist/skills/luxen-ui/SKILL.md
```

### Other Tools

Any AI tool that supports the [Agent Skills specification](https://agentskills.io/specification) can use this skill. Point it to the `dist/skills/luxen-ui/` directory in the installed package.

For tools that don't support Agent Skills, you can manually include the contents of `SKILL.md` in your system prompt or project context.

## What's Included

The skill provides:

- Complete element catalog (badge, button, close button, dialog, select, progress)
- HTML markup patterns with correct class names and attributes
- CSS custom properties reference (e.g., `--variant`, `--pill`, `--with-dot`)
- Per-element CSS import paths (`@import 'luxen-ui/css/button'`)
- Accessible markup patterns (`role`, `aria-label`, native semantics)
