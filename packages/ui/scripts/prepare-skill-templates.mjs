/* eslint-disable no-await-in-loop -- sequential I/O is intentional in this
   build script for predictable output order and bounded concurrency. */
/*
 * prepare-skill-templates.mjs — build-time step that prepares the markdown
 * templates consumed by the `luxen-ui generate-skill` CLI at consumer-run time.
 *
 * Responsibilities (build time, runs from `pnpm build`):
 *
 *   1. Transform per-element VitePress docs (packages/docs/elements/*.md) into
 *      plain markdown (strip <script setup>, inline <ComponentWrapper> HTML,
 *      convert <AccessibilityTable> / <KeyboardTable> / ::: directives).
 *      Output: packages/ui/dist/templates/elements/<name>.md
 *
 *   2. Sync the auto-generated `l-*` tag list inside packages/ui/MOCKUPS.md
 *      from the manifest (between <!-- generated:l-tags --> markers), then copy
 *      the file verbatim to packages/ui/dist/templates/mockups.md.
 *
 * This script does NOT generate a complete skill — that's the CLI's job at
 * consumer-run time, where the prefix, name, and theme overrides are applied.
 */
import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// eslint-disable-next-line no-underscore-dangle -- ESM idiom for resolving the script's directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const DOCS_ROOT = resolve(PKG_ROOT, '..', 'docs');
const MANIFEST_PATH = resolve(PKG_ROOT, 'elements.json');
const MOCKUPS_PATH = resolve(PKG_ROOT, 'MOCKUPS.md');
const OUT_ROOT = resolve(PKG_ROOT, 'dist', 'templates');

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
const ELEMENTS = manifest.elements.filter((e) => e.inSkill).map((e) => e.name);

async function main() {
  await mkdir(join(OUT_ROOT, 'elements'), { recursive: true });

  for (const element of ELEMENTS) {
    const docPath = join(DOCS_ROOT, 'elements', `${element}.md`);
    const raw = await readFile(docPath, 'utf-8');
    const transformed = await transformDoc(raw, element);
    await writeFile(join(OUT_ROOT, 'elements', `${element}.md`), transformed);
  }

  await syncMockupsTagList();

  console.log(`Skill templates prepared at ${OUT_ROOT}`);
}

// Keeps the auto-generated `l-*` tag list in packages/ui/MOCKUPS.md (the
// canonical public-CDN docs) in sync with elements.json. The CLI-generated
// per-consumer mockups.md uses its own template; this is only for the source
// doc that ships at the repo root.
async function syncMockupsTagList() {
  const tags = manifest.elements
    .filter((e) => e.inMockups && e.kind !== 'native')
    .map((e) => `\`l-${e.name}\``)
    .join(', ');
  const block = `<!-- generated:l-tags — edit packages/ui/elements.json and run the skill build to update -->\n\n${tags}.\n\n<!-- /generated:l-tags -->`;
  const re = /<!-- generated:l-tags[\s\S]*?<!-- \/generated:l-tags -->/;

  const current = await readFile(MOCKUPS_PATH, 'utf-8');
  if (!re.test(current)) {
    throw new Error(
      `MOCKUPS.md is missing the <!-- generated:l-tags --> markers; cannot sync the tag list.`,
    );
  }
  const updated = current.replace(re, block);
  if (updated !== current) await writeFile(MOCKUPS_PATH, updated);
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

    if (line.trimEnd() === ':::' && stateStack.length > 0) {
      const closed = stateStack.pop();
      if (closed === 'info') result.push('');
      continue;
    }

    const includeMatch = line.match(/^<<<\s+@\/(.+?)(?:\s+\[(\w+)\])?\s*$/);
    if (includeMatch) {
      const filePath = resolve(DOCS_ROOT, includeMatch[1]);
      try {
        if (inlinedFiles.has(await realpath(filePath))) continue;
      } catch {
        /* file not found */
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

    const fenceMatch = line.match(/^(```\w+)\s+\[.*\]$/);
    if (fenceMatch) {
      result.push(fenceMatch[1]);
      continue;
    }

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

main().catch((err) => {
  console.error('Skill template preparation failed:', err);
  process.exit(1);
});
