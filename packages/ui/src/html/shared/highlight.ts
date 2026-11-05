import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { cls } from '../registry.js';

/** Fold case and strip diacritics so matching is accent/case-insensitive. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Class on every `<mark>` the highlight adds, so styles never reach an authored one. */
const MARK_CLASS = 'match';

/**
 * Normalize `text` one character at a time, remembering where each normalized
 * unit came from. Normalizing can change the length — a Hangul syllable
 * decomposes into jamo, a kana with dakuten into two code points, a stripped
 * accent into nothing — so offsets found in the normalized text must be mapped
 * back before they slice the original.
 */
function fold(text: string) {
  let folded = '';
  const start: number[] = [];
  const end: number[] = [];
  let i = 0;
  for (const char of text) {
    const unit = normalize(char);
    for (let k = 0; k < unit.length; k++) {
      start.push(i);
      end.push(i + char.length);
    }
    folded += unit;
    i += char.length;
  }
  return { folded, start, end };
}

/**
 * The parts of `text` matching the query, as sorted, non-overlapping
 * `[start, end)` offsets into `text`: the first occurrence of each
 * space-separated keyword, matched accent/case-insensitively like the default
 * filter.
 */
function matchRanges(text: string, query: string): [number, number][] {
  const keywords = fold(query).folded.split(/\s+/).filter(Boolean);
  if (keywords.length === 0) return [];
  const { folded, start, end } = fold(text);
  const ranges: [number, number][] = [];
  for (const kw of keywords) {
    const idx = folded.indexOf(kw);
    if (idx < 0) continue;
    let to = end[idx + kw.length - 1];
    // Keep trailing combining marks (folded to nothing) inside the match.
    while (to < text.length && normalize(text.slice(to, to + 1)) === '') to++;
    ranges.push([start[idx], to]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push(range);
  }
  return merged;
}

/** Wrap the parts of a plain label that match `query` in `<mark>`. */
export function highlightText(label: string, query: string): TemplateResult | string {
  const ranges = matchRanges(label, query);
  if (ranges.length === 0) return label;
  const parts: (TemplateResult | string)[] = [];
  let at = 0;
  for (const [from, to] of ranges) {
    parts.push(
      label.slice(at, from),
      html`<mark class=${MARK_CLASS}>${label.slice(from, to)}</mark>`,
    );
    at = to;
  }
  parts.push(label.slice(at));
  return html`${parts}`;
}

/**
 * Return a rich option's inner markup with the parts of its title and
 * description that match `query` wrapped in `<mark>`.
 *
 * Only text nodes are touched: each one is split around the match and the
 * matched slice moved into a `<mark>` element, so the option's own markup is
 * kept as authored and the query is never parsed as HTML. A match that spans
 * two text nodes (e.g. across an inline `<b>`) is not highlighted.
 */
function highlightRichHtml(markup: string, query: string): string {
  const template = document.createElement('template');
  template.innerHTML = markup;
  const zones = `.${cls('select-item-title')}, .${cls('select-item-description')}`;
  // One pass over the whole fragment, so text inside nested zones is seen once.
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest(zones) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  let marked = false;
  for (const node of nodes) {
    // Right to left, so earlier offsets stay valid while the node is split.
    const ranges = matchRanges(node.data, query);
    for (let r = ranges.length - 1; r >= 0; r--) {
      const [from, to] = ranges[r];
      const matched = node.splitText(from);
      matched.splitText(to - from);
      const mark = document.createElement('mark');
      mark.className = MARK_CLASS;
      matched.replaceWith(mark);
      mark.append(matched);
      marked = true;
    }
  }
  return marked ? template.innerHTML : markup;
}

/**
 * Highlights rich options, caching each one's output for the current query.
 * The list re-renders on every arrow key as well as on every keystroke; only a
 * new query needs the markup parsed again.
 */
export class RichHighlighter {
  private _query = '';
  private _cache = new Map<string, string>();

  highlight(markup: string, query: string): string {
    if (!query.trim()) return markup;
    if (query !== this._query) {
      this._query = query;
      this._cache.clear();
    }
    let out = this._cache.get(markup);
    if (out === undefined) {
      out = highlightRichHtml(markup, query);
      this._cache.set(markup, out);
    }
    return out;
  }
}
