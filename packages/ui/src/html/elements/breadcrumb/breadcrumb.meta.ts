/*
 * Metadata sidecar for the breadcrumb (CSS-only, styled via `.l-breadcrumb` on a
 * native <nav> wrapping an <ol>/<li>/<a>). JSDoc-only — read by the
 * `native-meta` CEM plugin and emitted into dist/metadata/breadcrumb.json. Keep
 * in sync with src/css/elements/breadcrumb.css.
 */

/**
 * @summary A navigation trail showing the current page's position in the site hierarchy. Built on a native `<nav><ol>` per the WAI-ARIA APG pattern.
 *
 * @nativeElement nav
 * @selector .l-breadcrumb
 *
 * @attribute aria-label - Names the navigation landmark (use `"Breadcrumb"`).
 * @attribute aria-current - Set to `page` on the current crumb's `<a>`.
 * @attribute data-unstyled-links - Opt out of Luxen's link theming (color, underline, hover) so you can apply your own link class. Layout, separators, scroll, and current-page behavior stay.
 *
 * @cssClass .l-breadcrumb - Breadcrumb navigation on a `<nav>` wrapping an `<ol>` of `<li><a>` crumbs.
 *
 * @cssproperty [--gap=0.5rem] - Space between crumbs and around the separator.
 * @cssproperty [--separator-color=var(--l-color-text-tertiary)] - Separator glyph color.
 * @cssproperty [--separator='/'] - Divider glyph; any character (e.g. `'›'`) or a `url()` image.
 *
 * @example Basic
 * <nav class="l-breadcrumb" aria-label="Breadcrumb">
 *   <ol>
 *     <li><a href="/">Home</a></li>
 *     <li><a href="/products">Products</a></li>
 *     <li><a href="/products/bags" aria-current="page">Bags</a></li>
 *   </ol>
 * </nav>
 */
// oxlint-disable-next-line typescript/no-extraneous-class -- JSDoc-only metadata carrier.
export class BreadcrumbMeta {}
