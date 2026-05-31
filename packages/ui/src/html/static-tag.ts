import { unsafeStatic, type StaticValue } from 'lit/static-html.js';
import { tagName, type ElementBaseName } from './registry.js';

const _cache = new Map<ElementBaseName, StaticValue>();

/**
 * Prefix-aware static tag for use in Lit static-html templates.
 *
 * Resolves a base name to the registered tag (e.g. `staticTag('icon')` → `po-icon`
 * under `elementPrefix: 'po'`) so elements that render a child custom element inside
 * their own template stay prefix-aware. Without this, the hardcoded `<l-icon>` literal
 * is never defined under a custom prefix and the child never upgrades.
 *
 * Memoized: Lit keys its template cache on `StaticValue` identity, so a fresh
 * `unsafeStatic()` per render would bust the cache. The prefix is set once at startup
 * before any element renders, so a plain memo is correct. If runtime re-prefixing via
 * `setPrefix()` becomes a supported scenario, clear `_cache` there.
 */
export function staticTag(baseName: ElementBaseName): StaticValue {
  let t = _cache.get(baseName);
  if (!t) _cache.set(baseName, (t = unsafeStatic(tagName(baseName))));
  return t;
}
