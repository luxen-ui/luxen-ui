// Custom Elements Manifest analyzer config.
//
// Source of truth = the element source under src/html/elements (NOT the built
// `dist/`/`cdn/` output — that strips JSDoc and minifies). The analyzer reads
// the JSDoc on each element class (@property/@event/@slot/@csspart/@cssproperty)
// plus our custom tags (@command, @nativeElement, @cssClass) via the plugins below.
//
// Output: dist/custom-elements.json (standard CEM). The downstream
// scripts/normalize-metadata.mjs turns that into the tooling-friendly
// dist/metadata/*.json.
import { jsdocExamplePlugin } from './scripts/cem-plugins/jsdoc-example.js';
import { commandPlugin } from './scripts/cem-plugins/command.js';
import { eventsPlugin } from './scripts/cem-plugins/events.js';
import { cssClassPlugin } from './scripts/cem-plugins/css-class.js';
import { nativeMetaPlugin } from './scripts/cem-plugins/native-meta.js';
import { filterPrivatePlugin } from './scripts/cem-plugins/filter-private.js';

export default {
  globs: ['src/html/elements/**/*.ts'],
  // *.styles.ts wrap CSS strings (no public API); *.meta.ts are the native
  // sidecars and are picked up explicitly by nativeMetaPlugin, not as classes.
  exclude: ['**/*.styles.ts', '**/*.test.ts', '**/*.spec.ts'],
  outdir: 'dist',
  litelement: true,
  dependencies: false,
  plugins: [
    jsdocExamplePlugin(),
    commandPlugin(),
    eventsPlugin(),
    cssClassPlugin(),
    nativeMetaPlugin(),
    // Runs last so it strips private members the other plugins may have read.
    filterPrivatePlugin(),
  ],
};
