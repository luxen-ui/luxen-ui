---
'luxen-ui': minor
---

Element reference metadata (properties, attributes, events, methods, slots, CSS parts, CSS custom properties, CSS classes and commands) is now generated from component source — JSDoc on the custom elements plus per-element `*.meta.ts` sidecars for the CSS-only native elements — via the Custom Elements Manifest analyzer. It is normalized into a single tooling-friendly format and exposed through the new `luxen-ui/metadata` (and `luxen-ui/metadata/<element>`) export. The documentation site and the generated AI skill now read this metadata instead of hand-maintained tables, keeping the reference in sync with the code.
