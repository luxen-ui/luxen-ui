import StyleDictionary from 'style-dictionary';
import { usesReferences, getReferences } from 'style-dictionary/utils';

/*
 * Custom name transform: joins the token path with `-` and applies the
 * platform prefix. Crucially preserves underscores in path segments (e.g.
 * `spacing-0_5` stays `--l-spacing-0_5`), unlike the built-in `name/kebab`
 * which converts `_` to `-`. Tailwind v4 uses underscores to encode decimal
 * points in token names (`--spacing-2_5` ≡ `p-2.5`), so we must preserve them.
 */
StyleDictionary.registerTransform({
  name: 'name/luxen',
  type: 'name',
  transform: (token, config) => {
    const prefix = config.prefix ? `${config.prefix}-` : '';
    return `${prefix}${token.path.join('-')}`;
  },
});

/*
 * Custom format: emits a CSS rule with all tokens that pass the filter.
 * Handles three value shapes from DTCG sources:
 *   - composite `{ light, dark }`  →  `light-dark(<light>, <dark>)`
 *   - single reference `"{path}"`  →  `var(--ref-name)`
 *   - literal string               →  emitted as-is
 */
function renderValue(value, dictionary) {
  if (typeof value === 'string') {
    if (!usesReferences(value)) return value;
    const refs = getReferences(value, dictionary.tokens, { usesDtcg: true });
    if (refs.length === 0) return value;
    // Single full-string reference → emit as var(--name).
    // Embedded references (rare) get var() substituted in place.
    let out = value;
    for (const ref of refs) {
      out = out.replace(`{${ref.path.join('.')}}`, `var(--${ref.name})`);
    }
    return out;
  }
  if (value && typeof value === 'object' && 'light' in value && 'dark' in value) {
    const l = renderValue(value.light, dictionary);
    const d = renderValue(value.dark, dictionary);
    return `light-dark(${l}, ${d})`;
  }
  return String(value);
}

function tokenSubset(token, subset) {
  if (subset === 'primitives') return /[\\/]1-primitives[\\/]/.test(token.filePath);
  if (subset === 'aliases') return /[\\/]2-aliases[\\/]/.test(token.filePath);
  return true;
}

/**
 * Recursively collect the set of token names reachable from a value via {ref}
 * pointers. Used to filter `primitives.css` down to ONLY the color primitives
 * actually referenced by aliases — the rest of the Tailwind palette (21 families)
 * is shippable on-demand via the Tailwind theme template, not by default.
 */
function collectRefs(value, dictionary, acc = new Set()) {
  if (typeof value === 'string') {
    if (!usesReferences(value)) return acc;
    const refs = getReferences(value, dictionary.tokens, { usesDtcg: true });
    for (const ref of refs) {
      if (acc.has(ref.name)) continue;
      acc.add(ref.name);
      // Walk transitively (border-overlay → border → gray.300, etc.)
      collectRefs(ref.original.$value, dictionary, acc);
    }
  } else if (value && typeof value === 'object') {
    if ('light' in value) collectRefs(value.light, dictionary, acc);
    if ('dark' in value) collectRefs(value.dark, dictionary, acc);
  }
  return acc;
}

/** Build the set of color primitive names referenced by any alias. */
function reachableColorPrimitives(dictionary) {
  const acc = new Set();
  for (const t of dictionary.allTokens) {
    if (!tokenSubset(t, 'aliases')) continue;
    collectRefs(t.original.$value, dictionary, acc);
  }
  const colors = new Set([...acc].filter((n) => n.startsWith('l-color-')));
  // Always ship base colors — they're tiny and universally useful as fallbacks.
  colors.add('l-color-white');
  colors.add('l-color-black');
  colors.add('l-color-transparent');
  return colors;
}

StyleDictionary.registerFormat({
  name: 'css/luxen',
  format: async ({ dictionary, options }) => {
    const selector = options?.selector ?? ':root';
    const header = options?.header ?? '';
    const subset = options?.subset ?? 'all';
    // Color emission policy:
    //   subset='primitives': keep only colors referenced by aliases (core 5 families)
    //   subset='palette-extended': emit ONLY the colors NOT in the core (21 families)
    //   anything else: no color filter
    const core =
      subset === 'primitives' || subset === 'palette-extended'
        ? reachableColorPrimitives(dictionary)
        : null;
    const blocks = [];
    for (const token of dictionary.allTokens) {
      if (subset === 'palette-extended') {
        // Only color primitives that are NOT in the core
        if (!tokenSubset(token, 'primitives')) continue;
        if (token.path[0] !== 'color') continue;
        if (core.has(token.name)) continue;
      } else {
        if (!tokenSubset(token, subset)) continue;
        if (core && token.path[0] === 'color' && !core.has(token.name)) continue;
      }
      const v = renderValue(token.original.$value, dictionary);
      const desc = token.original.$description
        ? `  /* ${token.original.$description.replace(/\*\//g, '*\\/')} */\n`
        : '';
      blocks.push(`${desc}  --${token.name}: ${v};`);
    }
    return `${header}${selector} {\n${blocks.join('\n')}\n}\n`;
  },
});

/*
 * Custom format: Tailwind v4 bridge.
 * Resets Tailwind defaults, then re-exposes Luxen primitives under Tailwind's
 * native names (`--color-gray-700`, etc.) so utilities like `text-gray-500` or
 * `bg-blue-100` resolve to the Luxen palette without any other Tailwind config.
 */
/**
 * Map a semantic alias token to a Tailwind utility class declaration.
 * Returns { className, prop } or null to skip.
 *
 *   color.text.primary       → text-primary             (color)
 *   color.surface             → bg-surface              (background-color)
 *   color.surface-overlay     → bg-surface-overlay      (background-color)
 *   color.bg.disabled         → bg-disabled             (background-color)
 *   color.bg.state.hover      → bg-state-hover          (background-color)
 *   color.bg.fill.brand       → bg-fill-brand           (background-color)
 *   color.bg.fill.info.soft   → bg-fill-info-soft       (background-color)
 *   color.border              → border-default          (border-color)
 *   color.border-interactive  → border-interactive      (border-color)
 *   color.divider             → border-divider          (border-color)
 *   backdrop / backdrop-strong → bg-backdrop(-strong)   (background-color)
 */
function utilityFor(token) {
  const p = token.path;
  if (p[0] === 'backdrop' || p[0] === 'backdrop-strong') {
    return { className: `bg-${p[0]}`, prop: 'background-color' };
  }
  if (p[0] !== 'color') return null;
  if (p[1] === 'text') {
    return { className: `text-${p.slice(2).join('-')}`, prop: 'color' };
  }
  if (p[1] === 'bg') {
    return { className: `bg-${p.slice(2).join('-')}`, prop: 'background-color' };
  }
  if (p[1] === 'surface') {
    return { className: 'bg-surface', prop: 'background-color' };
  }
  if (p[1] === 'surface-overlay') {
    return { className: 'bg-surface-overlay', prop: 'background-color' };
  }
  if (p[1] === 'border') {
    return { className: 'border-default', prop: 'border-color' };
  }
  if (p[1] && p[1].startsWith('border-')) {
    return { className: p[1], prop: 'border-color' };
  }
  if (p[1] === 'divider') {
    return { className: 'border-divider', prop: 'border-color' };
  }
  return null;
}

/**
 * Cobalt-style banner comment used to separate categories inside the bridge.
 * Optional `sub` adds a secondary line (e.g. a doc URL).
 */
function banner(title, sub = null) {
  const line = '▬'.repeat(77);
  const out = ['  /*', `  ${line}`, `    ${title}`];
  if (sub) out.push('', `    ${sub}`);
  out.push(`  ${line}`, '  */');
  return out.join('\n');
}

/**
 * Map a Tailwind utility class + property to the corresponding `@theme`
 * variable name in Tailwind v4's per-property namespaces:
 *   text-warning  (color)            → --text-color-warning
 *   bg-fill-brand (background-color) → --background-color-fill-brand
 *   border-interactive (border-color) → --border-color-interactive
 * https://github.com/tailwindlabs/tailwindcss/discussions/14658
 */
function themeVarFor(util) {
  const m = util.className.match(/^(text|bg|border)-(.+)$/);
  if (!m) return null;
  const ns = { text: 'text-color', bg: 'background-color', border: 'border-color' }[m[1]];
  return `--${ns}-${m[2]}`;
}

/**
 * Category bucket for a non-color primitive token, based on its name prefix.
 * Returns null for color primitives (handled separately).
 */
function primitiveCategory(token) {
  const head = token.path[0];
  if (head === 'color') return null;
  if (head === 'spacing' || head.startsWith('spacing-')) return 'spacing';
  if (head === 'radius' || head.startsWith('radius-')) return 'radius';
  if (head.startsWith('text-')) return 'typography';
  if (head.startsWith('font-weight-')) return 'font-weight';
  if (head.startsWith('font-')) return 'font-family';
  if (head.startsWith('tracking-')) return 'tracking';
  if (head.startsWith('leading-')) return 'leading';
  return 'other';
}

/** Category bucket for a utility class, based on its name prefix. */
function utilityCategory(className) {
  if (className.startsWith('text-')) return 'text';
  if (className.startsWith('bg-')) return 'background';
  if (className.startsWith('border-')) return 'border';
  return 'other';
}

StyleDictionary.registerFormat({
  name: 'css/tailwind-bridge',
  format: async ({ dictionary }) => {
    // Bridge model (white-label friendly):
    //   - Only the 5 color families actually referenced by Luxen aliases are
    //     mapped & active in `@theme inline`. Other palette families ship as
    //     commented oklch literals — uncomment to enable, or copy this whole
    //     file via `npx luxen-ui import tailwind` and customize.
    //   - Non-color primitives (spacing, radius, text, etc.) are all mapped.
    //   - Semantic aliases plug into Tailwind v4's per-property namespaces
    //     (`--text-color-*`, `--background-color-*`, `--border-color-*`) so
    //     `text-warning`, `bg-fill-info-soft`, etc. auto-generate utilities
    //     with all Tailwind modifiers (hover:, dark:, /opacity, …).

    const reachable = reachableColorPrimitives(dictionary);
    const isCoreColor = (t) => t.path[0] === 'color' && reachable.has(t.name);

    // Group non-color primitives by category.
    const nonColorByCategory = {};
    for (const token of dictionary.allTokens) {
      if (!tokenSubset(token, 'primitives')) continue;
      const cat = primitiveCategory(token);
      if (!cat) continue;
      const tailwindName = token.name.replace(/^l-/, '');
      (nonColorByCategory[cat] ??= []).push(`  --${tailwindName}: var(--${token.name});`);
    }

    // Core color mappings (single block).
    const coreColorMappings = [];
    const extendedByFamily = {};
    for (const token of dictionary.allTokens) {
      if (!tokenSubset(token, 'primitives')) continue;
      const p = token.path;
      if (p[0] !== 'color') continue;
      const tailwindName = token.name.replace(/^l-/, '');
      if (isCoreColor(token)) {
        coreColorMappings.push(`  --${tailwindName}: var(--${token.name});`);
      } else {
        const family = p[1] ?? 'base';
        (extendedByFamily[family] ??= []).push(
          `  /* --${tailwindName}: ${token.original.$value}; */`,
        );
      }
    }

    // Semantic alias → Tailwind theme variable (auto-generates utility classes).
    const aliasByCategory = {};
    for (const token of dictionary.allTokens) {
      if (!tokenSubset(token, 'aliases')) continue;
      const u = utilityFor(token);
      if (!u) continue;
      const themeVar = themeVarFor(u);
      if (!themeVar) continue;
      const cat = utilityCategory(u.className);
      (aliasByCategory[cat] ??= []).push(`  ${themeVar}: var(--${token.name});`);
    }

    // ─── Assemble @theme inline body with banners ───
    const NON_COLOR_ORDER = [
      ['typography', 'Typography (--text-*)'],
      ['font-family', 'Font Families (--font-*)'],
      ['font-weight', 'Font Weights (--font-weight-*)'],
      ['tracking', 'Letter Spacing (--tracking-*)'],
      ['leading', 'Line Height (--leading-*)'],
      ['radius', 'Radius (--radius-*)'],
      ['spacing', 'Spacing (--spacing-*)'],
    ];
    const themeBody = [];
    for (const [cat, title] of NON_COLOR_ORDER) {
      if (!nonColorByCategory[cat]) continue;
      themeBody.push('', banner(title), ...nonColorByCategory[cat]);
    }
    themeBody.push('', banner('Colors — Core (--color-*)'), ...coreColorMappings);

    // Extended palette — commented, grouped by family.
    const extendedLines = ['', banner('Colors — Extended (opt-in by uncommenting)')];
    for (const family of Object.keys(extendedByFamily).toSorted()) {
      extendedLines.push('', `  /* ${family} */`, ...extendedByFamily[family]);
    }
    themeBody.push(...extendedLines);

    // Semantic aliases → per-property namespaces (auto-generate utilities).
    const DOC_LINK = 'https://github.com/tailwindlabs/tailwindcss/discussions/14658';
    const ALIAS_ORDER = [
      ['text', 'Text colors (--text-color-*)', DOC_LINK],
      ['background', 'Backgrounds (--background-color-*)', null],
      ['border', 'Borders (--border-color-*)', null],
    ];
    for (const [cat, title, sub] of ALIAS_ORDER) {
      if (!aliasByCategory[cat]) continue;
      themeBody.push('', banner(title, sub), ...aliasByCategory[cat]);
    }

    return [
      '/* Luxen → Tailwind v4 bridge — opt-in. Structure:',
      '   • @theme        Resets every Tailwind default scale (Luxen owns them),',
      '                   sets global defaults (default-font-family, default-border-color),',
      '                   freezes breakpoints at v4 values.',
      '   • @theme inline Maps every Luxen primitive (spacing, radius, text, …) into',
      "                   Tailwind's native names so `p-4`, `rounded-md`, `text-sm`",
      '                   use Luxen values. Core color palette (5 families) → --color-*.',
      '                   Extended palette (21 families) ships commented — uncomment',
      '                   what you need, or copy via `npx luxen-ui import tailwind`.',
      '                   Semantic aliases → per-property namespaces (--text-color-*,',
      '                   --background-color-*, --border-color-*) so `text-primary`,',
      '                   `bg-fill-brand`, `border-interactive`, … auto-generate as',
      '                   utilities with full modifier support (hover:, dark:, /opacity).',
      '   Import after `tailwindcss`. */',
      '',
      '@theme {',
      '  /* ── Reset Tailwind default scales — Luxen ships its own ── */',
      '  --color-*: initial;',
      '  --radius-*: initial;',
      '  --spacing-*: initial;',
      '  --text-*: initial;',
      '  --font-*: initial;',
      '  --font-weight-*: initial;',
      '  --tracking-*: initial;',
      '  --leading-*: initial;',
      '',
      '  /* ── Tailwind-wide defaults (apply to bare `border`, font inheritance) ── */',
      '  --default-font-family: var(--l-font-sans);',
      '  --default-border-color: var(--l-color-border);',
      '',
      '  /* ── Breakpoints — frozen at v4 defaults, immune to Tailwind bumps ── */',
      '  --breakpoint-sm: 40rem;   /* 640px */',
      '  --breakpoint-md: 48rem;   /* 768px */',
      '  --breakpoint-lg: 64rem;   /* 1024px */',
      '  --breakpoint-xl: 80rem;   /* 1280px */',
      '  --breakpoint-2xl: 96rem;  /* 1536px */',
      '}',
      '',
      '@theme inline {',
      ...themeBody,
      '}',
      '',
    ].join('\n');
  },
});

/*
 * Custom format: flat JSON with per-token metadata, used by the docs and
 * the Skill generator. One entry per token with name, category, description,
 * resolved light/dark values, and the composed CSS value.
 */
function categorize(token) {
  const path = token.path;
  const [head] = path;
  // Spacing primitives are exposed in the design-tokens docs as their own
  // section — they're scale-y and useful to reference directly.
  if (head === 'spacing' || head.startsWith('spacing-')) return 'spacing';
  if (/[\\/]1-primitives[\\/]/.test(token.filePath)) return 'primitive';
  const [, ...rest] = path;
  if (head === 'size') return 'sizing';
  if (head === 'backdrop' || head === 'backdrop-strong') return 'surface';
  if (head === 'focus-ring') return 'border';
  if (head === 'color') {
    const second = rest[0];
    if (second === 'text') return 'text';
    if (second === 'bg' && rest[1] === 'fill') return 'fill';
    // Anything under color.border-*, color.divider → border bucket.
    if (second && (second.startsWith('border') || second === 'divider')) return 'border';
    // Everything else under color (surface, surface-overlay, bg.disabled, bg.state.*) → surface.
    return 'surface';
  }
  return 'other';
}

StyleDictionary.registerFormat({
  name: 'json/luxen-meta',
  format: async ({ dictionary }) => {
    const out = [];
    for (const token of dictionary.allTokens) {
      const v = token.original.$value;
      const composed = renderValue(v, dictionary);
      const entry = {
        name: `--${token.name}`,
        path: token.path,
        category: categorize(token),
        type: token.$type ?? token.original.$type,
        description: token.original.$description ?? '',
        value: composed,
      };
      if (v && typeof v === 'object' && 'light' in v && 'dark' in v) {
        entry.light = renderValue(v.light, dictionary);
        entry.dark = renderValue(v.dark, dictionary);
      }
      out.push(entry);
    }
    return JSON.stringify(out, null, 2) + '\n';
  },
});

const sources = ['src/tokens/1-primitives/**/*.@(js|json)', 'src/tokens/2-aliases/default.json'];

const sd = new StyleDictionary({
  usesDtcg: true,
  log: {
    warnings: 'warn',
    verbosity: 'default',
    errors: { brokenReferences: 'throw' },
  },
  source: sources,
  hooks: {
    filters: {
      primitives: (token) => /[\\/]1-primitives[\\/]/.test(token.filePath),
      aliases: (token) => /[\\/]2-aliases[\\/]/.test(token.filePath),
    },
  },
  platforms: {
    css: {
      buildPath: 'dist/css/',
      prefix: 'l',
      transforms: ['attribute/cti', 'name/luxen'],
      files: [
        {
          destination: 'primitives.css',
          format: 'css/luxen',
          options: {
            subset: 'primitives',
            header: '/* Luxen design-tokens — primitives (palette). */\n\n',
          },
        },
        {
          destination: 'aliases.css',
          format: 'css/luxen',
          options: {
            subset: 'aliases',
            header: '/* Luxen design-tokens — semantic aliases. */\n\n',
          },
        },
        {
          destination: 'palette.css',
          format: 'css/luxen',
          options: {
            subset: 'palette-extended',
            header:
              '/* Luxen design-tokens — extended palette.\n   The 21 Tailwind families not used by Luxen aliases, opt-in via\n   `@import "luxen-ui/css/tokens/palette"` for consumers who want the full set. */\n\n',
          },
        },
        {
          destination: 'index.css',
          format: 'css/luxen-index',
        },
      ],
    },
    tailwind: {
      buildPath: 'dist/tailwind/',
      prefix: 'l',
      transforms: ['attribute/cti', 'name/luxen'],
      files: [
        {
          destination: 'theme.css',
          format: 'css/tailwind-bridge',
        },
      ],
    },
    json: {
      buildPath: 'dist/json/',
      prefix: 'l',
      transforms: ['attribute/cti', 'name/luxen'],
      files: [
        {
          destination: 'tokens.json',
          format: 'json/luxen-meta',
        },
      ],
    },
  },
});

// The `index.css` for the CSS platform is a tiny stitcher; defining as a
// format that ignores the dictionary keeps everything inside Style Dictionary.
StyleDictionary.registerFormat({
  name: 'css/luxen-index',
  format: async () =>
    [
      '/* Luxen design-tokens entry — imports primitives + semantic aliases. */',
      "@import './primitives.css';",
      "@import './aliases.css';",
      '',
    ].join('\n'),
});

await sd.hasInitialized;
await sd.buildAllPlatforms();
