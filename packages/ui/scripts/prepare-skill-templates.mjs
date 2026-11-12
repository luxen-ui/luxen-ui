/* eslint-disable no-await-in-loop -- sequential I/O is intentional in this
   build script for predictable output order and bounded concurrency. */
/*
 * prepare-skill-templates.mjs — build-time step that prepares the markdown
 * templates consumed by the `luxen-ui generate-skill` CLI at consumer-run time.
 *
 * Responsibilities (build time, runs from `pnpm build`):
 *
 *   1. Transform per-element VitePress docs (packages/docs/elements/*.md) into
 *      plain markdown (strip <script setup> / <style scoped>, inline
 *      <ComponentWrapper> HTML, convert <AccessibilityTable> / <KeyboardTable> /
 *      <ApiTable> / <ElementSpec> / ::: directives, drop leftover demo
 *      components). Output: packages/ui/dist/templates/elements/<name>.md
 *
 *   1b. Transform the Foundations guides (packages/docs/foundations/*.md —
 *      focus, …) the same way. They carry the "when and why" behind the tokens
 *      that the generated `references/tokens.md` inventory cannot. Figures
 *      (`<*Figure>`) are dropped; `<DesignTokens>` blocks become token lists.
 *      Output: packages/ui/dist/templates/foundations/<name>.md
 *
 *   2. Sync the auto-generated `l-*` tag list inside packages/ui/MOCKUPS.md
 *      from the manifest (between <!-- generated:l-tags --> markers), then copy
 *      the file verbatim to packages/ui/dist/templates/mockups.md.
 *
 * This script does NOT generate a complete skill — that's the CLI's job at
 * consumer-run time, where the prefix, name, and theme overrides are applied.
 */
import { readFile, writeFile, mkdir, readdir, realpath } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// eslint-disable-next-line no-underscore-dangle -- ESM idiom for resolving the script's directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const DOCS_ROOT = resolve(PKG_ROOT, '..', 'docs');
const MANIFEST_PATH = resolve(PKG_ROOT, 'elements.json');
const MOCKUPS_PATH = resolve(PKG_ROOT, 'MOCKUPS.md');
const OUT_ROOT = resolve(PKG_ROOT, 'dist', 'templates');
// Absolute origin of the docs site: root-relative links (`/overview/…`) are
// dead outside it, so templates point back at the published page.
const DOCS_ORIGIN = 'https://luxen-ui.com';

// Built design tokens (the same JSON the docs' <DesignTokens> reads) and the
// docs' form-token grouping, for rendering <DesignTokens> blocks as lists.
const TOKENS_PATH = resolve(PKG_ROOT, '..', 'design-tokens', 'dist', 'json', 'tokens.json');
const TOKENS = JSON.parse(await readFile(TOKENS_PATH, 'utf-8'));
const { FORM_TOKEN_GROUPS } = await import(
  resolve(DOCS_ROOT, '.vitepress', 'components', 'form-token-spec.js')
);

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
const ELEMENTS = manifest.elements.filter((e) => e.inSkill).map((e) => e.name);

// Normalized reference metadata (built by scripts/normalize-metadata.mjs from
// the CEM manifest + elements.json). The doc placeholders
// <ApiTable element section /> and <ElementSpec element /> are resolved from
// this — no regex parsing of inline `:data` payloads anymore.
const METADATA_PATH = resolve(PKG_ROOT, 'dist', 'metadata', 'index.json');
let META_BY_NAME = new Map();
try {
  const meta = JSON.parse(await readFile(METADATA_PATH, 'utf-8'));
  META_BY_NAME = new Map(meta.elements.map((e) => [e.name, e]));
} catch {
  throw new Error(
    `Missing ${METADATA_PATH}. Run \`pnpm run metadata\` (cem analyze + normalize-metadata) before preparing skill templates.`,
  );
}

async function main() {
  await mkdir(join(OUT_ROOT, 'elements'), { recursive: true });

  for (const element of ELEMENTS) {
    const docPath = join(DOCS_ROOT, 'elements', `${element}.md`);
    const raw = await readFile(docPath, 'utf-8');
    const transformed = await transformDoc(raw, join(DOCS_ROOT, 'elements'));
    await writeFile(join(OUT_ROOT, 'elements', `${element}.md`), transformed);
  }

  const foundationsDir = join(DOCS_ROOT, 'foundations');
  await mkdir(join(OUT_ROOT, 'foundations'), { recursive: true });
  for (const file of (await readdir(foundationsDir)).filter((f) => f.endsWith('.md')).toSorted()) {
    const raw = await readFile(join(foundationsDir, file), 'utf-8');
    await writeFile(join(OUT_ROOT, 'foundations', file), await transformDoc(raw, foundationsDir));
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

async function transformDoc(content, docDir) {
  // 1. Parse <script setup> imports to build variable -> file path map
  const imports = parseScriptImports(content, docDir);

  // 2. Strip <script setup> block
  content = content.replace(/<script setup>[\s\S]*?<\/script>\s*/m, '');

  // 2b. Strip page-level <style scoped> blocks — Vue SFC presentation CSS for
  //     the docs site, irrelevant to the skill. The `scoped` marker is SFC-only
  //     so this never matches a plain <style> inside an inlined code example.
  content = content.replace(/<style scoped>[\s\S]*?<\/style>\s*/m, '');

  // 3. Strip <Badge> components from headings
  content = content.replace(/\s*<Badge[^>]*>[^<]*<\/Badge>/g, '');

  // 4. Replace <ComponentWrapper> with inlined HTML examples
  const wrapperResult = await replaceComponentWrappers(content, imports);
  content = wrapperResult.content;

  // 5. Replace <AccessibilityTable> with markdown
  content = convertAccessibilityTable(content);

  // 5b. Replace <KeyboardTable> with markdown
  content = convertKeyboardTable(content);

  // 5c. Replace <ApiTable> with a markdown table
  content = convertApiTable(content);

  // 5d. Replace <ElementSpec> with a concise markdown line
  content = convertElementSpec(content);

  // 5d'. Replace <DesignTokens> with a token list
  content = convertDesignTokens(content);

  // 5e. Strip leftover docs-only components (interactive demos, figures)
  content = stripFigures(content);
  content = stripLeftoverComponents(content);

  // 5f. Point root-relative links at the published docs
  content = absolutizeDocsLinks(content);

  // 6. Convert VitePress container directives and file includes
  content = await convertVitePressBlocks(content, wrapperResult.inlinedFiles);

  // 7. Clean up extra blank lines
  content = content.replace(/\n{3,}/g, '\n\n').trim() + '\n';

  return content;
}

function parseScriptImports(content, docDir) {
  const imports = new Map();
  const setupMatch = content.match(/<script setup>([\s\S]*?)<\/script>/);
  if (!setupMatch) return imports;

  const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+?)(?:\?raw)?['"]/g;
  let match;
  while ((match = importRegex.exec(setupMatch[1])) !== null) {
    // Resolve relative path from docs root (imports use '../.vitepress/...')
    const filePath = resolve(docDir, match[2]);
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

// Accessibility criteria are doc-authored (not code-extracted), so this still
// reads the inline `:data`. Rendered as a bullet list — one criterion per line —
// to match the API-reference list style (no pipe escaping, long descriptions
// stay readable). Inline WCAG/RGAA links are stripped; they're noise in a skill.
// The optional `:references` prop (human-facing source links) is matched and
// dropped here on purpose — the actionable guidance already lives in `:rules`.
function convertAccessibilityTable(content) {
  const regex =
    /<AccessibilityTable\s+:data="(\[[\s\S]*?\])"\s*(?::rules="(\[[\s\S]*?\])"\s*)?(?::references="\[[\s\S]*?\]"\s*)?\/>/g;
  return content.replace(regex, (_, dataStr, rulesStr) => {
    let data;
    try {
      data = new Function(`return ${unescapeEntities(dataStr)}`)();
    } catch {
      return '';
    }

    const stripLinks = (s) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    const lines = [];
    for (const row of data) {
      lines.push(`- **${row.Check}** — ${stripLinks(row.Description)}`);
    }

    if (rulesStr) {
      let rules;
      try {
        rules = new Function(`return ${unescapeEntities(rulesStr)}`)();
      } catch {
        rules = [];
      }
      if (rules.length) {
        lines.push('');
        lines.push('### Rules');
        lines.push('');
        for (const rule of rules) {
          lines.push(`- ${rule}`);
        }
      }
    }

    return lines.join('\n');
  });
}

// Keyboard interactions are doc-authored too. Rendered as a bullet list with the
// key combo as inline code (e.g. `- \`Shift + Tab\` — …`).
function convertKeyboardTable(content) {
  const regex = /<KeyboardTable\s+:data="(\[[\s\S]*?\])"\s*\/>/g;
  return content.replace(regex, (_, dataStr) => {
    let data;
    try {
      data = new Function(`return ${unescapeEntities(dataStr)}`)();
    } catch {
      return '';
    }

    const lines = [];
    for (const row of data) {
      lines.push(`- \`${row.Key}\` — ${row.Description}`);
    }

    return lines.join('\n');
  });
}

// Shared HTML-entity unescaper for the `:data="[...]"` Vue attribute payloads.
// `&amp;` is undone last so an already-escaped `&lt;` is not double-decoded.
function unescapeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// Renders one bullet per metadata item for an API-reference section. A list
// (not a table) keeps long descriptions readable, needs no pipe escaping, and
// matches the convention AI agents are tuned on. Per section:
//   - **open**: `boolean` (default: `false`) — Whether the dialog is open
//   - **data-variant**: `primary | destructive` — Visual variant
//   - **getTextLabel()** → `string` — Returns the item's text label
//   - `--width` (default: `31rem`) — Dialog width
//   - `dialog` — The native `<dialog>` element   (slots / parts)
function renderSectionBullet(section, it) {
  let name;
  let head = '';
  let tail = '';

  if (
    section === 'cssProperties' ||
    section === 'cssParts' ||
    section === 'cssClasses' ||
    section === 'commands'
  ) {
    name = `\`${it.name}\``; // CSS tokens / selectors read as code, not bold
    if (section === 'cssProperties' && it.default != null) tail += ` (default: \`${it.default}\`)`;
  } else if (section === 'cssStates') {
    name = `\`:state(${it.name})\``; // the selector a consumer writes
  } else if (section === 'slots') {
    name = `**${it.name === '' ? '(default)' : it.name}**`;
  } else if (section === 'methods') {
    const sig = (it.params ?? []).map((p) => `${p.name}: ${p.type ?? 'unknown'}`).join(', ');
    name = `**${it.name}(${sig})**`;
    if (it.returns) head += ` → \`${it.returns}\``;
  } else if (section === 'properties') {
    name = `**${it.attribute ?? it.name}**`;
    if (it.type) head += `: \`${it.type}\``;
    if (it.default != null && it.default !== "''") tail += ` (default: \`${it.default}\`)`;
  } else if (section === 'attributes') {
    name = `**${it.name}**`;
    if (it.values?.length) head += `: \`${it.values.join(' | ')}\``;
  } else if (section === 'events') {
    name = `**${it.name}**`;
    if (it.cancelable) tail += ' (cancelable)';
  } else {
    name = `**${it.name}**`;
  }

  const desc = it.description ? ` — ${it.description}` : '';
  return `- ${name}${head}${tail}${desc}`;
}

// First-column keys that name a CSS token (rendered as `code`); every other
// first column (Attribute, Slot, Event, Method, Property, Command) is **bold**.
// LEGACY — only the inline `:data` fallback below uses this.
const CODE_NAME_KEYS = new Set(['Name', 'Class', 'Part']);

// LEGACY inline-data renderer. Migrated docs use <ApiTable element section />;
// this handles the not-yet-migrated `:data="[...]"` docs so the build stays
// green during the incremental rollout. Delete once every doc is migrated
// (big-bang) — see convertApiTable. As before, only inline array literals are
// supported; `:data="someVar"` references fall through to '' (matching prior
// behavior where such tags were stripped downstream).
function renderLegacyApiTable(dataStr) {
  let data;
  try {
    data = new Function(`return ${unescapeEntities(dataStr)}`)();
  } catch {
    return '';
  }
  if (!Array.isArray(data) || data.length === 0) return '';

  const lines = [];
  for (const row of data) {
    const keys = Object.keys(row);
    const nameKey = keys[0];
    const rawName = row[nameKey];
    if (rawName == null || rawName === '') continue;
    const name = CODE_NAME_KEYS.has(nameKey) ? `\`${rawName}\`` : `**${rawName}**`;
    let head = '';
    let tail = '';
    for (const key of keys.slice(1)) {
      if (key === 'Description') continue;
      const v = row[key];
      if (v == null || v === '' || v === '—') continue;
      if (key === 'Returns') head += ` → ${v}`;
      else if (key === 'Type' || key === 'Arguments' || key === 'Detail') head += `: ${v}`;
      else if (key === 'Default') tail += ` (default: ${v})`;
      else tail += ` (${key.toLowerCase()}: ${v})`;
    }
    const desc = row.Description ? ` — ${row.Description}` : '';
    lines.push(`- ${name}${head}${tail}${desc}`);
  }
  return lines.join('\n');
}

// Resolves <ApiTable element="x" section="y" /> from the normalized metadata
// (the single source of truth). Falls back to renderLegacyApiTable for docs
// still using the inline `:data` form, until they are all migrated.
function convertApiTable(content, scriptVars) {
  const regex = /<ApiTable\s+([^>]*?)\/>/g;
  return content.replace(regex, (_, attrs) => {
    const element = attrs.match(/element="([^"]*)"/)?.[1];
    const section = attrs.match(/section="([^"]*)"/)?.[1];
    if (element && section) {
      const el = META_BY_NAME.get(element);
      if (!el) throw new Error(`<ApiTable element="${element}"> — unknown element in metadata.`);
      const items = el[section];
      if (!Array.isArray(items)) {
        throw new Error(`<ApiTable element="${element}" section="${section}"> — unknown section.`);
      }
      return items.map((it) => renderSectionBullet(section, it)).join('\n');
    }
    const dataAttr = attrs.match(/:data="([\s\S]*?)"\s*$/)?.[1];
    if (dataAttr != null) return renderLegacyApiTable(dataAttr, scriptVars);
    return '';
  });
}

// Resolves <ElementSpec element="x" /> into a concise banner line from metadata,
// keeping the tag/selector and the element category (which signals whether to
// expect Shadow DOM / progressive enhancement).
function convertElementSpec(content) {
  const TYPE_LABEL = {
    native: 'Native HTML Element',
    progressive: 'Progressive Custom Element',
    custom: 'Custom Element (no Shadow DOM)',
    shadow: 'Custom Element · Shadow DOM',
  };
  const regex = /<ElementSpec\s+([^>]*?)\/>/g;
  return content.replace(regex, (_, attrs) => {
    const element = attrs.match(/element="([^"]*)"/)?.[1];
    if (element) {
      const el = META_BY_NAME.get(element);
      if (!el) throw new Error(`<ElementSpec element="${element}"> — unknown element in metadata.`);
      const display = el.isCustomElement ? `<${el.tag}>` : el.selector;
      const label = TYPE_LABEL[el.type];
      return label ? `**\`${display}\`** — ${label}` : `**\`${display}\`**`;
    }
    // LEGACY tag="…" type="…" form, until all docs migrate to element="…".
    const tag = attrs.match(/tag="([^"]*)"/)?.[1];
    if (!tag) return '';
    const label = TYPE_LABEL[attrs.match(/type="([^"]*)"/)?.[1]];
    return label ? `**\`<${tag}>\`** — ${label}` : `**\`<${tag}>\`**`;
  });
}

// Resolves <DesignTokens category="x" [group="y"] /> into one bullet per token,
// in the order the docs page shows them: name, default value, description.
// A `form` group is ordered by the docs' FORM_TOKEN_GROUPS, like the page.
function convertDesignTokens(content) {
  const regex = /<DesignTokens\s+([^>]*?)\/>/g;
  return content.replace(regex, (_, attrs) => {
    const category = attrs.match(/category="([^"]*)"/)?.[1];
    const group = attrs.match(/group="([^"]*)"/)?.[1];
    if (!category) return '';
    let tokens = TOKENS.filter((t) => t.category === category);
    if (group) {
      const names = Object.keys(FORM_TOKEN_GROUPS[group] ?? {});
      if (!names.length) throw new Error(`<DesignTokens group="${group}"> — unknown form group.`);
      tokens = names.map((n) => tokens.find((t) => t.name === n)).filter(Boolean);
    }
    if (!tokens.length) throw new Error(`<DesignTokens category="${category}"> — no tokens.`);
    return tokens
      .map((t) => `- \`${t.name}\` (default: \`${t.value}\`) — ${t.description}`)
      .join('\n');
  });
}

// Drops illustration components (`<FocusFigure name="…">caption</FocusFigure>`).
// A figure only shows what the surrounding prose and tables already state, and
// its caption refers to the picture. Matched by the `Figure` suffix, so paired
// components whose children are content (e.g. <ComponentWrapper>…) are kept.
function stripFigures(content) {
  return content.replace(/<([A-Z]\w*Figure)\b[^>]*>[\s\S]*?<\/\1>\s*/g, '');
}

// Root-relative markdown links resolve only on the docs site.
function absolutizeDocsLinks(content) {
  return content.replace(/\]\(\/(?!\/)/g, `](${DOCS_ORIGIN}/`);
}

// Strips leftover docs-only Vue components (interactive demos such as
// <NotDefinedPreview> or <*Demo>) that carry no skill-relevant output. The
// attribute matcher tolerates quoted values containing `>` (e.g. an inline
// `html='<l-... >'` prop). Must run BEFORE `<<<` file includes are inlined
// (convertVitePressBlocks) so PascalCase tags inside inlined .vue examples are
// never touched.
function stripLeftoverComponents(content) {
  const regex = /<[A-Z][A-Za-z0-9]*(?:\s+[\w:@-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/>/g;
  return content.replace(regex, '');
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
