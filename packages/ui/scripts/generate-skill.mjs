/* eslint-disable no-await-in-loop -- sequential I/O is intentional in this
   build script for predictable output order and bounded concurrency. */
import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ELEMENTS_ROOT = resolve(__dirname, '..');
const DOCS_ROOT = resolve(ELEMENTS_ROOT, '..', 'docs');
const SKILL_OUTPUT = resolve(ELEMENTS_ROOT, 'dist', 'skills', 'luxen-ui');

const ELEMENTS = [
  'avatar',
  'badge',
  'button',
  'close-button',
  'dialog',
  'drawer',
  'select',
  'progress',
  'sticky-bar',
  'toast',
  'tree',
];

async function main() {
  await mkdir(join(SKILL_OUTPUT, 'references'), { recursive: true });

  for (const element of ELEMENTS) {
    const docPath = join(DOCS_ROOT, 'elements', `${element}.md`);
    const raw = await readFile(docPath, 'utf-8');
    const transformed = await transformDoc(raw, element);
    await writeFile(join(SKILL_OUTPUT, 'references', `${element}.md`), transformed);
  }

  await writeFile(join(SKILL_OUTPUT, 'SKILL.md'), generateSkillMd());
  console.log(`Skill generated at ${SKILL_OUTPUT}`);
}

// --- Markdown transformation ---

async function transformDoc(content, _elementName) {
  // 1. Parse <script setup> imports to build variable -> file path map
  const imports = parseScriptImports(content);

  // 2. Strip <script setup> block
  content = content.replace(/<script setup>[\s\S]*?<\/script>\s*/m, '');

  // 3. Strip <Badge> components from headings
  content = content.replace(/\s*<Badge[^>]*>[^<]*<\/Badge>/g, '');

  // 4. Replace <ComponentWrapper> with inlined HTML examples
  const wrapperResult = await replaceComponentWrappers(content, imports);
  content = wrapperResult.content;

  // 5. Replace <AccessibilityTable> with markdown
  content = convertAccessibilityTable(content);

  // 5b. Replace <KeyboardTable> with markdown
  content = convertKeyboardTable(content);

  // 6. Convert VitePress container directives and file includes
  content = await convertVitePressBlocks(content, wrapperResult.inlinedFiles);

  // 7. Clean up extra blank lines
  content = content.replace(/\n{3,}/g, '\n\n').trim() + '\n';

  return content;
}

function parseScriptImports(content) {
  const imports = new Map();
  const setupMatch = content.match(/<script setup>([\s\S]*?)<\/script>/);
  if (!setupMatch) return imports;

  const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+?)(?:\?raw)?['"]/g;
  let match;
  while ((match = importRegex.exec(setupMatch[1])) !== null) {
    // Resolve relative path from docs root (imports use '../.vitepress/...')
    const filePath = resolve(join(DOCS_ROOT, 'elements'), match[2]);
    imports.set(match[1], filePath);
  }
  return imports;
}

async function replaceComponentWrappers(content, imports) {
  const regex = /<ComponentWrapper\s+:html="(\w+)"[^/]*\/>/g;
  const matches = [...content.matchAll(regex)];
  const inlinedFiles = new Set();

  for (const match of matches.toReversed()) {
    const varName = match[1];
    const filePath = imports.get(varName);
    if (!filePath) continue;

    const html = (await readFile(filePath, 'utf-8')).trim();
    const replacement = '```html\n' + html + '\n```';
    content =
      content.slice(0, match.index) + replacement + content.slice(match.index + match[0].length);
    inlinedFiles.add(await realpath(filePath));
  }

  return { content, inlinedFiles };
}

function convertAccessibilityTable(content) {
  const regex =
    /<AccessibilityTable\s+:data="(\[[\s\S]*?\])"\s*(?::rules="(\[[\s\S]*?\])"\s*)?\/>/g;
  return content.replace(regex, (_, dataStr, rulesStr) => {
    // Unescape HTML entities used in markdown attributes
    const unescape = (s) =>
      s
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

    let data;
    try {
      data = new Function(`return ${unescape(dataStr)}`)();
    } catch {
      return '';
    }

    // Strip markdown links from description, keep label only
    const stripLinks = (s) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    const lines = [];
    lines.push('| Check | Description |');
    lines.push('|-------|-------------|');
    for (const row of data) {
      lines.push(`| ${row.Check} | ${stripLinks(row.Description)} |`);
    }

    if (rulesStr) {
      let rules;
      try {
        rules = new Function(`return ${unescape(rulesStr)}`)();
      } catch {
        rules = [];
      }
      if (rules.length) {
        lines.push('');
        lines.push('### Rules');
        for (const rule of rules) {
          lines.push(`- ${rule}`);
        }
      }
    }

    return lines.join('\n');
  });
}

function convertKeyboardTable(content) {
  const regex = /<KeyboardTable\s+:data="(\[[\s\S]*?\])"\s*\/>/g;
  return content.replace(regex, (_, dataStr) => {
    const unescape = (s) =>
      s
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

    let data;
    try {
      data = new Function(`return ${unescape(dataStr)}`)();
    } catch {
      return '';
    }

    const lines = [];
    lines.push('| Key | Description |');
    lines.push('|-----|-------------|');
    for (const row of data) {
      lines.push(`| ${row.Key} | ${row.Description} |`);
    }

    return lines.join('\n');
  });
}

async function convertVitePressBlocks(content, inlinedFiles) {
  const lines = content.split('\n');
  const result = [];
  const stateStack = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Opening directives
    if (line.startsWith('::: code-group')) {
      stateStack.push('code-group');
      continue;
    }
    if (line.startsWith('::: details')) {
      stateStack.push('details');
      continue;
    }
    if (line.startsWith('::: info')) {
      const title = line.replace('::: info', '').trim();
      stateStack.push('info');
      if (title) result.push(`> **${title}**`);
      result.push('>');
      continue;
    }

    // Closing :::
    if (line.trimEnd() === ':::' && stateStack.length > 0) {
      const closed = stateStack.pop();
      if (closed === 'info') result.push('');
      continue;
    }

    // File includes: <<< @/.vitepress/examples/path.html [Label]
    const includeMatch = line.match(/^<<<\s+@\/(.+?)(?:\s+\[(\w+)\])?\s*$/);
    if (includeMatch) {
      const filePath = resolve(DOCS_ROOT, includeMatch[1]);
      // Skip if this file was already inlined by <ComponentWrapper>
      try {
        if (inlinedFiles.has(await realpath(filePath))) continue;
      } catch {
        /* file not found, will be handled below */
      }
      const lang = (includeMatch[2] || extToLang(filePath)).toLowerCase();
      try {
        const fileContent = (await readFile(filePath, 'utf-8')).trim();
        result.push('```' + lang, fileContent, '```');
      } catch {
        // File not found, skip
      }
      continue;
    }

    // Strip [Label] from fenced code block language (VitePress tab syntax)
    const fenceMatch = line.match(/^(```\w+)\s+\[.*\]$/);
    if (fenceMatch) {
      result.push(fenceMatch[1]);
      continue;
    }

    // In info blocks, prefix lines with >
    if (stateStack.at(-1) === 'info') {
      result.push(`> ${line}`);
      continue;
    }

    result.push(line);
  }

  return result.join('\n');
}

function extToLang(filePath) {
  const ext = filePath.split('.').pop();
  const map = { html: 'html', css: 'css', js: 'javascript', ts: 'typescript' };
  return map[ext] || ext;
}

// --- SKILL.md generation ---

function generateSkillMd() {
  const elementsTable = ELEMENTS.map((el) => {
    const info = elementMeta[el];
    return `| ${info.name} | ${info.type} | \`${info.selector}\` | [references/${el}.md](references/${el}.md) |`;
  }).join('\n');

  return `---
name: luxen-ui
description: >-
  Generate UI with Luxen UI, a CSS-first web component library.
  Provides CSS classes for native HTML elements (button, select, progress,
  close-button) and custom elements (l-badge, l-dialog, l-toast). Use when
  building interfaces with Luxen UI.
metadata:
  version: "0.1.0"
---

# Luxen UI

A CSS-first web component library built on web standards. Most elements are plain CSS classes applied to native HTML elements — no JavaScript required. Custom elements (like \`<l-badge>\`) use Lit with minimal Shadow DOM.

## Installation

Import per-element CSS:

\`\`\`css
@import 'luxen-ui/css/button';
@import 'luxen-ui/css/close-button/ring';
\`\`\`

Or import all elements:

\`\`\`css
@import 'luxen-ui/css';
\`\`\`

For custom elements, also import the JavaScript:

\`\`\`js
import 'luxen-ui';
\`\`\`

## Available Elements

| Element | Type | Selector | Reference |
|---------|------|----------|-----------|
${elementsTable}

## Quick Patterns

A button:

\`\`\`html
<button class="l-button">Label</button>
<button class="l-button" data-variant="primary">Primary</button>
\`\`\`

A badge:

\`\`\`html
<l-badge>Default</l-badge>
<l-badge style="--variant: success">Success</l-badge>
\`\`\`

A dialog:

\`\`\`html
<button class="l-button" command="--show" commandfor="my-dialog">Open</button>
<l-dialog id="my-dialog" title="Dialog title">
  <button slot="close" class="l-close" data-appearance="ring" aria-label="Close"
          command="--hide" commandfor="my-dialog"></button>
  <p>Dialog content</p>
  <div slot="footer">
    <button class="l-button" command="--hide" commandfor="my-dialog">Close</button>
  </div>
</l-dialog>
\`\`\`

For full usage details, see the reference files for each element.
`;
}

const elementMeta = {
  avatar: { name: 'Avatar', type: 'Custom element', selector: '<l-avatar>' },
  badge: { name: 'Badge', type: 'Custom element', selector: '<l-badge>' },
  button: { name: 'Button', type: 'CSS class', selector: '.l-button' },
  'close-button': { name: 'Close button', type: 'CSS class', selector: '.l-close' },
  dialog: { name: 'Dialog', type: 'Custom element', selector: '<l-dialog>' },
  drawer: { name: 'Drawer', type: 'Custom element', selector: '<l-drawer>' },
  select: { name: 'Select', type: 'CSS class', selector: '.l-select' },
  progress: { name: 'Progress', type: 'CSS class', selector: '.l-progress' },
  'sticky-bar': { name: 'Sticky bar', type: 'Custom element', selector: '<l-sticky-bar>' },
  toast: { name: 'Toast', type: 'Custom element', selector: '<l-toast>' },
  tree: { name: 'Tree', type: 'Custom element', selector: '<l-tree>' },
};

main().catch((err) => {
  console.error('Skill generation failed:', err);
  process.exit(1);
});
