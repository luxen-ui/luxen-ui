/*
 * cem-plugin: filter-private
 *
 * Keeps only the public API surface in the manifest. Removes:
 *   - members marked `privacy: private | protected`
 *   - members whose name starts with `_` (our private convention, e.g.
 *     `_selectTab`, `_modalKind`) — the analyzer doesn't always infer privacy
 *   - the matching reflected attribute entries
 *   - private CSS custom properties (`--_*`)
 *
 * Runs last in the plugin chain (see custom-elements-manifest.config.js) so the
 * other plugins can still read whatever they need first.
 */
function isPrivateName(name) {
  return typeof name === 'string' && name.startsWith('_');
}

export function filterPrivatePlugin() {
  return {
    name: 'luxen-filter-private',
    packageLinkPhase({ customElementsManifest }) {
      for (const mod of customElementsManifest.modules ?? []) {
        for (const decl of mod.declarations ?? []) {
          if (Array.isArray(decl.members)) {
            decl.members = decl.members.filter(
              (m) => m.privacy !== 'private' && m.privacy !== 'protected' && !isPrivateName(m.name),
            );
          }
          if (Array.isArray(decl.attributes)) {
            decl.attributes = decl.attributes.filter((a) => !isPrivateName(a.name));
          }
          if (Array.isArray(decl.cssProperties)) {
            decl.cssProperties = decl.cssProperties.filter(
              (p) => !String(p.name).startsWith('--_'),
            );
          }
        }
      }
    },
  };
}
