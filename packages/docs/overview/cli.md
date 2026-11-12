---
outline: deep
---

# CLI

Run each command below with `npx luxen-ui <command>`; add `--help` to print its options.

## generate-skill

Use the `generate-skill` command when you [rename the `l-` prefix](/overview/customizing-prefix), to rebuild the Luxen [Agent Skill](/resources/agent-skills) with your prefix. It reads [`luxen.config.mjs`](/resources/agent-skills#generate-the-skill) from the folder you run it in, if present.

```bash
npx luxen-ui generate-skill
```

**Options**

```txt
Usage: luxen-ui generate-skill [flags]

Flags:
  --config <path>           Config file (default: ./luxen.config.mjs)
  --name <name>             Skill name (default: luxen-ui)
  --element-prefix <p>      Tag prefix without trailing dash (default: l)
  --css-prefix <p>          CSS class/var prefix without trailing dash (default: l)
  --theme-css <path>        Optional CSS file with token overrides
  --with-mockups            Also emit the standalone bundle + mockup/Claude Design
                            docs (off by default)
  --out <path>              Output dir (default: .claude/skills/<name>)
```

## import

Use the `import` command to eject a Luxen CSS file into your project and own it — to adjust a few values, [override the tokens](/overview/getting-started#customizing-tokens) instead.

```bash
npx luxen-ui import design-tokens
```

**Options**

```txt
Usage: luxen-ui import <noun> [path]

Copies a file out of luxen-ui into your project, at [path] or the default below.

Nouns:            Copied from                   Written to (default)
  preset          luxen-ui/css/preset           ./luxen-preset.css
  tailwind        luxen-ui/tailwind/preset      ./luxen-tailwind.css
  design-tokens   luxen-ui/css/tokens/aliases   ./luxen-design-tokens.css
```
